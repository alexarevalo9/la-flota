let userName;
let typeCar;
let fechaRecogida;
let fechaEntrega;
let lugarRecogida;
let lugarEntrega;
let totalPagar;
let modoPago;
let allrentcars = [];
let alluserrentscars = [];
let idCar;
let urlImage;

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

            userOrAdmin();

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
        $('#modalLoginForm').modal('hide');
        firebase.auth().signOut().then(function () {
            window.location.href = 'index.html';
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
        $('#modalRegisterForm').modal('hide');
        window.location.href = "myaccount.html";
    }
}

function addListenerToRentCar(event) {

    $("#modalRentCar").modal();
    let domElement = event.composedPath()[2];
    let carName = domElement.getElementsByClassName("card-title font-weight-bold");
    typeCar = carName[0].innerText;
    let respCar = searchCar(typeCar);
    document.getElementById("image-auto-rent").src = respCar[0].source;
    document.getElementById('title-image-rent').innerHTML = typeCar;
    document.getElementById('description-car-image').innerHTML = "Empezar desde " + respCar[0].precio + "$ / por día";
}

function rentCar() {

    fechaRecogida = document.getElementById('form_fecha_recogida').value;
    fechaEntrega = document.getElementById('form_fecha_entrega').value;
    lugarRecogida = document.getElementById('form_lugar_recogida').value;
    lugarEntrega = document.getElementById('form_lugar_entrega').value;

    if (fechaRecogida !== "" && fechaEntrega !== "" && lugarRecogida !== "" && lugarEntrega !== "") {
        $('#modalRentCar').modal('hide');
        $('#modalPayment').modal();
        let respCar = searchCar(typeCar);
        totalPagar = calcularCosto(respCar[0].precio, fechaRecogida, fechaEntrega);
        document.getElementById('totalPagar').innerHTML = "Total a pagar: " + totalPagar;

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
    } else if (document.getElementById('exampleRadios2').checked) {
        modoPago = document.getElementById('exampleRadios2').value;
    } else {
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
            uuid: firebase.auth().currentUser.uid
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

function addListenersRentCar() {
    document.querySelectorAll(".btn.btn-small.btn-alquilar.btn-rounded").forEach(item => {
        item.addEventListener('click', event => {
            addListenerToRentCar(event)
        });
    });
}

function getUserDataFireBase() {

    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {

            var displayName = user.displayName;
            var email = user.email;

            if (document.getElementById("first-item-nav") != null) {
                let itemfirst = document.getElementById("first-item-nav");
                itemfirst.innerHTML = "<i class=\"fas fa-user-circle mr-4\"></i>Información Personal";
                let itemsecond = document.getElementById("second-item-nav");
                itemsecond.innerHTML = "<i class=\"fas fa-car mr-4\"></i>Autos Rentados";
                itemsecond.onclick = getRentCarUsers();
                let thirdfirst = document.getElementById("third-item-nav");
                thirdfirst.innerHTML = "<i class=\"fas fa-credit-card mr-4\"></i>Metodos de Pagos";
                document.getElementById("nombre-user-rent").innerText = "Bienvenido, " + displayName;
                document.getElementById("email-user-rent").innerText = email;
            }

        }
    });
}

function getRentCarUsers() {
    allrentcars.length = 0;
    let db = firebase.firestore();
    db.collection("allcars").get()
        .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                allrentcars.push(doc.data());
            });
            rents();
        })
        .catch(function (error) {
            console.log("Error getting documents: ", error);
        });
}

function rents() {
    let db = firebase.firestore();
    let uuid = firebase.auth().currentUser.uid;
    let content = document.getElementById("container-rents-fire");
    let index = 0;
    let initialDiv = 0;
    content.innerHTML = "";

    db.collection("rents").where("uuid", "==", uuid)
        .get()
        .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {

                alluserrentscars.push(doc.data());

                if (index % 2 === 0) {
                    initialDiv = index;
                    createCardUserRents(index, initialDiv, content, doc);
                } else {
                    createCardUserRents(index, initialDiv, content, doc);
                }
                index++;
            });
            addListenerstoValorationButtons();
        })
        .catch(function (error) {
            console.log("Error getting documents: ", error);
        });
}

function createCardUserRents(index, initialDiv, content, doc) {
    let initDiv = document.createElement("div");
    initDiv.id = "car-deck-rent-car-" + initialDiv;
    initDiv.className = "card-deck mb-3 text-center";
    content.appendChild(initDiv);

    let attachDiv = document.getElementById("car-deck-rent-car-" + initialDiv);
    let cardDiv = document.createElement("div");
    cardDiv.id = "attach-card-" + index;
    cardDiv.className = "card mb-2";
    attachDiv.appendChild(cardDiv);

    let cardAttachDiv = document.getElementById("attach-card-" + index);
    let imagecar = document.createElement("img");
    imagecar.className = "card-img-top";
    imagecar.src = searchCar(doc.get('tipoAuto'))[0].source;
    cardAttachDiv.appendChild(imagecar);

    let cardestDiv = document.createElement("div");
    cardestDiv.className = "card-body text-center";
    cardestDiv.id = "card-body-text-" + index;
    cardAttachDiv.appendChild(cardestDiv);

    let lastDivInfo = document.getElementById("card-body-text-" + index);
    let namecard = document.createElement("h4");
    namecard.className = "card-title font-weight-bold";
    namecard.innerText = doc.get('tipoAuto');

    let fechaRecogidaCard = document.createElement("p");
    fechaRecogidaCard.className = "card-text";
    fechaRecogidaCard.innerText = "Fecha de recogida: " + doc.get('fechaRecogida');

    let fechaentregaCard = document.createElement("p");
    fechaentregaCard.className = "card-text";
    fechaentregaCard.innerText = "Fecha de entrega: " + doc.get('fechaEntrega');

    let LugarRecogidaCard = document.createElement("p");
    LugarRecogidaCard.className = "card-text";
    LugarRecogidaCard.innerText = "Lugar de recogida: " + doc.get('lugarRecogida');

    let LugarEntregaCard = document.createElement("p");
    LugarEntregaCard.className = "card-text";
    LugarEntregaCard.innerText = "Lugar de entrega: " + doc.get('lugarEntrega');

    let precioTotalCard = document.createElement("p");
    precioTotalCard.className = "card-text";
    precioTotalCard.innerText = "Total a pagar: " + doc.get('totalPagar');

    let metodoPagoCard = document.createElement("p");
    metodoPagoCard.className = "card-text";
    metodoPagoCard.innerText = "Método de pago: " + doc.get('metodoPago');

    let valorarButtonCard = document.createElement("a");
    valorarButtonCard.type = "button";
    valorarButtonCard.className = "btn btn-alquilar btn-rounded";
    valorarButtonCard.style = "background-color: #52489C";
    valorarButtonCard.innerText = "Valorar";

    lastDivInfo.appendChild(namecard);
    lastDivInfo.appendChild(fechaRecogidaCard);
    lastDivInfo.appendChild(fechaentregaCard);
    lastDivInfo.appendChild(LugarRecogidaCard);
    lastDivInfo.appendChild(LugarEntregaCard);
    lastDivInfo.appendChild(precioTotalCard);
    lastDivInfo.appendChild(metodoPagoCard);
    lastDivInfo.appendChild(valorarButtonCard);
}

function addListenerstoValorationButtons() {
    document.querySelectorAll(".btn.btn-alquilar.btn-rounded").forEach(item => {
        item.addEventListener('click', event => {
            modalValorationCar(event)
        });
    });
}

function modalValorationCar(event) {
    jQueryStartRate();
    document.getElementById('rateMe2').innerHTML = "";
    $("#modalRate").modal();
    $('#rateMe2').mdbRate();

    /*
    let domElement = event.composedPath()[2];
    let carName = domElement.getElementsByClassName("card-title font-weight-bold");
    let nametypeCar = carName[0].innerText;*/


}

function enviarValoracionFirebase() {

    let startName = document.getElementById('rateMe2').children[0].className;
    let textComentary = document.getElementById('comentaryText');
    var numeberStart = 0;

    if (startName.indexOf("oneStar") !== -1) {
        numeberStart = 1;
    } else if (startName.indexOf("twoStars") !== -1) {
        numeberStart = 2;
    } else if (startName.indexOf("threeStars") !== -1) {
        numeberStart = 3;
    } else if (startName.indexOf("fourStars") !== -1) {
        numeberStart = 4;
    } else {
        numeberStart = 5;
    }

    var db = firebase.firestore();
    let userUID = firebase.auth().currentUser;

    if (userUID != null) {
        db.collection("valoraciones").add({
            numStarts: numeberStart,
            comentary: textComentary.value,
            uuid: firebase.auth().currentUser.uid
        }).then(function () {
            alert("Su valoración ha sido enviada !!");
        }).catch(function (error) {
            alert("No se pudo realizar la valoración!!");
        });
        $("#modalRate").modal('hide');
    }
}

function jQueryStartRate() {
    (function ($) {
        $.fn.mdbRate = function () {
            var $stars;
            // Custom whitelist to allow for using HTML tags in popover content
            var myDefaultWhiteList = $.fn.tooltip.Constructor.Default.whiteList
            myDefaultWhiteList.textarea = [];
            myDefaultWhiteList.button = [];

            var $container = $(this);

            var titles = ['Muy Mala', 'Mala', 'OK', 'Buena', 'Excelente'];

            for (var i = 0; i < 5; i++) {
                $container.append(`<i class="py-2 px-1 rate-popover" data-index="${i}" data-html="true" data-toggle="popover"
      data-placement="top" title="${titles[i]}"></i>`);
            }

            $stars = $container.children();

            if ($container.hasClass('rating-faces')) {
                $stars.addClass('far fa-meh-blank');
            } else if ($container.hasClass('empty-stars')) {
                $stars.addClass('far fa-star');
            } else {
                $stars.addClass('fas fa-star');
            }

            $stars.on('mouseover', function () {
                var index = $(this).attr('data-index');
                markStarsAsActive(index);
            });

            function markStarsAsActive(index) {
                unmarkActive();

                for (var i = 0; i <= index; i++) {

                    if ($container.hasClass('rating-faces')) {
                        $($stars.get(i)).removeClass('fa-meh-blank');
                        $($stars.get(i)).addClass('live');

                        switch (index) {
                            case '0':
                                $($stars.get(i)).addClass('fa-angry');
                                break;
                            case '1':
                                $($stars.get(i)).addClass('fa-frown');
                                break;
                            case '2':
                                $($stars.get(i)).addClass('fa-meh');
                                break;
                            case '3':
                                $($stars.get(i)).addClass('fa-smile');
                                break;
                            case '4':
                                $($stars.get(i)).addClass('fa-laugh');
                                break;
                        }

                    } else if ($container.hasClass('empty-stars')) {
                        $($stars.get(i)).addClass('fas');
                        switch (index) {
                            case '0':
                                $($stars.get(i)).addClass('oneStar');
                                break;
                            case '1':
                                $($stars.get(i)).addClass('twoStars');
                                break;
                            case '2':
                                $($stars.get(i)).addClass('threeStars');
                                break;
                            case '3':
                                $($stars.get(i)).addClass('fourStars');
                                break;
                            case '4':
                                $($stars.get(i)).addClass('fiveStars');
                                break;
                        }
                    } else {
                        $($stars.get(i)).addClass('amber-text');

                    }
                }
            }

            function unmarkActive() {
                $stars.parent().hasClass('rating-faces') ? $stars.addClass('fa-meh-blank') : $stars;
                $container.hasClass('empty-stars') ? $stars.removeClass('fas') : $container;
                $stars.removeClass('fa-angry fa-frown fa-meh fa-smile fa-laugh live oneStar twoStars threeStars fourStars fiveStars amber-text');
            }

            $stars.on('click', function () {
                $stars.popover('hide');
            });

            // Submit, you can add some extra custom code here
            // ex. to send the information to the server
            $container.on('click', '#voteSubmitButton', function () {
                $stars.popover('hide');
            });

            // Cancel, just close the popover
            $container.on('click', '#closePopoverButton', function () {
                $stars.popover('hide');
            });

            if ($container.hasClass('feedback')) {

                $(function () {
                    $stars.popover({
                        // Append popover to #rateMe to allow handling form inside the popover
                        container: $container,
                        // Custom content for popover
                        content: `<div class="my-0 py-0"> <textarea type="text" style="font-size: 0.78rem" class="md-textarea form-control py-0" placeholder="Write us what can we improve" rows="3"></textarea> <button id="voteSubmitButton" type="submit" class="btn btn-sm btn-primary">Submit!</button> <button id="closePopoverButton" class="btn btn-flat btn-sm">Close</button>  </div>`
                    });
                })
            }

            $stars.tooltip();
        }
    })(jQuery);
}

function getCatalogFromFirebase() {


    let db = firebase.firestore();
    let content = document.getElementById("container-rents-fire");
    let index = 0;
    let initialDiv = 0;
    content.innerHTML = "";

    allrentcars.length = 0;

    db.collection("allcars").get().then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {

            allrentcars.push(doc.data());

            if (index % 3 === 0) {
                initialDiv = index;
                createCardAllCars(index, initialDiv, content, doc);
            } else {
                createCardAllCars(index, initialDiv, content, doc);
            }
            index++;
        });
        addlistenersEditarButton();
        createButtonBuy();
    })
        .catch(function (error) {
            console.log("Error getting documents: ", error);
        });

}

function createCardAllCars(index, initialDiv, content, doc) {
    let initDiv = document.createElement("div");
    initDiv.id = "car-deck-rent-car-" + initialDiv;
    initDiv.className = "card-deck mb-3 text-center";
    content.appendChild(initDiv);

    let attachDiv = document.getElementById("car-deck-rent-car-" + initialDiv);
    let cardDiv = document.createElement("div");
    cardDiv.id = doc.id;
    cardDiv.className = "card mb-2";
    attachDiv.appendChild(cardDiv);

    let cardAttachDiv = document.getElementById(doc.id);
    let imagecar = document.createElement("img");
    imagecar.className = "card-img-top";
    imagecar.src = doc.get('source');
    cardAttachDiv.appendChild(imagecar);

    let cardestDiv = document.createElement("div");
    cardestDiv.className = "card-body text-center";
    cardestDiv.id = "card-body-text-" + index;
    cardAttachDiv.appendChild(cardestDiv);

    let lastDivInfo = document.getElementById("card-body-text-" + index);
    let namecard = document.createElement("h4");
    namecard.className = "card-title font-weight-bold";
    namecard.innerText = doc.get('name');

    let precioCard = document.createElement("p");
    precioCard.className = "card-text";
    precioCard.innerText = "Empezar desde " + doc.get('precio') + ".00$ / por día";

    let valorarButtonCard = document.createElement("a");
    valorarButtonCard.type = "button";
    valorarButtonCard.className = "btn btn-editar btn-rounded";
    valorarButtonCard.style = "background-color: #52489C";
    valorarButtonCard.innerText = "Editar";

    lastDivInfo.appendChild(namecard);
    lastDivInfo.appendChild(precioCard);
    lastDivInfo.appendChild(valorarButtonCard);
}

function getAdminDataFromFireBase() {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {

            var displayName = user.displayName;
            var email = user.email;

            if (document.getElementById("nav-pills-bar-radius") != null) {
                let navHeader = document.getElementById("nav-pills-bar-radius");
                let newItem = document.createElement("li");
                newItem.className = "nav-item";
                newItem.id = "admin-data-fire";
                navHeader.appendChild(newItem);

                let navHeader2 = document.getElementById("nav-pills-bar-radius");
                let newItem2 = document.createElement("li");
                newItem2.className = "nav-item";
                newItem2.id = "admin-data-fire2";
                navHeader2.appendChild(newItem2);

                let itemAdmin = document.getElementById("admin-data-fire");
                itemAdmin.innerHTML = "<a id=\"first-item-nav\" class=\"nav-link text-left\" data-toggle=\"tab\" href=\"#panel108\" role=\"tab\">" + "<i class=\"far fa-star mr-4\"></i>Ver Valoraciones</a>";
                itemAdmin.onclick = getAllRates();

                let itemAdmin2 = document.getElementById("admin-data-fire2");
                itemAdmin2.innerHTML = "<a id=\"first-item-nav\" class=\"nav-link text-left\" data-toggle=\"tab\" href=\"#panel109\" role=\"tab\">" + "<i class=\"fas fa-book mr-4\"></i>Ver Alquileres</a>";
                itemAdmin2.addEventListener('click', event => {
                    fillAllAquileres();
                });

                let itemfirst = document.getElementById("first-item-nav");
                itemfirst.innerHTML = "<i class=\"fas fa-user-circle mr-4\"></i>Información Personal";

                let itemsecond = document.getElementById("second-item-nav");
                itemsecond.innerHTML = "<i class=\"fas fa-user-shield mr-4\"></i>Administrar Catalogo";

                itemsecond.addEventListener('click', event => {
                    getCatalogFromFirebase();
                });

                document.getElementById("nombre-user-rent").innerText = "Bienvenido, " + displayName;
                document.getElementById("email-user-rent").innerText = email;
            }

        }
    });
}

function userOrAdmin() {

    let user = firebase.auth().currentUser.uid;
    if (user === "J7pLYclm40NwY3vWIGoYZYbFQd72") {
        getAdminDataFromFireBase()
    } else {
        getUserDataFireBase();
    }

}

function fillCatalogAutos() {
    let db = firebase.firestore();
    let content = document.getElementById("catalog-autos-2020");
    let index = 0;
    let initialDiv = 0;

    if (content != null) {

        content.innerHTML = "";
        allrentcars.length = 0;

        db.collection("allcars").get().then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {

                allrentcars.push(doc.data());

                if (index % 3 === 0) {
                    initialDiv = index;
                    createCardAllCarsCatalog(index, initialDiv, content, doc);
                } else {
                    createCardAllCarsCatalog(index, initialDiv, content, doc);
                }
                index++;
            });
            addListenersRentCar();
        })
            .catch(function (error) {
                console.log("Error getting documents: ", error);
            });
    }
}

function addlistenersEditarButton() {
    document.querySelectorAll(".btn.btn-editar.btn-rounded").forEach(item => {
        item.addEventListener('click', event => {
            addListenerToEditarButton(event);
        });
    });

}

function addListenerToEditarButton(event) {

    $("#modalEditarForm").modal();

    let domElement = event.composedPath()[2];
    let carName = domElement.getElementsByClassName("card-title font-weight-bold");
    let typeCar2 = carName[0].innerText;
    let respCar = searchCar(typeCar2);
    document.getElementById("image-auto-rent-edit").src = respCar[0].source;
    let name = respCar[0].name;
    idCar = domElement.id;
    let precio = respCar[0].precio;

    document.getElementById("form_nombre").value = name;
    document.getElementById("form_precio").value = precio;


    //console.log(carName[0].src);
    //


    // console.log(allrentcars.fin(carRent));
    /*
    let domElement = event.[]composedPath()[2];
    let carName = domElement.getElementsByClassName("card-title font-weight-bold");
    typeCar = carName[0].innerText;
    document.getElementById("image-auto-rent").src = jsonCar[typeCar].source;
    document.getElementById('title-image-rent').innerHTML = typeCar;
    document.getElementById('description-car-image').innerHTML = "Empezar desde " + jsonCar[typeCar].precio + "$ / por día";*/
}

function saveEdit() {
    let db = firebase.firestore();
    db.collection("allcars").doc(idCar).update({
        name: document.getElementById("form_nombre").value,
        precio: document.getElementById("form_precio").value
    }).then(function () {
        console.log("Document successfully updated!");
        $("#modalEditarForm").modal('hide');
        getCatalogFromFirebase();
    }).catch(function (error) {
        console.error("Error updating document: ", error);
    });
}

function searchCar(carRent) {
    return allrentcars.filter(function (elemento) {
        return elemento.name === carRent;
    });
}

function createCardAllCarsCatalog(index, initialDiv, content, doc) {
    let initDiv = document.createElement("div");
    initDiv.id = "car-deck-rent-car-" + initialDiv;
    initDiv.className = "card-deck mb-3 text-center";
    content.appendChild(initDiv);

    let attachDiv = document.getElementById("car-deck-rent-car-" + initialDiv);
    let cardDiv = document.createElement("div");
    cardDiv.id = "attach-card-" + index;
    cardDiv.className = "card mb-2";
    attachDiv.appendChild(cardDiv);

    let cardAttachDiv = document.getElementById("attach-card-" + index);
    let imagecar = document.createElement("img");
    imagecar.className = "card-img-top";
    imagecar.src = doc.get('source');
    cardAttachDiv.appendChild(imagecar);

    let cardestDiv = document.createElement("div");
    cardestDiv.className = "card-body text-center";
    cardestDiv.id = "card-body-text-" + index;
    cardAttachDiv.appendChild(cardestDiv);

    let lastDivInfo = document.getElementById("card-body-text-" + index);
    let namecard = document.createElement("h4");
    namecard.className = "card-title font-weight-bold";
    namecard.innerText = doc.get('name');

    let precioCard = document.createElement("p");
    precioCard.className = "card-text";
    precioCard.innerText = "Empezar desde " + doc.get('precio') + ".00$ / por día";

    let alquilarButtonCard = document.createElement("a");
    alquilarButtonCard.type = "button";
    alquilarButtonCard.className = "btn btn-small btn-alquilar btn-rounded";
    alquilarButtonCard.target = "#modalRentCar";
    alquilarButtonCard.style = "background-color: #52489C";
    alquilarButtonCard.innerText = "Alquilar";

    let brtag = document.createElement("br");
    let brtag2 = document.createElement("br");


    let facebookButtonCard = document.createElement("a");
    facebookButtonCard.type = "button";
    facebookButtonCard.className = "btn-floating btn-small btn-fb";
    facebookButtonCard.innerHTML = "<i class=\"fab fa-facebook-f\"></i>";

    let twitterButtonCard = document.createElement("a");
    twitterButtonCard.type = "button";
    twitterButtonCard.className = "btn-floating btn-small btn-tw";
    twitterButtonCard.innerHTML = "<i class=\"fab fa-twitter\"></i>";

    let instaButtonCard = document.createElement("a");
    instaButtonCard.type = "button";
    instaButtonCard.className = "btn-floating btn-small btn-dribbble";
    instaButtonCard.innerHTML = "<i class=\"fab fa-instagram\"></i>";

    lastDivInfo.appendChild(namecard);
    lastDivInfo.appendChild(precioCard);
    lastDivInfo.appendChild(alquilarButtonCard);
    lastDivInfo.appendChild(brtag);
    lastDivInfo.appendChild(brtag2);
    lastDivInfo.appendChild(facebookButtonCard);
    lastDivInfo.appendChild(twitterButtonCard);
    lastDivInfo.appendChild(instaButtonCard);
}

function fillOfertasAutos() {
    let db = firebase.firestore();
    allrentcars.length = 0;
    db.collection("allcars").get().then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
            allrentcars.push(doc.data());
        });
        ofertas();
    }).catch(function (error) {
        console.log("Error getting documents: ", error);
    });

}

function ofertas() {
    let db = firebase.firestore();
    let content = document.getElementById("ofertas-container-2020");
    let index = 0;
    let initialDiv = 0;

    if (content != null) {

        content.innerHTML = "";

        db.collection("ofertas").get().then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {

                if (index % 2 === 0) {
                    initialDiv = index;
                    createCardAllOfertasCatalog(index, initialDiv, content, doc);
                } else {
                    createCardAllOfertasCatalog(index, initialDiv, content, doc);
                }
                index++;
            });
            addListenersRentCar();
        })
            .catch(function (error) {
                console.log("Error getting documents: ", error);
            });
    }
}

function createCardAllOfertasCatalog(index, initialDiv, content, doc) {
    let initDiv = document.createElement("div");
    initDiv.id = "car-deck-rent-car-" + initialDiv;
    initDiv.className = "card-deck mb-3 text-center";
    content.appendChild(initDiv);

    let attachDiv = document.getElementById("car-deck-rent-car-" + initialDiv);
    let cardDiv = document.createElement("div");
    cardDiv.id = "attach-card-" + index;
    cardDiv.className = "card mb-2";
    attachDiv.appendChild(cardDiv);

    let cardAttachDiv = document.getElementById("attach-card-" + index);
    let imagecar = document.createElement("img");
    imagecar.className = "card-img-top";
    imagecar.src = doc.get('source');
    cardAttachDiv.appendChild(imagecar);

    let cardestDiv = document.createElement("div");
    cardestDiv.className = "card-body text-center";
    cardestDiv.id = "card-body-text-" + index;
    cardAttachDiv.appendChild(cardestDiv);

    let lastDivInfo = document.getElementById("card-body-text-" + index);
    let namecard = document.createElement("h4");
    namecard.className = "card-title font-weight-bold";
    namecard.innerText = doc.get('name');

    let decripcionCard = document.createElement("p");
    decripcionCard.className = "card-text";
    decripcionCard.innerText = doc.get('descripcion');

    let precioCard = document.createElement("p");
    precioCard.className = "card-text";
    precioCard.innerText = "Empezar desde " + doc.get('precio') + ".00$ / por día";

    let alquilarButtonCard = document.createElement("a");
    alquilarButtonCard.type = "button";
    alquilarButtonCard.className = "btn btn-small btn-alquilar btn-rounded";
    alquilarButtonCard.target = "#modalRentCar";
    alquilarButtonCard.style = "background-color: #52489C";
    alquilarButtonCard.innerText = "Alquilar";

    let brtag = document.createElement("br");
    let brtag2 = document.createElement("br");


    let facebookButtonCard = document.createElement("a");
    facebookButtonCard.type = "button";
    facebookButtonCard.className = "btn-floating btn-small btn-fb";
    facebookButtonCard.innerHTML = "<i class=\"fab fa-facebook-f\"></i>";

    let twitterButtonCard = document.createElement("a");
    twitterButtonCard.type = "button";
    twitterButtonCard.className = "btn-floating btn-small btn-tw";
    twitterButtonCard.innerHTML = "<i class=\"fab fa-twitter\"></i>";

    let instaButtonCard = document.createElement("a");
    instaButtonCard.type = "button";
    instaButtonCard.className = "btn-floating btn-small btn-dribbble";
    instaButtonCard.innerHTML = "<i class=\"fab fa-instagram\"></i>";

    lastDivInfo.appendChild(namecard);
    lastDivInfo.appendChild(decripcionCard);
    lastDivInfo.appendChild(precioCard);
    lastDivInfo.appendChild(alquilarButtonCard);
    lastDivInfo.appendChild(brtag);
    lastDivInfo.appendChild(brtag2);
    lastDivInfo.appendChild(facebookButtonCard);
    lastDivInfo.appendChild(twitterButtonCard);
    lastDivInfo.appendChild(instaButtonCard);
}

function fillAllAquileres() {

    let db = firebase.firestore();
    let content = document.getElementById("all-rents-containers");
    let index = 0;
    let initialDiv = 0;

    let content2 = document.getElementById("container-rents-fire");
    content2.innerHTML = "";

    if (content != null) {

        content.innerHTML = "";

        db.collection("rents").get().then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {

                if (index % 3 === 0) {
                    initialDiv = index;
                    getAllCarRents(index, initialDiv, content, doc);
                } else {
                    getAllCarRents(index, initialDiv, content, doc);
                }
                index++;
            });
            addListenersRentCar();
        })
            .catch(function (error) {
                console.log("Error getting documents: ", error);
            });
    }
}

function getAllCarRents(index, initialDiv, content, doc) {
    let initDiv = document.createElement("div");
    initDiv.id = "car-deck-rent-car-" + initialDiv;
    initDiv.className = "card-deck mb-3 text-center";
    content.appendChild(initDiv);

    let attachDiv = document.getElementById("car-deck-rent-car-" + initialDiv);
    let cardDiv = document.createElement("div");
    cardDiv.id = doc.id;
    cardDiv.className = "card mb-2";
    attachDiv.appendChild(cardDiv);

    let cardAttachDiv = document.getElementById(doc.id);
    let imagecar = document.createElement("img");
    imagecar.className = "card-img-top";
    imagecar.src = searchCar(doc.get('tipoAuto'))[0].source;
    cardAttachDiv.appendChild(imagecar);

    let cardestDiv = document.createElement("div");
    cardestDiv.className = "card-body text-center";
    cardestDiv.id = "card-body-text-" + index;
    cardAttachDiv.appendChild(cardestDiv);

    let lastDivInfo = document.getElementById("card-body-text-" + index);
    let namecard = document.createElement("h4");
    namecard.className = "card-title font-weight-bold";
    namecard.innerText = doc.get('tipoAuto');

    let fechaRecogidaCard = document.createElement("p");
    fechaRecogidaCard.className = "card-text";
    fechaRecogidaCard.innerText = "Fecha de recogida: " + doc.get('fechaRecogida');

    let fechaentregaCard = document.createElement("p");
    fechaentregaCard.className = "card-text";
    fechaentregaCard.innerText = "Fecha de entrega: " + doc.get('fechaEntrega');

    let LugarRecogidaCard = document.createElement("p");
    LugarRecogidaCard.className = "card-text";
    LugarRecogidaCard.innerText = "Lugar de recogida: " + doc.get('lugarRecogida');

    let LugarEntregaCard = document.createElement("p");
    LugarEntregaCard.className = "card-text";
    LugarEntregaCard.innerText = "Lugar de entrega: " + doc.get('lugarEntrega');

    let precioTotalCard = document.createElement("p");
    precioTotalCard.className = "card-text";
    precioTotalCard.innerText = "Total a pagar: " + doc.get('totalPagar');

    let metodoPagoCard = document.createElement("p");
    metodoPagoCard.className = "card-text";
    metodoPagoCard.innerText = "Método de pago: " + doc.get('metodoPago');

    lastDivInfo.appendChild(namecard);
    lastDivInfo.appendChild(fechaRecogidaCard);
    lastDivInfo.appendChild(fechaentregaCard);
    lastDivInfo.appendChild(LugarRecogidaCard);
    lastDivInfo.appendChild(LugarEntregaCard);
    lastDivInfo.appendChild(precioTotalCard);
    lastDivInfo.appendChild(metodoPagoCard);
}

function getAllRates() {
    jQueryStartRate();

    let db = firebase.firestore();

    db.collection("valoraciones").get().then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
            createStarts(doc);
        });

    }).catch(function (error) {
        console.log("Error getting documents: ", error);
    });

}

function createStarts(doc) {
    let maindiv = document.getElementById('container-rents-book');
    let ratediv = document.createElement("span");
    let ratediv2 = document.createElement("span");
    let ratediv3 = document.createElement("span");
    let ratediv4 = document.createElement("span");
    let ratediv5 = document.createElement("span");

    if (doc.get('numStarts') === 5) {
        ratediv.className = "fa fa-star checked";
        ratediv2.className = "fa fa-star checked";
        ratediv3.className = "fa fa-star checked";
        ratediv4.className = "fa fa-star checked";
        ratediv5.className = "fa fa-star checked";
    } else if (doc.get('numStarts') === 4) {
        ratediv.className = "fa fa-star checked";
        ratediv2.className = "fa fa-star checked";
        ratediv3.className = "fa fa-star checked";
        ratediv4.className = "fa fa-star checked";
        ratediv5.className = "fa fa-star ";
    } else if (doc.get('numStarts') === 3) {
        ratediv.className = "fa fa-star checked";
        ratediv2.className = "fa fa-star checked";
        ratediv3.className = "fa fa-star checked";
        ratediv4.className = "fa fa-star";
        ratediv5.className = "fa fa-star";
    } else if (doc.get('numStarts') === 2) {
        ratediv.className = "fa fa-star checked";
        ratediv2.className = "fa fa-star checked";
        ratediv3.className = "fa fa-star";
        ratediv4.className = "fa fa-star";
        ratediv5.className = "fa fa-star";
    } else if (doc.get('numStarts') === 1) {
        ratediv.className = "fa fa-star checked";
        ratediv2.className = "fa fa-star";
        ratediv3.className = "fa fa-star";
        ratediv4.className = "fa fa-star";
        ratediv5.className = "fa fa-star";
    } else {
        ratediv.className = "fa fa-star";
        ratediv2.className = "fa fa-star";
        ratediv3.className = "fa fa-star";
        ratediv4.className = "fa fa-star";
        ratediv5.className = "fa fa-star";
    }

    let brtag = document.createElement("br");
    let brtag2 = document.createElement("br");
    maindiv.appendChild(ratediv);
    maindiv.appendChild(ratediv2);
    maindiv.appendChild(ratediv3);
    maindiv.appendChild(ratediv4);
    maindiv.appendChild(ratediv5);
    maindiv.appendChild(brtag);
    maindiv.appendChild(brtag2);

    let comentaryText = document.createElement('p');
    comentaryText.className = "text-left";
    comentaryText.innerText = doc.get('comentary');
    maindiv.appendChild(comentaryText);
}

function createButtonBuy() {
    let content = document.getElementById("container-rents-fire");
    let alquilarButtonCard = document.createElement("a");
    alquilarButtonCard.type = "button";
    alquilarButtonCard.className = "btn btn-small btn-create btn-rounded";
    alquilarButtonCard.style = "background-color: #52489C";
    alquilarButtonCard.innerText = "Nuevo";
    alquilarButtonCard.addEventListener('click', event => {
        $("#modalNewCarForm").modal();
    });
    content.appendChild(alquilarButtonCard);

}

function saveNewCarFireBase() {

    let name = document.getElementById("form_nombre2").value;
    let precio = document.getElementById("form_precio2").value;

    let ref = firebase.storage().ref();
    const file = document.querySelector('#form_file2').files[0];

    if (name !== "" && precio !== "" && file !== null) {
        const nameimage = (+new Date()) + '-' + file.name;
        const metadata = {
            contentType: file.type
        };

        const task = ref.child(nameimage).put(file, metadata);
        task.then(snapshot => snapshot.ref.getDownloadURL())
            .then((url) => {
                urlImage = url;
                savenewCarCatalog();
            })
            .catch(console.error);
    } else {
        alert("Debe ingresar todos los datos");
    }

}

function savenewCarCatalog() {
    let name = document.getElementById("form_nombre2").value;
    let precio = document.getElementById("form_precio2").value;

    var db = firebase.firestore();
    db.collection("allcars").add({
        "name": name,
        "precio": precio,
        "source": urlImage
    }).then(function () {
        $("#modalNewCarForm").modal('hide');
        getCatalogFromFirebase();
    })
}

window.onload = function () {
    initApp();
    addListenersRentCar();
    fillCatalogAutos();
    fillOfertasAutos();
};

