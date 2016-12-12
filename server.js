var http   = require('http')
  , fs     = require('fs')
  , url    = require('url')
  , admin  = require('firebase-admin')
  , fcmApi    = require('fcm-node')

//Configure firebase connection
var serviceAccount = require("./firebase.json")
var cloudMessagingAccount = require("./cloudmessaging.json")

//Configure firebase push
//https://hasura.io/blog/quick-howto-fcm-push-notifications-with-nodejs/
var fcm = new fcmApi(cloudMessagingAccount.server_key)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount), 
  databaseURL: "https://helpme-151520.firebaseio.com/"
})

var db = admin.database()
var ref = db.ref("/") //use ref to get database objects
var profilesRef = db.ref("/profiles")
var inboxRef = db.ref("/request-inbox")

// https://firebase.google.com/docs/database/admin/retrieve-data
// https://firebase.google.com/docs/database/admin/save-data

inboxRef.on("child_added", function(snapshot, prevChildKey) {
  var newHelpRequest = snapshot.val()
  sendHelpRequestNotifications(newHelpRequest.topics, newHelpRequest.title, newHelpRequest.body)
  var snapshotRef = db.ref("/request-inbox/" + snapshot.key)
  // TODO: move to pending
  snapshotRef.set(null)
})

function sendHelpRequestNotifications(keywords, requestTitle, requestBody)
{
  profilesRef.once('value', function(v) {
    // console.log(v.val())
    for (var attributename in v.val()) {
      var userKeywords = v.val()[attributename]['filters']
      var token = v.val()[attributename]['deviceToken']
      var email = v.val()[attributename]['email']
      var matches = keywords.some(function (v) {
        return userKeywords.indexOf(v) >= 0
      })
      if (matches) {
        console.log('Dispatching notification to user ' + email + ' with token ' + token)
        sendNotificaton(token, requestTitle, requestBody)
      }
    }
  })
}

function sendNotificaton(token, title, body) {
  var message = {
          to: token,
          data: {
            request_id: 'undefined'
          },
          priority: 'high',
          notification: {
            title: title,
            body: body
          }
        }
  fcm.send(message, function(err, response) {
    if (err) {
      console.log(err)
    } else {
      console.log("Notification sent, response: " + response)
    }
  })
}

function createDummyRequest(keywords, title, body, username) {
  inboxRef.push().set({
    topics: keywords,
    title: title,
    body: body,
    user: username
  })
}

createDummyRequest(['java', 'music'], 'Test Request', 'I need help with math and Java!', 'hello@rthr.me')
// sendHelpRequestNotifications(['java', 'music'], 'Test Request', 'I need help with math and Java!')
// sendHelpRequestNotifications(['test_value_1'], 'This is a test', 'Test request from the server')