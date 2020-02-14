let userName;
let typeCar;
let fechaRecogida;
let fechaEntrega;
let lugarRecogida;
let lugarEntrega;
let totalPagar;
let modoPago;

function initApp() {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // User is signed in.
            if (userName != null) {
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

function registerUser() {
    var email = document.getElementById("orangeForm-email").value;
    var password = document.getElementById("orangeForm-pass").value;
    userName = document.getElementById("orangeForm-name").value;

    firebase.auth().createUserWithEmailAndPassword(email, password).then(function () {
        alert("Registro Exitoso!!");
        firebase.auth().signInWithEmailAndPassword(email, password).then(function () {
            location.reload()
        });
    }).catch(function (error) {
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

function authUser() {
    var email = document.getElementById("defaultForm-email").value;
    var password = document.getElementById("defaultForm-pass").value;
    firebase.auth().signInWithEmailAndPassword(email, password).then(function () {
            location.reload()
        }
    ).catch(function (error) {
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

function addListenerToRentCar(event) {

    $("#modalRentCar").modal();
    let domElement = event.composedPath()[2];
    let carName = domElement.getElementsByClassName("card-title font-weight-bold");
    typeCar = carName[0].innerText;
}

function rentCar() {

    fechaRecogida = document.getElementById('form_fecha_recogida').value;
    fechaEntrega = document.getElementById('form_fecha_entrega').value;
    lugarRecogida = document.getElementById('form_lugar_recogida').value;
    lugarEntrega = document.getElementById('form_lugar_entrega').value;

    if(fechaRecogida !== "" && fechaEntrega !== "" && lugarRecogida !== "" && lugarEntrega !== ""){
        $('#modalRentCar').modal('hide');
        $('#modalPayment').modal();

        totalPagar = calcularCosto(jsonCar[typeCar].precio, fechaRecogida, fechaEntrega);
        document.getElementById('totalPagar').innerHTML  = "Total a pagar: " + totalPagar;

    } else {
        alert("Debe Llenar Todos los Campos");
    }

}

function calcularCosto(precio, fechainicio, fechafin) {

    let inicio = fechainicio.substring(3, 5);
    let fin = fechafin.substring(3, 5);
    let totalDias = fin - inicio + 1;
    return precio * totalDias
}

function metodoPago() {

    if (document.getElementById('exampleRadios1').checked) {
        modoPago = document.getElementById('exampleRadios1').value;
    }else if (document.getElementById('exampleRadios2').checked){
        modoPago = document.getElementById('exampleRadios2').value;
    }else {
        modoPago = document.getElementById('exampleRadios3').value;
    }
}

function payment() {
    var db = firebase.firestore();
    let userUID = firebase.auth().currentUser;
    metodoPago();

    if (userUID != null) {
        db.collection("rents").add({
            tipoAuto: typeCar,
            lugarEntrega: lugarEntrega,
            lugarRecogida: lugarRecogida,
            fechaEntrega: fechaEntrega,
            fechaRecogida: fechaRecogida,
            totalPagar: totalPagar,
            metodoPago: modoPago,
            uuid : firebase.auth().currentUser.uid
        }).then(function () {
            alert("El auto ha sido alquilado con exito!!");
        }).catch(function (error) {
            alert("No se pudo realizar la transacción!!");
            });
        $('#modalPayment').modal('hide');
    } else {
        alert("Debe Iniciar Sesión")
    }

}


let jsonCar = {
    "CHEVROLET CAVALIER":
        {
            "name": "CHEVROLET CAVALIER",
            "precio": 65
        },
    "HYUNDAI IONIQ":
        {
            "name": "HYUNDAI IONIQ",
            "precio": 80
        },
    "CHEVROLET SAIL":
        {
            "name": "CHEVROLET SAIL",
            "precio": 50
        },
    "CHEVROLET AVEO EMOTION":
        {
            "name": "CHEVROLET AVEO EMOTION",
            "precio": 55
        },
    "FORD EXPLORER":
        {
            "name": "FORD EXPLORER",
            "precio": 120
        },
    "HYUNDAI SANTA FE":
        {
            "name": "HYUNDAI SANTA FE",
            "precio": 90
        },
    "KIA RIO R":
        {
            "name": "KIA RIO R",
            "precio": 60
        },
    "RENAULT DUSTER":
        {
            "name": "RENAULT DUSTER",
            "precio": 70,
            "city": "New York"
        },
    "GRAND VITARA SZ":
        {
            "name": "GRAND VITARA SZ",
            "precio": 85
        },
    "HYUNDAI H1":
        {
            "name": "HYUNDAI H1",
            "precio": 120
        },
    "CHEVROLET VAN N300":
        {
            "name": "CHEVROLET VAN N300",
            "precio": 70
        },
    "CHEVROLET ORLANDO":
        {
            "name": "CHEVROLET ORLANDO",
            "precio": 90
        }
};

window.onload = function () {
    initApp();
    document.querySelectorAll(".btn.btn-small.btn-alquilar.btn-rounded").forEach(item => {
        item.addEventListener('click', event => {
            addListenerToRentCar(event)
        });
    })
};

