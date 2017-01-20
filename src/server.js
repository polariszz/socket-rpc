import io from 'socket.io'

class Server {
    constructor(httpServer) {
        this.io = io(httpServer)
        this.slaves = {}
        this._handleEvents()
    }

    getIdByName(name) {
        var filtered = Object.keys(this.slaves).map(key => this.slaves[key]).filter(slave => slave.name == name)
        return filtered.length ? filtered[0].id : null;
    }

    getSlaves() {
        return this.slaves
    }

    run(id, funcName, ...params) {
        return new Promise((resolve, reject) => {
            if (!this.slaves[id] || !this.slaves[id].socket) {
                return reject("Invalid slave id " + id)
            }  else {
                var socket = this.slaves[id].socket

                socket.emit('rpc_exec', funcName, params, (res) => {
                    if (res.success) {
                        resolve(res.data)
                    } else {
                        reject(res.error)
                    }
                })
            }
        })
    }

    _handleEvents() {
        this.io.on('connection', function(socket) {
            var self = this
            var slave, id

            socket.on('meta', (data) => {
                if (data.type == 'slave') {
                    id = data.id
                    self.slaves[id] = slave = {
                        socket: socket,
                        ...data
                    }
                }
            })

            socket.on('disconnect', () => {
                if (this.slaves[id]) {
                    this.slaves[id] = null
                    delete this.slaves[id]
                }
            })
        }.bind(this))
    }
}

export default function(server) {
    return new Server(server)
}