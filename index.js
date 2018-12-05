var multiparty = require('multiparty');
const http = require('http')
const forward = require('http-forward')
var ipfsClient = require('ipfs-http-client')

var ipfs = ipfsClient('localhost', '6001', { protocol: 'http' })


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
//    console.log('blah', files.file[0].path)
   
    
    if ( files.file && files.file && files.file[0] && files.file[0].path ) {
      let path = files.file[0].path
      ipfs.addFromFs(path, {onlyHash: false}, (err, result) => {
        if (err) { throw err }
        console.log(result)
      });

    }
  })


})

server.listen(7001)
