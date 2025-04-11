from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os

app = Flask(__name__)
CORS(app)

# Configurations
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///trash_reports.db'
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize DB
db = SQLAlchemy(app)

# Model
class TrashReport(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    block = db.Column(db.String(50), nullable=False)
    floor = db.Column(db.String(50), nullable=False)
    area = db.Column(db.String(50), nullable=False)
    details = db.Column(db.String(200))
    image_path = db.Column(db.String(200))
    status = db.Column(db.String(20), default='Pending')
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)

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

        # 🧠 Dummy detection for now
        detections = ['plastic', 'paper']  # Just for simulation
        return jsonify({'success': True, 'filename': filename, 'detections': detections})

    return jsonify({'success': False, 'error': 'No file uploaded'}), 400

@app.route('/submit-report', methods=['POST'])
def submit_report():
    data = request.get_json()

    try:
        new_report = TrashReport(
            block=data['block'],
            floor=data['floor'],
            area=data['area'],
            details=data.get('details', ''),
            latitude=data['gps'].get('latitude'),
            longitude=data['gps'].get('longitude')
        )
        db.session.add(new_report)
        db.session.commit()

        return jsonify({'success': True, 'message': 'Report submitted successfully'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/admin/reports')
def view_reports():
    reports = TrashReport.query.order_by(TrashReport.id.desc()).all()
    return render_template('admin_dashboard.html', reports=reports)

@app.route('/update-status/<int:report_id>', methods=['POST'])
def update_status(report_id):
    data = request.get_json()
    report = TrashReport.query.get_or_404(report_id)
    report.status = data.get('status', 'Pending')
    db.session.commit()
    return jsonify({'success': True, 'message': 'Status updated'})

@app.route('/delete-report/<int:report_id>', methods=['DELETE'])
def delete_report(report_id):
    report = TrashReport.query.get_or_404(report_id)
    db.session.delete(report)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Report deleted'})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Create DB tables if not present
    app.run(debug=True)
