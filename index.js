var multiparty = require('multiparty');
const http = require('http')
const forward = require('http-forward')
var ipfsClient = require('ipfs-http-client')

var ipfs = ipfsClient('localhost', '5001', { protocol: 'http' })


var server = http.createServer(function (req, res) {
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
    for (file in files) {
      console.log('file', file)
    }
    if ( files.length ) {

      ipfs.addFromFs(files[0].path, {onlyHash: true}, (err, result) => {
        if (err) { throw err }

      });




})

server.listen(7001)
