var multiparty = require('multiparty');
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

  var form = new multiparty.Form();

  form.parse(req, function(err, fields, files) {
    console.log('fields', fields)
    console.log('files', files)
  });


  res.end('ah ah ah')

})

server.listen(7001)
