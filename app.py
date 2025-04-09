from flask import Flask, request, jsonify, render_template
import os
import cv2
import numpy as np
from ultralytics import YOLO

app = Flask(__name__)

# Path to your trained YOLOv8 model
MODEL_PATH = r"C:\Users\23101B0049\litter-detection-master\runs\detect\train\yolov8n_100epochs\weights\best.pt"

# Load the YOLO model
model = YOLO(MODEL_PATH)

# Ensure the upload folder exists
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Simulated database (for testing only)
REPORTS = []

@app.route('/')
def home():
    return render_template('report.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Save the uploaded file
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)

    # Perform object detection
    results = model(file_path)

    detections = []
    for result in results:
        boxes = result.boxes  # Access bounding boxes

        for box in boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())  # Bounding box coordinates
            conf = float(box.conf[0].item())  # Confidence score
            class_id = int(box.cls[0].item())  # Class ID

            # Get class name from model
            class_name = model.model.names[class_id] if hasattr(model.model, 'names') else str(class_id)

            detections.append({
                "class": class_name,
                "confidence": conf,
                "bbox": [x1, y1, x2, y2]
            })

    return jsonify({"detections": detections})


# ✅ NEW ROUTE to handle manual report submission
@app.route('/submit-report', methods=['POST'])
def submit_report():
    data = request.get_json()
    
    # Extract submitted values
    block = data.get("block")
    floor = data.get("floor")
    area = data.get("area")
    details = data.get("details")
    gps = data.get("gps", {})
    
    # For now, just return the received data
    return jsonify({
        "message": "Report received successfully!",
        "data": {
            "block": block,
            "floor": floor,
            "area": area,
            "details": details,
            "gps": gps
        }
    })



if __name__ == '__main__':
    app.run(debug=True, port=5000)
