const auth = firebase.auth();

function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            window.location.href = "index.html"; 
        })
        .catch(error => {
            document.getElementById("error-message").innerText = error.message;
        });
}

function signup() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    auth.createUserWithEmailAndPassword(email, password)
        .then(() => {
            window.location.href = "index.html";  
        })
        .catch(error => {
            document.getElementById("error-message").innerText = error.message;
        });
}

// 📌 Google Sign-In
function googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    
    firebase.auth().signInWithPopup(provider)
        .then(result => {
            alert("Google Sign-In Successful!");
            window.location.href = "index.html"; 
        })
        .catch(error => alert(error.message));
}


function logout() {
    auth.signOut().then(() => {
        window.location.href = "login.html";
    });
}
