//  // Import Firebase modules
// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
// import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


// const firebaseConfig = {
//     apiKey: "AIzaSyAWcOInMh7q2AXksiGHpJMe1UNVL3DNikw",
//     authDomain: "alumnivdt.firebaseapp.com",
//     projectId: "alumnivdt",
//     storageBucket: "alumnivdt.firebasestorage.app",
//     messagingSenderId: "46462113578",
//     appId: "1:46462113578:web:047a8c62ad8c500e00b053",
//     measurementId: "G-SKH7C2RH3R"
//   };

// Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// const googleProvider = new GoogleAuthProvider();





// Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyDNqPyu-TDSiLWTNY-54DiwEq6zKuPGnwQ",
  authDomain: "trash-detector-58bb6.firebaseapp.com",
  projectId: "trash-detector-58bb6",
  storageBucket: "trash-detector-58bb6.firebasestorage.app",
  messagingSenderId: "989108826823",
  appId: "1:989108826823:web:ea4230111588a87a7ec4e2",
  measurementId: "G-HH0N5V6N7R"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}