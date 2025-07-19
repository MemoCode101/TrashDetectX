# 🚮 Smart Trash Monitoring System using YOLOv8, Flask, and Firebase

> 📸 AI-Powered Trash Detection with Location Tracking & Admin Dashboard

A full-stack solution for smart campus cleanliness. Users can capture and report trash images, which are verified using a trained YOLOv8 model. Reports are stored in Firebase Firestore and visualized in an interactive Admin Dashboard with status management and location links.

---

## 🔥 Features

- 🧠 **YOLOv8 Trash Detection** (e.g., wrappers, cans, plastic)
- 📍 **EXIF-based Location Extraction** (if image has GPS)
- ☁️ **Firebase Firestore + Storage** for report storage
- 📊 **Admin Dashboard** to view, resolve, or delete reports
- 📷 **Image Modal Viewer** with detection boxes
- 🧼 Smart, efficient way to keep college buildings clean

---

## 🖥️ Tech Stack

| Frontend          | Backend          | AI/ML Model      | Cloud / DB       |
|------------------|------------------|------------------|------------------|
| HTML5, CSS3, JS   | Flask (Python)   | YOLOv8 (Ultralytics) | Firebase Firestore & Storage |

---

## 📌 Project Workflow

1. **User Uploads Trash Image** through a Web Form
2. **YOLOv8** detects trash and returns bounding boxes
3. **EXIF GPS Data** is extracted from image (if available)
4. Data is **stored in Firebase** (Firestore + Storage)
5. **Admin Dashboard** shows:
   - Block, Floor, Area, Status
   - Trash Type Detected
   - Image with bounding boxes
   - Google Maps location (if GPS exists)


