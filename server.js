var http   = require('http')
  , fs     = require('fs')
  , url    = require('url')
  , admin  = require('firebase-admin')
  , fcmapi = require('fcm-push')

//Configure firebase connection
var serviceAccount = require("./firebase.json")
var cloudMessagingAccount = require("./cloudmessaging.json")

//Configure firebase push
//https://hasura.io/blog/quick-howto-fcm-push-notifications-with-nodejs/
var fcm = fcmapi(cloudMessagingAccount.server_key)

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

var inboxRef = db.ref("/request-inbox")
inboxRef.on("child_added", function(snapshot, prevChildKey) {
  var newHelpRequest = snapshot.val()
  console.log("New help request: " + newHelpRequest)
})
