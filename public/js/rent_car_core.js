let userName;

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

function rentCar(event){
    $("#modalRentCar").modal();
    let domElement = event.composedPath()[2];
    let carName = domElement.getElementsByClassName("card-title font-weight-bold");
    console.log(carName[0].innerText);
}

function openCity(evt, cityName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the link that opened the tab
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " active";
}

window.onload = function () {
    initApp();
    document.querySelectorAll(".btn.btn-small.btn-alquilar.btn-rounded").forEach(item => {
        item.addEventListener('click', event => {
            rentCar(event)
        });
    })
};

