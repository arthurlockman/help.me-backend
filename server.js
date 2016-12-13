var http    = require('http')
  , fs      = require('fs')
  , url     = require('url')
  , admin   = require('firebase-admin')
  , fcmApi  = require('fcm-node')
  , express = require('express')
  , app     = express()
  , date    = require('date-and-time')

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
var inboxRef = db.ref("/requests-inbox")
var chatRef = db.ref("/chats")
var requestRef = db.ref("/requests")

// https://firebase.google.com/docs/database/admin/retrieve-data
// https://firebase.google.com/docs/database/admin/save-data

inboxRef.on("child_added", function(snapshot, prevChildKey) {
  var newHelpRequest = snapshot.val()
  sendHelpRequestNotifications(newHelpRequest.topics, newHelpRequest.title, newHelpRequest.body)
  var snapshotRef = db.ref("/requests-inbox/" + snapshot.key)
  console.log(snapshot.val())
  requestRef.push(snapshot.val())
  snapshotRef.set(null)
})

function sendHelpRequestNotifications(keywords, requestTitle, requestBody)
{
  profilesRef.once('value', function(v) {
    for (var attributename in v.val()) {
      var userKeywords = v.val()[attributename]['filters'].join('|').toLowerCase().split('|')
      var token = v.val()[attributename]['deviceToken']
      var email = v.val()[attributename]['email']
      var keywordsLowerCase = keywords.join('|').toLowerCase().split('|')
      var matches = keywordsLowerCase.some(function (v) {
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
            body: body,
            sound: 'default'
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

app.get('/topics', function(req, res) {
  var data = {
    test: 'test'
  }
  profilesRef.once('value', function(v) {
    var keywords = new Set()
    for (var attributename in v.val()) {
      var userKeywords = v.val()[attributename]['filters'].join('|').toLowerCase().split('|')
      userKeywords.forEach(function(element) {
        keywords.add(toTitleCase(element))
      }, this);
    }
    res.end(JSON.stringify(Array.from(keywords)))
  })
})

app.get('/chatid', function(req, res) {
  var id = req.query.id
  chatRef.once('value', function(v) {
    for (var attributename in v.val()) {
      var title = v.val()[attributename]['chatTitle']
      if (title === id) {
        res.end(attributename)
        return
      }
    }
    res.end('undefined')
  })
})

function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()})
}

var server = app.listen(80, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("Server listening at http://%s:%s", host, port)
})

setInterval(function() {
  //Prune old requests
  requestRef.once('value', function(v) {
    for (var attr in v.val()) {
      var requestTime = date.parse(v.val()[attr]['expireTime'], 'DD/MM/YYYY HH:mm:ss')
      var currentTime = new Date();
      var isPassed  = requestTime.getTime() < Date.now()
      if (isPassed) {
        console.log("Pruning old request id: " + attr)
        var snapshotRef = db.ref("/requests/" + attr)
        snapshotRef.set(null)
      }
    }
  })
}, 1000 * 60)

