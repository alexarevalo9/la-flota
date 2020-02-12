

function initApp(){

    firebase.auth().onAuthStateChanged(function(user) {
        // [END_EXCLUDE]
        if (user) {
          // User is signed in.
          var email = user.email;

          console.log(email);
          document.getElementById('initsesion').style.visibility = 'hidden';
      
          // [END_EXCLUDE]
        } else {
            console.log("displayName");
        }
    });
}

window.onload = function() {
    initApp();
};

function regis(){
    var email = document.getElementById("orangeForm-email").value;
    var password = document.getElementById("orangeForm-pass").value;
    
    firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
      });
    
}

function auth(){
    var email = document.getElementById("defaultForm-email").value;
    var password = document.getElementById("defaultForm-pass").value;
    firebase.auth().signInWithEmailAndPassword(email, password).then(function(){

        location.reload();

    }).catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorCode, errorMessage);
        alert(errorCode, errorMessage);
    });
    
}
