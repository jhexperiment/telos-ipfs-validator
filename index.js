const Q = require('q');
const multiparty = require('multiparty');
const http = require('http');
const ipfsClient = require('ipfs-http-client');
const EosApi = require('eosjs-api');
const config = require('./config.json');

const ipfs = ipfsClient(config.ipfs.address, config.ipfs.port, { protocol: config.ipfs.protocol });

const options = {
  httpEndpoint: [config.nodeos.protocol, '://', config.nodeos.address, ':', config.nodeos.port].join(''),
  verbose: false, // API logging
  logger: { // Default logging functions
    log: console.log,
    error: console.error
  },
  fetchConfiguration: {}
};


const eos = EosApi(options);
const server = http.createServer(serverCb);
server.listen(config.server.port);


function serverCb(req, res) => {

  let newFileAdded = false;
  let fields, files, scope, uploadedFilePath, requestingHash, ipfsHashes, peerInfos;
  Q.fcall(parseForm)
  .then(getScope)
  .then(getUploadedFile)
  .then(genHash)
  .then(getOnChainTable)
  .then(validateNewHash)
  .then(addFileToIpfs)

  .then(getSwarmPeers)
  .then(calcReplicas)
  .then(pubsubToReplicas)

  .catch(errorHandler);

  return;

  function parseForm() {

    let parseFormDeferred = Q.defer();
    let form = new multiparty.Form();

    form.parse(req, parseFormCb);

    return parseFormDeferred.promise;

    function parseFormCb(err, _fields, _files) {

      fields = _fields;
      files = _files;

      if (
        ! (
          fields.scope
          && fields.scope.length
          && ( fields.scope[0] !== "" )
        )
      ) {
        parseFormDeferred.reject(new Error('Missing scope.'));
      }

      if ( ! (files && files.file && files.file[0] && files.file[0].path) ) {
        parseFormDeferred.reject(new Error('Missing file.'));
      }

      parseFormDeferred.resolve();
      return;
    }

  }

  function getScope() {

    scope = fields.scope[0];

  }

  function getUploadedFile() {

    uploadedFilePath = files.file[0].path;
  }

  function genHash() {

    let genHashDeferred = Q.defer();

    ipfs.addFromFs(path, {onlyHash: true}, addFromFsCb);

    return genHashDeferred.promise;

    function addFromFsCb(error, result) {

      if (error) {
        genHashDeferred.reject(error);
        return;
      }

      requestingHash = result[0].hash;
      genHashDeferred.resolve();
      return;
    }
  }

  function getOnChainTable() {

    let getOnChainTableDeferred = Q.defer();

    eos.getTableRows({
      "json": true,
      "scope": scope,
      "code": config['ipfs.pay'].code,
      "table": config['ipfs.pay'].table
    })
    .then(parseTableRows)
    .then(getOnChainTableDeferred.resolve)
    .catch(getOnChainTableDeferred.reject);

    return getOnChainTableDeferred.promise;

    function parseTableRows(result) {

      ipfsHashes = result.rows.map((currentValue, index, arr) => {

        return currentValue.ipfs_url;
      });
    }

  }

  function validateNewHash() {

    if ( ipfsHashes.indexOf(requestingHash) === -1 ) {

      throw new Error("File hash not authorized to add.")
    }

  }

  function addFileToIpfs() {

    let addFileToIpfsDeferred = Q.defer();

    ipfs.addFromFs(uploadedFilePath, {onlyHash: false}, addFromFsCb);

    return addFileToIpfsDeferred.promise;

    function addFromFsCb(error, result) {

      if (error) {
        addFileToIpfsDeferred.reject(error);
        return;
      }

      newFileAdded = true;
      addFileToIpfsDeferred.resolve();
      return;
    }
  }

  function getSwarmPeers() {

    let getSwarmPeers = Q.defer();

    ipfs.swarm.peers({ verbose: true }, swarmPeerCb);

    return getSwarmPeers.promise;

    function swarmPeerCb(error, _peerInfos) {

      if (error) {
        getSwarmPeers.reject(error);
        return;
      }

      peerInfos = _peerInfos;
      console.log('peerInfos', peerInfos)

      getSwarmPeers.resolve();
    }

  }

  function calcReplicas() {

  }

  function pubsubToReplicas() {

  }


  function errorHandler(error) {

    console.log(error,'\n');

    respond({
      httpStatusCode: 501,
      httpHeaders:  {'Content-type':'text/plain'},
      message: 'Invalid request.'
    });
    return null;

    function respond(options) {


      res.writeHead(option.httpStatusCode, options.httpHeaders, options.message);
      res.write('Missing file.')
      res.end();
    }
  }
}
