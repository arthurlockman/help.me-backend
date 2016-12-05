var http = require('http')
  , fs   = require('fs')
  , marked = require('marked')
  , url  = require('url')
  , querystring = require('querystring')
  , port = 8080

var server = http.createServer (function (req, res) {
  var uri = url.parse(req.url)

  switch( uri.pathname ) {
    case '/':
    case '/index.html':
        sendFile(res, 'index.html', 'text/html')
        break
    case '/css/style.css':
      sendFile(res, 'style.css', 'text/css')
      break
    case '/scripts.js':
      sendFile(res, 'scripts.js', 'text/javascript')
      break
    case '/server.js':
      sendFile(res, 'server.js', 'text/javascript')
      break
    case '/readme.md':
    case '/README.md':
      sendReadme(res)
      break
    default:
      res.end('404 not found')
  }
})

server.listen(process.env.PORT || port)
console.log('listening on 8080')

function sendReadme(res) {
  var contentType = 'text/html'
  fs.readFile(__dirname + '/README.md', 'utf8', function(err, md) {
    if (err) {
      throw err
    }
    
    //Serve rendered readme
    res.writeHead(200, {'Content-type': contentType})
    res.end(marked(md), 'utf-8')
  })
}

function sendFile(res, filename, contentType) {
  contentType = contentType || 'text/html'

  fs.readFile(filename, function(error, content) {
    res.writeHead(200, {'Content-type': contentType})
    res.end(content, 'utf-8')
  })
}
