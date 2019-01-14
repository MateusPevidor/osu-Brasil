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