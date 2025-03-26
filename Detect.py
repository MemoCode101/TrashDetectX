import cv2
import os
from ultralytics import YOLO

print("🚀 Starting YOLOv8 detection...")  # Debug print

# Load the trained YOLOv8 model
model = YOLO("runs/detect/train/yolov8s_100epochs/weights/best.pt")
print("✅ Model loaded successfully!")

# Set the input file path
input_path = r"C:\Users\23101B0049\litter-detection-master\vid2.mp4"

# Check if the input file exists
if not os.path.exists(input_path):
    print(f"❌ ERROR: File not found at {input_path}")
    exit()

print(f"📂 Processing file: {input_path}")

# Detect if it's an image or video
file_ext = os.path.splitext(input_path)[-1].lower()

if file_ext in [".jpg", ".jpeg", ".png"]:  # IMAGE DETECTION
    print("🖼️ Image detected. Running inference...")
    results = model.predict(source=input_path, save=True)
    print("✅ Image detection completed!")

    output_folder = "runs/detect/predict"
    saved_images = [f for f in os.listdir(output_folder) if f.endswith((".jpg", ".png"))]

    if saved_images:
        latest_output = os.path.join(output_folder, saved_images[0])
        print(f"🖼️ Opening detected image: {latest_output}")
        output_img = cv2.imread(latest_output)

        display_img = cv2.resize(output_img, (output_img.shape[1] // 2, output_img.shape[0] // 2))
        cv2.imshow("YOLOv8 Image Detection", display_img)
        cv2.waitKey(0)
        cv2.destroyAllWindows()
    else:
        print("❌ No detection output found!")

elif file_ext in [".mp4", ".avi", ".mov"]:  # VIDEO DETECTION
    print("🎥 Video detected. Running inference...")
    cap = cv2.VideoCapture(input_path)

    if not cap.isOpened():
        print("❌ ERROR: Cannot open video file!")
        exit()

    frame_width = int(cap.get(3))
    frame_height = int(cap.get(4))
    fps = int(cap.get(cv2.CAP_PROP_FPS))

    output_path = r"C:\Users\23101B0049\litter-detection-master\output.mp4"
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (frame_width, frame_height))

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            print("📌 End of video reached!")
            break  

        results = model.predict(frame)

        for result in results:
            for box in result.boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                conf = box.conf[0]
                cls = int(box.cls[0])
                label = f"{model.names[cls]} {conf:.2f}"

                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                cv2.putText(frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

        display_frame = cv2.resize(frame, (frame_width // 2, frame_height // 2))
        cv2.imshow("YOLOv8 Video Detection", display_frame)
        out.write(frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            print("🚪 Exiting video processing...")
            break

    cap.release()
    out.release()
    cv2.destroyAllWindows()
    print("✅ Video processing completed!")

else:
    print("❌ Unsupported file format! Use an image (.jpg, .png) or video (.mp4, .avi).")




