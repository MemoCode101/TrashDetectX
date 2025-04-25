const auth = firebase.auth();

// In auth.js (adjust based on your current implementation)
function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            return fetch('/auth-callback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user: { email: user.email } })
            }).then(response => response.json()).then(data => {
                if (data.success) {
                    window.location.href = data.redirect;
                } else {
                    errorMessage.textContent = data.error;
                }
            });
        })
        .catch((error) => {
            errorMessage.textContent = error.message;
        });
}

function signup() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            return fetch('/auth-callback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user: { email: user.email } })
            }).then(response => response.json()).then(data => {
                if (data.success) {
                    window.location.href = data.redirect;
                } else {
                    errorMessage.textContent = data.error;
                }
            });
        })
        .catch((error) => {
            errorMessage.textContent = error.message;
        });
}

function googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    const errorMessage = document.getElementById('error-message');

    firebase.auth().signInWithPopup(provider)
        .then((result) => {
            const user = result.user;
            return fetch('/auth-callback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user: { email: user.email } })
            }).then(response => response.json()).then(data => {
                if (data.success) {
                    window.location.href = data.redirect;
                } else {
                    errorMessage.textContent = data.error;
                }
            });
        })
        .catch((error) => {
            errorMessage.textContent = error.message;
        });
}


function logout() {
    auth.signOut().then(() => {
        window.location.href = "login.html";
    });
}
