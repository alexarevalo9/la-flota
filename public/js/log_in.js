var userName;

function initApp(){
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in.
            if(userName != null){
                var updateNameProfile = firebase.auth().currentUser;
                updateNameProfile.updateProfile({
                    displayName: userName
                });
            }

            document.getElementById('initsesion').textContent = 'Cerrar Sesión';
            document.getElementById('initregister').textContent = user.displayName;

        } else {
            // User is signed out.
            document.getElementById('initsesion').textContent = 'Iniciar Sesión';
            document.getElementById('initregister').textContent = 'Registrarse';
        }
    });
}

window.onload = function() {
    initApp();
};

function registerUser(){
    var email = document.getElementById("orangeForm-email").value;
    var password = document.getElementById("orangeForm-pass").value;
    userName = document.getElementById("orangeForm-name").value;

    firebase.auth().createUserWithEmailAndPassword(email, password).then(function () {
        alert("Registro Exitoso!!");
        firebase.auth().signInWithEmailAndPassword(email, password).then(function () {
            location.reload()
        });
    }).catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
    });
}

function signOutUser() {
    if (firebase.auth().currentUser) {
        firebase.auth().signOut().then(function () {
            location.reload()
        });
    }
}

function authUser(){
    var email = document.getElementById("defaultForm-email").value;
    var password = document.getElementById("defaultForm-pass").value;
    firebase.auth().signInWithEmailAndPassword(email, password).then(function () {
            location.reload()
        }
    ).catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        alert(errorCode, errorMessage);
    });
}

function myAccount() {
    if (firebase.auth().currentUser) {
        window.location.href = "myaccount.html";
    }
}
