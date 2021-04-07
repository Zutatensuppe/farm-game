const WebSocket = require('ws')

const pingInterval = 30000

class WebSocketServer {
  constructor(wsConf) {
    this.conf = wsConf
    this._websocketserver = null
    this._interval = null
  }

  connectstring() {
    return this.conf.connectstring
  }

  listen (farmGame) {
    this._websocketserver = new WebSocket.Server(this.conf)
    this._websocketserver.on('connection', (socket, request, client) => {
      const pathname = new URL(this.conf.connectstring).pathname
      if (request.url.indexOf(pathname) !== 0) {
        console.log('bad request url: ', request.url)
        socket.close()
        return
      }

      socket.isAlive = true
      socket.on('pong', function () {
        this.isAlive = true;
      })

      const evts = farmGame.getWsEvents()
      socket.on('message', (data) => {
        console.log(`ws| `, data)
        const d = JSON.parse(data)
        if (!d.event) {
          return
        }

        if (evts[d.event]) {
          evts[d.event](socket, d)
        }
      })
      if (evts['conn']) {
        evts['conn'](socket)
      }
    })

    this._interval = setInterval(() => {
      this._websocketserver.clients.forEach((socket) => {
        if (socket.isAlive === false) {
          return socket.terminate()
        }
        socket.isAlive = false
        socket.ping(() => {})
      })
    }, pingInterval)

    this._websocketserver.on('close', () => {
      clearInterval(this._interval)
    })
  }

  notifyOne(data, socket) {
    if (socket.isAlive) {
      console.log(`notifying (${data.event})`)
      socket.send(JSON.stringify(data))
    }
  }

  notifyAll (data) {
    this._websocketserver.clients.forEach((socket) => {
      this.notifyOne(data, socket)
    })
  }

  close () {
    if (this._websocketserver) {
      this._websocketserver.close()
    }
  }
}

module.exports = WebSocketServer
