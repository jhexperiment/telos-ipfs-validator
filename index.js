const multiparty = require('multiparty');
const http = require('http')
const ipfsClient = require('ipfs-http-client')
const EosApi = require('eosjs-api')
const config = require('./config.json')
console.log(config)
const ipfs = ipfsClient(config.ipfs.address, config.ipfs.port, { protocol: config.ipfs.protocol })

const options = {
	httpEndpoint: [config.nodeos.protocol, '://', config.nodeos.address, ':', config.nodeos.port].join(''), 
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

    let scope = null;
    if (
      fields.scope
      && fields.scope.length
      && ( fields.scope[0] !== "" )
    ) {
      scope = fields.scope[0];
    }

    if ( ! scope ) {
      res.writeHead(501, {'Content-type':'text/plain'});
      res.write('Missing scope.')
      res.end();
      return
    }

	  console.log('scope: ', scope)

    if ( files && files.file && files.file[0] && files.file[0].path ) {
      console.log(files.file[0])
      let path = files.file[0].path

      ipfs.addFromFs(path, {onlyHash: true}, (err, result) => {

        if (err) { throw err }

        console.log(result[0])
        let requestingHash = result[0].hash;

        eos.getTableRows({
          "json": true,
          "scope": scope,
          "code": config['ipfs.pay'].code,
          "table": config['ipfs.pay'].table
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
	      return
            })
          }
          else {
            res.writeHead(403, {'Content-type':'text/plain'});
            res.write('You need to buy space first.');
            res.end( );
	    return
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
      return
    }
  })


})

server.listen(7001)
