A simple server-slave rpc framework powered by socket.io.

### Installation

```
npm install --save socket-rpc
```
Then import the modules to your projects
```
// using an ES6 transpiler, like babel
import { RPCServer } from 'socket-rpc'
import { RPCSlave } from 'socket-rpc'

// not using an ES6 transpiler
var RPCServer = require('socket-rpc').RPCServer
var RPCSlave = require('socket-rpc').RPCSlave
```


### Usage by exampley

```
// server.js

import express from 'express'
import http from 'http'
import { RPCServer } from '../src'

var app = express()
var server = http.Server(app)
var rpc = RPCServer(server)

app.get('/', (req, res) => {
    rpc.run('0', 'welcome', 'polaris').then((str) => {
        res.end(str)
    })
})

app.get('/add', (req, res) => {
    var slaveId = rpc.getIdByName('example')
    rpc.run(slaveId, 'add', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10).then((data) => {
        res.end("the sum of 1 to 10 is " + data)
    })
})

app.get('/listdir', (req, res) => {
    var slaves = rpc.getSlaves()
    Promise.all(Object.keys(slaves).map((id) => {
        return rpc.run(id, 'listdir', '..').then((data) => {
            res.send(JSON.stringify(data))
        })
    })).then(() => res.end())
})

server.listen(8000)
```

```
// client.js

import { RPCSlave } from '../src'

var client = RPCSlave({
    url: 'http://192.168.1.199:8000',
    id: 0,
    name: 'example'
})

client.register('welcome', name => 'hello ' + name)

client.register('add', (...args) => {
    return args.reduce((a, b) => a+b)
})

client.register('listdir', (path) => {
    var fs = require('fs')
    return new Promise((resolve, reject) => {
        fs.readdir(path, (err, files) => {
            if (err) reject(err)
            else resolve(files)
        })
    })
})
```

