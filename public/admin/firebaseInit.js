var config = {
  apiKey: "AIzaSyAVDZanuNVD--cYuizWWe2WJAMGMoNMcnY",
  authDomain: "osu-brasil.firebaseapp.com",
  databaseURL: "https://osu-brasil.firebaseio.com",
  projectId: "osu-brasil",
  storageBucket: "osu-brasil.appspot.com",
  messagingSenderId: "693084351131"
};
firebase.initializeApp(config);
var db = firebase.firestore();
db.settings({forceLongPolling: true});

// RESET:
// remove line 11;

// db.collection("users").add({
//   first: "Ada",
//   last: "Lovelace",
//   born: 1815,
//   middle_name: {dia: 2, mes: 3, ano: 2015, semana: {dia: 'segunda', hora: {minuto: 2}}}
// })
// .then(function(docRef) {
//   console.log("Document written with ID: ", docRef.id);
// })
// .catch(function(error) {
//   console.error("Error adding document: ", error);
// });

// db.collection("users").get().then((query) => {
//   query.forEach((data) => {
//     console.log(data.data());
//   })
// })