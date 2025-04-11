// ✅ Do NOT use "export" in browser script

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDNqPyu-TDSiLWTNY-54DiwEq6zKuPGnwQ",
  authDomain: "trash-detector-58bb6.firebaseapp.com",
  projectId: "trash-detector-58bb6",
  storageBucket: "trash-detector-58bb6.appspot.com", // ✅ corrected
  messagingSenderId: "989108826823",
  appId: "1:989108826823:web:ea4230111588a87a7ec4e2",
  measurementId: "G-HH0N5V6N7R"
};

// Initialize Firebase only once
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
