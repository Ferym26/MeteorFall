// Initialize Firebase
var config = {
    apiKey: "AIzaSyCzgxvu2y5KVnUuZmwD0sWzs4bTjR79iOw",
    authDomain: "meteorfall-f17c8.firebaseapp.com",
    databaseURL: "https://meteorfall-f17c8.firebaseio.com",
    storageBucket: "meteorfall-f17c8.appspot.com",
    messagingSenderId: "66142819813"
};
firebase.initializeApp(config);

// var username = document.querySelector(".username");
// var dbRef = firebase.database().ref().child("text");
// dbRef.on('value', snap => username.innerText = snap.val());




var enterName = document.querySelector(".enterName");
var username = document.querySelector(".username");
var name;

if (localStorage.getItem('name')) {
    username.innerHTML = localStorage.getItem('name');
    enterName.style.display = "none";
}

document.addEventListener("change", function () {
    //console.log(enterName.value);
    name = enterName.value;
    username.innerHTML = name;

    localStorage.setItem('name', name);
    enterName.style.display = "none";
});
