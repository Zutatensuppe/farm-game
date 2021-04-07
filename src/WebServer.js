class WebServer {
  constructor(httpConf) {
    this.conf = httpConf
    this.handle = null
  }

  listen(app) {
    const port = this.conf.port
    const hostname = this.conf.hostname
    const addr = `http://${hostname}:${port}`
    this.handle = app.listen(
      port,
      hostname,
      () => console.log(`server running on ${addr}`)
    )
  }

  close () {
    if (this.handle) {
      this.handle.close()
    }
  }
}

module.exports = WebServer
