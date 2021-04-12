const config = require('./config.js')
const Db = require('./Db.js')
const FarmGame = require('./FarmGame.js')
const ModuleStorage = require('./ModuleStorage.js')
const WebServer = require('./WebServer.js')
const WebSocketServer = require('./WebSocketServer.js')
const TwitchBot = require('./TwitchBot.js')
const HelixClient = require('./TwitchHelixClient.js')
const express = require('express')
const { render, logger } = require('./fn.js')

const log = logger(__filename)

const db = new Db(config.db.file)

// make sure db is at latest patch level each start..
db.patch(config.db.patches_dir, false)

const START_MODE = {
  NORMAL: 'normal',
  TWITCH_AUTH: 'twitch-auth',
  NONE: 'none',
}
;(async () => {
  let startMode = START_MODE.NORMAL
  // make sure config is ok (access tokens etc exist)...
  for (let idx in config.bot.twitch_channels) {
    const ch = config.bot.twitch_channels[idx]
    const path = `user.twitch_channels[${idx}]`
    log('checking twitch_channel "' + ch.channel_name + '"')
    if (!ch.channel_id) {
      const helixClient = new HelixClient(
        config.bot.client_id,
        config.bot.client_secret
      )
      const id = await helixClient.getUserIdByName(ch.channel_name)
      if (id === null) {
        startMode = START_MODE.NONE
        log(`Please fill ${path}.channel_name with a correct channel name`)
        break
      } else {
        startMode = START_MODE.TWITCH_AUTH
        log(`Please fill ${path}.channel_id: ${id}`)
      }
    }
    if (!ch.access_token) {
      startMode = START_MODE.TWITCH_AUTH
      const appUri = 'https://dev.twitch.tv/console/apps/' + config.bot.client_id
      const port = config.http.port
      const hostname = config.http.hostname
      const authUri = 'http://' + hostname + ':' + port
      log(`1. login to twitch as owner of ${config.bot.user} app`)
      log(`2. open ${appUri}`)
      log(`3. add ${authUri} to OAuth Redirect URLs`)
      log(`4. login to twitch as ${ch.channel_name}`)
      log(`5. open ${authUri}`)
      log(`6. click [Authorize]`)
      log(`7. copy the access_token and put it into ${path}.access_token`)
    }
  }

  const deferred = []
  const defer = (fn) => deferred.push(fn)
  const gracefulShutdown = (signal) => {
    if (signal) {
      log(`${signal} received...`)
    }

    deferred.forEach(fn => fn())

    log('shutting down...')
    process.exit()
  }

  // used by nodemon
  process.once('SIGUSR2', function () {
    gracefulShutdown('SIGUSR2')
  });

  process.once('SIGINT', function (code) {
    gracefulShutdown('SIGINT')
  });

  process.once('SIGTERM', function (code) {
    gracefulShutdown('SIGTERM')
  });

  if (startMode === START_MODE.TWITCH_AUTH) {
    const app = express()
    app.get('/', async (req, res) => {
      res.send(await render('templates/twitch.twig', {
        clientId: config.bot.client_id,
      }))
    })
    const webServer = new WebServer(config.http)
    webServer.listen(app)

    defer(() => {
      log('shutting down webserver...')
      webServer.close()
    })
  } else if (startMode === START_MODE.NORMAL) {
    const twitchBot = new TwitchBot(config.bot)
    const storage = new ModuleStorage(db)
    const webServer = new WebServer(config.http)
    const webSocketServer = new WebSocketServer(config.ws)

    const farmGame = new FarmGame(twitchBot, storage, webSocketServer)

    const app = express()
    app.use('/static', express.static('./public/static'))
    app.get('/', async (req, res, next) => {
      await farmGame.page(req, res, next)
    })
    webSocketServer.listen(farmGame)
    webServer.listen(app)
    twitchBot.connect(farmGame)

    defer(() => {
      log('shutting down webserver...')
      webServer.close()
    })
    defer(() => {
      log('shutting down websocketserver...')
      webSocketServer.close()
    })
  } else {
    gracefulShutdown('')
  }
})()
