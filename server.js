var http = require('http')
  , fs   = require('fs')
  , url  = require('url')
  , admin = require("firebase-admin")

//Configure firebase connection
var serviceAccount = require("./firebase.json")

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount), 
  databaseURL: "https://helpme-151520.firebaseio.com/"
})

var db = admin.database()
var ref = db.ref("/") //use ref to get database objects

// https://firebase.google.com/docs/database/admin/retrieve-data
// https://firebase.google.com/docs/database/admin/save-data
ref = db.ref("/profiles")
ref.on("child_added", function(snapshot, prevChildKey) {
  var newPost = snapshot.val()
  console.log(newPost)
})
