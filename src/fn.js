function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandom(array) {
  return array[getRandomInt(0, array.length - 1)]
}

function nonce(length) {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

const render = async (template, data) => {
  const {TwingEnvironment, TwingLoaderFilesystem} = require('twing')
  const loader = new TwingLoaderFilesystem(__dirname)
  const twing = new TwingEnvironment(loader)
  return twing.render(template, data)
}

const sayFn = (client, target) => (msg) => {
  const targets = target ? [target] : client.channels
  targets.forEach(t => {
    console.log(`saying in ${t}: ${msg}`)
    client.say(t, msg).catch(_ => {})
  })
}

const parseCommandFromMessage = (msg) => {
  const command = msg.trim().split(' ')
  return {name: command[0], args: command.slice(1)}
}

const split = (str, delimiter = ',', maxparts = -1) => {
  const split = str.split(delimiter)
  if (maxparts === -1) {
    return split
  }

  if (split.length <= maxparts) {
    return split
  }

  return [
    ...split.slice(0, maxparts - 1),
    split.slice(maxparts - 1).join(delimiter),
  ]
}

// convenience consts for time
const MS = 1
const SECOND = 1000 * MS
const MINUTE = 60 * SECOND

module.exports = {
  sayFn,
  parseCommandFromMessage,
  render,
  getRandomInt,
  getRandom,
  nonce,
  split,
  MS,
  SECOND,
  MINUTE,
}
