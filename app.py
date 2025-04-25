from flask import Flask, render_template, request, jsonify, send_from_directory, session, redirect, url_for
from flask_cors import CORS
from flask_session import Session
from werkzeug.utils import secure_filename
import os
import firebase_admin
from firebase_admin import credentials, firestore
from google.api_core import retry
from Detect import detect_trash_yolo
import webbrowser
import threading

app = Flask(__name__)
CORS(app, resources={r"/static/*": {"origins": "http://127.0.0.1:3000"}})

# Session configuration
app.config['SECRET_KEY'] = 'your-secret-key-here'  # Change this to a secure random key
app.config['SESSION_TYPE'] = 'filesystem'
Session(app)

# Firebase configuration
try:
    cred = credentials.Certificate("firebase_config.json")
    firebase_admin.initialize_app(cred, {
        'projectId': 'trash-detector-58bb6'  # Replace with your actual project ID
    })
    db = firestore.client()
    print("✅ Firebase initialized successfully")
except Exception as e:
    print(f"❌ Firebase initialization failed: {str(e)}")
    raise

# Upload folder configuration
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size

# Routes
@app.route('/')
def home():
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        # This is a placeholder; actual login is handled by Firebase in auth.js
        # We'll rely on auth.js to set session data via a callback
        return render_template('login.html')
    return render_template('login.html')

@app.route('/auth-callback', methods=['POST'])
def auth_callback():
    # This route is called by auth.js after successful Firebase login
    user = request.json.get('user')
    if user:
        session['logged_in'] = True
        session['user_email'] = user.get('email')
        return jsonify({'success': True, 'redirect': url_for('index')})
    return jsonify({'success': False, 'error': 'Authentication failed'}), 401

@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    session.pop('user_email', None)
    return redirect(url_for('login'))

@app.route('/index')
def index():
    if 'logged_in' not in session or not session['logged_in']:
        return redirect(url_for('login'))
    return render_template('index.html')

@app.route('/report')
def report():
    if 'logged_in' not in session or not session['logged_in']:
        return redirect(url_for('login'))
    return render_template('report.html')

@app.route('/upload', methods=['POST'])
def upload_image():
    if 'logged_in' not in session or not session['logged_in']:
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401
    file = request.files.get('file')
    if file:
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        file.save(filepath)

        try:
            detections, saved_image_path = detect_trash_yolo(filepath)
            print("Detections:", detections)

            if detections:
                return jsonify({
                    'success': True,
                    'filename': filename,
                    'detections': detections,
                    'detected_image_path': saved_image_path
                })
            else:
                return jsonify({'success': False, 'error': 'No trash detected'})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)})

    return jsonify({'success': False, 'error': 'No file uploaded'}), 400

@app.route('/submit-report', methods=['POST'])
def submit_report():
    if 'logged_in' not in session or not session['logged_in']:
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401

    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No JSON data provided'}), 400

        new_report = {
            'block': data.get('block', ''),
            'floor': data.get('floor', ''),
            'area': data.get('area', ''),
            'details': data.get('details', ''),
            'status': 'Pending',
            'latitude': data.get('gps', {}).get('latitude'),
            'longitude': data.get('gps', {}).get('longitude'),
            'filename': data.get('filename', ''),
            'detected_image': data.get('detected_image_path', ''),
            'detections': data.get('detections', [])
        }
        
        @retry.Retry(predicate=retry.if_transient_error, initial_delay=1, maximum=10.0, multiplier=2)
        def add_report():
            print("Attempting to add report to Firestore")
            db.collection('trash_reports').add(new_report)

        add_report()
        return jsonify({'success': True, 'message': 'Report submitted successfully'})
    except Exception as e:
        print(f"Error in submit_report: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/admin/reports')
def view_reports():
    if 'logged_in' not in session or not session['logged_in']:
        return redirect(url_for('login'))
    try:
        reports_ref = db.collection('trash_reports').order_by("block")
        docs = reports_ref.stream()
        reports = []
        for doc in docs:
            report = doc.to_dict()
            report['id'] = doc.id
            reports.append(report)
        return render_template('dashboard.html', reports=reports)
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/update-status/<string:report_id>', methods=['POST'])
def update_status(report_id):
    if 'logged_in' not in session or not session['logged_in']:
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401
    data = request.get_json()
    try:
        db.collection('trash_reports').document(report_id).update({'status': data.get('status', 'Pending')})
        return jsonify({'success': True, 'message': 'Status updated'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/delete-report/<string:report_id>', methods=['DELETE'])
def delete_report(report_id):
    if 'logged_in' not in session or not session['logged_in']:
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401
    try:
        db.collection('trash_reports').document(report_id).delete()
        return jsonify({'success': True, 'message': 'Report deleted'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/admin/dashboard')
def admin_dashboard():
    if 'logged_in' not in session or not session['logged_in']:
        return redirect(url_for('login'))
    return render_template('dashboard.html')

@app.route('/detected/<path:filename>')
def serve_detected_images(filename):
    return send_from_directory('static/detected', filename)

def open_browser():
    webbrowser.open_new('http://127.0.0.1:5000/')

if __name__ == '__main__':
    threading.Timer(1, open_browser).start()  # Open browser after 1 second
    app.run(debug=True, port=5000)