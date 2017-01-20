import socketio from 'socket.io-client'

function isFunction(obj) {
    return obj && {}.toString.call(obj) === '[object Function]';
}

class Slave {
    constructor(conf) {
        this.io = socketio(conf.url)
        this.id = conf.id
        this.name = conf.name

        this._handleEvents()

        this.funcMap = {
        }
    }

    register(funcName, func) {
        this.funcMap[funcName] = func
    }

    _handleEvents() {
        var io = this.io
        io.on('connect', function() {
            io.emit('meta', {
                id: this.id,
                name: this.name,
                type: 'slave',
            })
        }.bind(this))

        io.on('rpc_exec', function(funcName, params, cb) {
            if (!isFunction(this.funcMap[funcName])) {
                return cb.call(null, {
                    success: false,
                    error: "Non registered function " + funcName
                })
            }

            var res = this.funcMap[funcName].apply(null, params)
            if (isFunction(res.then) && isFunction(res.catch)) {
                res.then((data) => {
                    cb({
                        success: true,
                        data
                    })
                }).catch((error) => [
                    cb({
                        success: false,
                        error
                    })
                ])
            } else {
                cb.call(null, {
                    success: true,
                    data: res
                })
            }
        }.bind(this))
    }
}


export default function(conf) {
    return new Slave(conf)
}