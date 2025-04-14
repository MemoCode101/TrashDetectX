from ultralytics import YOLO
import os

# Load the trained model once
model_path = "runs/detect/train/yolov8s_100epochs/weights/best.pt"
model = YOLO(model_path)
print(f"✅ YOLOv8 model loaded from {model_path}")

def detect_trash_yolo(image_path):
    if not os.path.exists(image_path):
        print(f"❌ File not found: {image_path}")
        return [], None

    # Perform detection and save image with boxes
    results = model.predict(source=image_path, save=True, conf=0.25, project="static/detected", name="images", exist_ok=True)

    detected_classes = []
    for result in results:
        for cls_id in result.boxes.cls.tolist():
            class_name = model.names[int(cls_id)]
            detected_classes.append(class_name)

    # Get the path of the saved image directly from results
    saved_image_path = os.path.join(results[0].save_dir, os.path.basename(image_path))
    print(f"Saved image path: {saved_image_path}")  # Debug print

    # Return a clean relative path
    relative_path = os.path.relpath(saved_image_path, os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")).replace("\\", "/")
    return list(set(detected_classes)), relative_path