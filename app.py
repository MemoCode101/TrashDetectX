from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import firebase_admin
from firebase_admin import credentials, firestore
from Detect import detect_trash_yolo

app = Flask(__name__)
CORS(app, resources={r"/static/*": {"origins": "http://127.0.0.1:3000"}})

# Firebase configuration
cred = credentials.Certificate("firebase_config.json")  # Your Firebase service account key JSON file
firebase_admin.initialize_app(cred)
db = firestore.client()

# Upload folder configuration
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size

# Routes
@app.route('/')
def home():
    return render_template('report.html')

@app.route('/upload', methods=['POST'])
def upload_image():
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
    data = request.get_json()
    try:
        new_report = {
            'block': data['block'],
            'floor': data['floor'],
            'area': data['area'],
            'details': data.get('details', ''),
            'status': 'Pending',
            'latitude': data['gps'].get('latitude'),
            'longitude': data['gps'].get('longitude'),
            'filename': data.get('filename', ''),
            'detected_image': data.get('detected_image_path', '')
        }
        db.collection('trash_reports').add(new_report)
        return jsonify({'success': True, 'message': 'Report submitted successfully'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/admin/reports')
def view_reports():
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
    data = request.get_json()
    try:
        db.collection('trash_reports').document(report_id).update({'status': data.get('status', 'Pending')})
        return jsonify({'success': True, 'message': 'Status updated'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/delete-report/<string:report_id>', methods=['DELETE'])
def delete_report(report_id):
    try:
        db.collection('trash_reports').document(report_id).delete()
        return jsonify({'success': True, 'message': 'Report deleted'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/admin/dashboard')
def admin_dashboard():
    return render_template('dashboard.html')

@app.route('/detected/<path:filename>')
def serve_detected_images(filename):
    return send_from_directory('static/detected', filename)

if __name__ == '__main__':
    app.run(debug=True, port=5000)

if __name__ == '__main__':
    app.run(debug=True)