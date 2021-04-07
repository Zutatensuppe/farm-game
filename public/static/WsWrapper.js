const MS = 1
const SECOND = 1000 * MS

/**
 * Wrapper around ws that
 * - buffers 'send' until a connection is available
 * - automatically tries to reconnect on close
 */
export default class WsWrapper {
  // actual ws handle
  handle = null

  // timeout for automatic reconnect
  reconnectTimeout = null

  // buffer for 'send'
  sendBuffer = []

  constructor(addr) {
    this.addr = addr

    this.onopen = () => {}
    this.onclose = () => {}
    this.onmessage = () => {}
  }

  send (txt) {
    if (this.handle) {
      this.handle.send(txt)
    } else {
      this.sendBuffer.push(txt)
    }
  }

  connect() {
    const ws = new WebSocket(this.addr)
    ws.onopen = (e) => {
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout)
      }
      this.handle = ws
      // should have a queue worker
      while (this.sendBuffer.length > 0) {
        this.handle.send(this.sendBuffer.shift())
      }
      this.onopen(e)
    }
    ws.onmessage = (e) => {
      this.onmessage(e)
    }
    ws.onclose = (e) => {
      this.handle = null
      this.reconnectTimeout = setTimeout(() => { this.connect() }, 1 * SECOND)
      this.onclose(e)
    }
  }
}
