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



  var count = 0;
  var form = new multiparty.Form();

  // Errors may be emitted
  // Note that if you are listening to 'part' events, the same error may be
  // emitted from the `form` and the `part`.
  form.on('error', function(err) {
    console.log('Error parsing form: ' + err.stack);
  });

  // Parts are emitted when parsing the form
  form.on('part', function(part) {
    // You *must* act on the part by reading it
    // NOTE: if you want to ignore it, just call "part.resume()"

    if (!part.filename) {
      // filename is not defined when this is a field and not a file
      console.log('got field named ' + part.name);
      // ignore field's content
      part.resume();
    }

    if (part.filename) {
      // filename is defined when this is a file
      count++;
      console.log('got file named ' + part.name);
      // ignore file's content here
      part.resume();
    }

    part.on('error', function(err) {
      // decide what to do
    });
  });

  // Close emitted after form parsed
  form.on('close', function() {
    res.end('ah ah ah\n')
  });

  form.parse(req, function(err, fields, files) {
    console.log('fields', fields)
    console.log('files', files)
  });




})

server.listen(7001)
