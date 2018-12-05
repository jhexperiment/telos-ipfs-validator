const http = require('http')
const forward = require('http-forward')

var server = http.createServer(function (req, res) {
  console.log(req)
  // Define proxy config params
  // req.forward = { target: 'http://new.server.net' }
  // forward(req, res)
})

server.listen(7001)
