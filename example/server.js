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