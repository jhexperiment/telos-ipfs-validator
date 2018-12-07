# telos-ipfs-validator


#### Install NodeJS
```
curl -sL https://deb.nodesource.com/setup_10.x | sudo bash -
sudo apt install nodejs
```
#### Clone repo
```
git clone https://github.com/jhexperiment/telos-ipfs-validator.git
cd telos-ipfs-validator
npm install
```

#### Edit config.json
```
{
  "server": {
    "port": 7001
  },
  "ipfs": {
    "address": "localhost",
    "port": 6001,
    "protocol": "http"
  },
  "nodeos": {
    "address": "stage.api.telosvoyager.io",
    "port": 2888,
    "protocol": "http"
  },
  "ipfs.pay": {
    "code": "ipfspay11111",
    "table": "storage"
  }
}
```

#### Start/Restart server
```
./start.sh
```

#### Stop server
```
./stop.sh
```

#### Log
```
tail -f validator.log
```


#### Deploy a ipfs.pay contract
```
teclos set contract ipfspay11111 ../telos/contracts/ipfs.pay ipfspay.wasm ipfspay.abi -p ipfspay11111
```
