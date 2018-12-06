const multiparty = require('multiparty');
const http = require('http')
const ipfsClient = require('ipfs-http-client')
const EosApi = require('eosjs-api')

const ipfs = ipfsClient('localhost', '6001', { protocol: 'http' })

const options = {
  httpEndpoint: 'http://stage.api.telosvoyager.io:2888', // default, null for cold-storage
  verbose: false, // API logging
  logger: { // Default logging functions
    log: console.log,
    error: console.error
  },
  fetchConfiguration: {}
}

const eos = EosApi(options)


const server = http.createServer(function (req, res) {

  let form = new multiparty.Form();

  form.parse(req, function(err, fields, files) {

    if ( files && files.file && files.file[0] && files.file[0].path ) {
	console.log(files.file[0])
      let path = files.file[0].path

      ipfs.addFromFs(path, {onlyHash: true}, (err, result) => {

        if (err) { throw err }

        console.log(result[0])
        let requestingHash = result[0].hash;

        eos.getTableRows({
          "json": true,
          "scope": 'testipfs1111',
          "code": 'ipfspay11111',
          "table": "storage"
        })
        .then(result => {

          console.log('eos\n', result)

          let ipfsHashes = result.rows.map((currentValue, index, arr) => {
            return currentValue.ipfs_url
          })

          console.log('requesting Hash:', requestingHash)

          console.log('ipfsHashes', ipfsHashes, ipfsHashes.indexOf(requestingHash))

          if ( ipfsHashes.indexOf(requestingHash) !== -1 ) {
            console.log("forwarding to ipfs")
            ipfs.addFromFs(path, {onlyHash: false}, (err, result) => {
              if (err) { throw err }
              console.log(result)

              res.writeHead(200, {'Content-type':'application/json'});
              res.write(JSON.stringify(result));
              res.end( );
            })
          }
          else {
            res.writeHead(403, {'Content-type':'text/plain'});
            res.write('You need to buy space first.');
            res.end( );

          }

        })
        .catch((error) => {
          console.log(error)
        })
      });
    }
	  else {
		  res.writeHead(404, {'Content-type':'text/plain'});
		  res.write('Missing file.')
		  res.end();
	  }
  })


})

server.listen(7001)
