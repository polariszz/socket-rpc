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