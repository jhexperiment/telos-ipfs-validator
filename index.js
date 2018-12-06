const multiparty = require('multiparty');
const http = require('http')
const forward = require('http-forward')
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

//eos.getInfo({}).then(result => console.log(result))


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
      ipfs.addFromFs(path, {onlyHash: true}, (err, result) => {
        if (err) { throw err }
        console.log(result[0].hash)
	      let requestingHash = result[0].hash;
        eos.getTableRows({
          "json": true,
          "scope": 'testipfs1111',
          "code": 'ipfspay11111',
          "table": "storage",
//          "table_key": 'ipfs_url',
//          "lower_bound": 0,
        }).then(result => {

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

			})
		}

        }).catch((error) =>{
		console.log(error)
        })

	
      });

    }
  })


})

server.listen(7001)
