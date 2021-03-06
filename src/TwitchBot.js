const tmi = require('tmi.js')
const twitchPubSub = require('./TwitchPubSub.js')
const fn = require('./fn.js')

const log = fn.logger(__filename)

class TwitchBot {
  constructor(botConf) {
    this.conf = botConf
    if (this.conf.twitch_channels.length === 0) {
      log(`* No twitch channels configured`)
      return
    }

    // https://github.com/tmijs/docs/blob/gh-pages/_posts/v1.4.2/2019-03-03-Configuration.md#configuration
    this.chatClient = new tmi.client({
      identity: {
        username: this.conf.username,
        password: this.conf.password,
      },
      options: {
        clientId: this.conf.client_id,
      },
      channels: this.conf.twitch_channels.map(ch => ch.channel_name),
      connection: {
        reconnect: true,
      }
    })

    this.pubSubClient = twitchPubSub.client()
  }

  connect(farmGame) {
    this.chatClient.on('message', async (target, context, msg, self) => {
      if (self) { return; } // Ignore messages from the bot
      log(`${context.username}@${target}: ${msg}`)
      const rawCmd = fn.parseCommandFromMessage(msg)
      const commands = farmGame.getCommands() || {}
      const cmdDefs = commands[rawCmd.name] || []
      for (let cmdDef of cmdDefs) {
        log(`${target}| * Executing ${rawCmd.name} command`)
        const r = await cmdDef.fn(rawCmd, this.chatClient, target, context, msg)
        if (r) {
          log(`${target}| * Returned: ${r}`)
        }
        log(`${target}| * Executed ${rawCmd.name} command`)
      }
      await farmGame.onChatMsg(this.chatClient, target, context, msg);
    })

    // Called every time the bot connects to Twitch chat
    this.chatClient.on('connected', (addr, port) => {
      log(`* Connected to ${addr}:${port}`)
    })

    // connect to PubSub websocket
    // https://dev.twitch.tv/docs/pubsub#topics
    this.pubSubClient.on('open', async () => {
      // listen for evts
      for (let ch of this.conf.twitch_channels) {
        if (ch.access_token && ch.channel_id) {
          this.pubSubClient.listen(
            `channel-points-channel-v1.${ch.channel_id}`,
            ch.access_token
          )
        }
      }
      this.pubSubClient.on('message', (message) => {
        if (message.type !== 'MESSAGE') {
          return
        }
        const messageData = JSON.parse(message.data.message)
        // channel points redeemed with non standard reward
        // standard rewards are not supported :/
        if (messageData.type === 'reward-redeemed') {
          // redemption.reward
          // { id, channel_id, title, prompt, cost, ... }
          // redemption.user
          // { id, login, display_name}
          farmGame.onRewardRedemption(messageData.data.redemption)
        }
      })
    })

    this.chatClient.connect()
    this.pubSubClient.connect()
  }

  getChatClient() {
    return this.chatClient
  }
}

module.exports = TwitchBot
