const http = require('http')
const forward = require('http-forward')

var server = http.createServer(function (req, res) {
  console.log(req)
  console.log('req.url', req.url)
  console.log('req.method', req.method)
  console.log('req.headers', req.headers)
  // Define proxy config params
  // req.forward = { target: 'http://new.server.net' }
  // forward(req, res)

  res.end('ah ah ah')
})

server.listen(7001)
