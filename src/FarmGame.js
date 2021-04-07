const fn = require('./fn.js')
const { allPlaces, allThings, allActions, allGlobalEvents } = require('./FarmGameData.js')

const TICK_INTERVAL_SEC = 1

const INACTIVE_TIME = 5 * fn.MINUTE

// user
const userstate = {
  info: {
    id: '',
    display_name: '',
    login: '',
  },
  state: {
    action: {
      name: 'idle', // ['hunt', 'gather', 'idle'],
      args: [],
    },
    since: '', // since when current action is active
    queue: [], // list of actions to do after action finishes
  },
  inventory: {
    // type: amount
  },
  messages: [], // list of things that happened, but werent
                // announced in chat yet
}

// let bla = []
// allThings.forEach(thing => {
//   bla.push(recipeText(thing.thing))
// })
// console.log(bla.join(' '))

function userinfoByContext (context) {
  return {
    id: context['user-id'],
    display_name: context['display-name'],
    login: context['username'],
  }
}

function userinfoByRedemption (redemption) {
  return {
    id: redemption.user.id,
    display_name: redemption.user.display_name,
    login: redemption.user.login,
  }
}

function actualRecipeText(recipe) {
  const consumes = (recipe.consumes || []).map(item => `${item.amount} ${item.thing}`)
  const requires = (recipe.requires || []).map(item => `${item.amount} ${item.thing}`)
  return (
    consumes.join(', ')
    + (requires.length > 0 ? ` (+ own ${requires.join(', ')})` : '')
  )
}

function recipeText(thing) {
  for (const rec of allThings) {
    if (rec.thing !== thing || !rec.recipes) {
      continue
    }

    const all = []
    for (const recipe of rec.recipes) {
      const text = actualRecipeText(recipe)
      if (text) {
        all.push(text)
      }
    }
    if (all.length > 0) {
      return `📜 ${rec.thing}: ${all.join(' OR ')}`
    }
  }
  return '';
}

const itemDef = (thing) => {
  for (let item of allThings) {
    if (item.thing === thing) {
      return item
    }
  }
  return null
}

function actionText(action) {
  return `${action.name.replace(/e$/, '')}ing at ${action.location}`
}

function determineRandomItem(possibleEvents) {
  // chances are in percent (1-100)
  const rand = Math.random() * 100
  let chance = 0
  for (const item of possibleEvents) {
    chance += item.chance
    if (rand < chance) {
      return item
    }
  }
  return null
}

function findUserByUsername(users, username) {
  for (const user of Object.values(users)) {
    if (user.info.login === username) {
      return user
    }
    if (`@${user.info.login}` === username) {
      return user
    }
    if (user.info.display_name === username) {
      return user
    }
    if (`@${user.info.display_name}` === username) {
      return user
    }
  }
  return null
}

function createUserByUserinfo(users, userinfo) {
  users[userinfo.id] = users[userinfo.id] || JSON.parse(JSON.stringify(userstate))
  users[userinfo.id].info = userinfo
  return users[userinfo.id]
}

const canBuildRecipe = (user, recipe) => {
  for (const item of (recipe.requires || [])) {
    if (inventoryCount(user, item.thing) < item.amount) {
      return false
    }
  }
  for (const item of (recipe.consumes || [])) {
    if (inventoryCount(user, item.thing) < item.amount) {
      return false
    }
  }
  return true
}

function inventoryCount(user, thing) {
  return user.inventory[thing] || 0
}

function changeInventory (user, thing, amount) {
  user.inventory[thing] = user.inventory[thing] || 0
  user.inventory[thing] += amount
  if (user.inventory[thing] < 0) {
    user.inventory[thing] = 0
  }
}

function queueActions (user, actions) {
  for (const action of actions) {
    user.state.queue.push(action)
  }
}

function getNextQueuedAction (user) {
  const queue = user.state.queue || []
  return queue.length > 0 ? queue.shift() : null
}

function getCurrentUserAction (user) {
  return user.state.action || {name: 'idle', args: []}
}

function setCurrentUserAction (user, action) {
  user.state.action = action
  user.state.since = new Date().getTime()
}

function handle (that, item, user) {
  if (that.oneOf) {
    return handle(fn.getRandom(that.oneOf), item, user)
  }

  if (that.condition) {
    if (checkCondition(that.condition, user)) {
      return handle(that.then, item, user)
    }
    if (that.else) {
      return handle(that.else, item, user)
    }
    return []
  }

  if (that.effect) {
    const payload = {}
    payload.userinfo = user.info
    if (that.effect.message) {
      payload.message = that.effect.message
        .replace(/\{\{username\}\}/g, () => user.info.display_name)
        .replace(/\{\{thing\}\}/g, () => item.thing)
    }
    payload.changes = that.effect.changes.map(c => {
      const multiplier = c.multiplier
        ? (inventoryCount(user, c.multiplier) || 1)
        : 1
      const amount = c.amount * multiplier
      return { userinfo: user.info, thing: c.thing, amount }
    })
    return [
      ['user_change_inventory', payload],
    ]
  }
  console.log(that, item, user.info)
  throw new Error('[2021-02-07] Unknown thing to handle')
}

function checkCondition (condition, user) {
  if (condition.allOf) {
    for (const cond of condition.allOf) {
      if (!checkCondition(cond, user)) {
        return false
      }
    }
    return true
  }

  if (condition.anyOf) {
    for (const cond of condition.anyOf) {
      if (checkCondition(cond, user)) {
        // ok
        return true
      }
    }
    return false
  }

  if (condition.chance) {
    const ch = condition.chance / 100.0
    const rand = Math.random()
    return rand <= ch
  }

  //
  // TODO: other conditions than >=
  if (inventoryCount(user, condition.thing) >= condition.amount) {
    return true
  }

  return false
}

function getPlaceByName(name) {
  return allPlaces.find(place => place.name === name) || null
}

function getClosestPlaceByCoord(x, y) {
  const distances = allPlaces.map(place => {
    return {
      place,
      dist: Math.sqrt(
        Math.pow(Math.abs(place.location[0] - x), 2)
        + Math.pow(Math.abs(place.location[1] - y), 2)
      ),
    }
  })
  distances.sort((a, b) => a.dist - b.dist)
  return distances[0].place
}

class FarmGame {
  constructor(twitchBot, storage, wss) {
    this.storage = storage
    this.wss = wss
    this.name = 'farm-game'
    this.defaultSettings = {
      users: [],
    }

    const chatSay = fn.sayFn(twitchBot.getChatClient())
    const say = (txt) => {
      chatSay(txt)
      this.wssClientSay(txt)
    }

    this.evts = []

    this.data = this.storage.load(this.name, {
      users: {},
    })
    for (let id of Object.keys(this.data.users)) {
      if (typeof this.data.users[id].state.action === 'string') {
        this.data.users[id].state.action = {
          name: this.data.users[id].state.action,
          args: [],
        }
      }
      if (!this.data.users[id].state.queue) {
        this.data.users[id].state.queue = []
      }
    }

    const _USERS = () => this.data.users

    const _EVT_user_gamble = (user, payload) => {
      const keys = Object.keys(user.inventory)
      const key = fn.getRandom(keys)
      const num = fn.getRandomInt(1, user.inventory[key])
      if (Math.random() > .5) {
        changeInventory(user, 'rosette', num)
        say(`${user.info.display_name}, bet ${num} ${key} and won. Keeping it + gained ${num} 🏵️!`)
      } else {
        changeInventory(user, key, -num)
        say(`${user.info.display_name}, bet ${num} ${key} and lost it all ;_;`)
      }
    }

    const _EVT_user_plant_action = (user, payload) => {
      const item = itemDef(payload.thing)
      if (!item) {
        return
      }
      if (!item.plant) {
        say(`Dear ${user.info.display_name}, ${item.thing} cannot be planted! PunOko`)
        return
      }

      const ownedAmount = inventoryCount(user, payload.thing)
      const useAmount = Math.min(ownedAmount, payload.amount)
      if (useAmount > 0) {
        changeInventory(user, payload.thing, -useAmount)
        changeInventory(user, item.plant, useAmount)
        say(`${user.info.display_name} planted ${useAmount} ${payload.thing} and it became ${useAmount} ${item.plant}`)
      } else {
        say(`${user.info.display_name} cannot plant ${payload.thing} because they have none`)
      }
    }

    const _EVT_user_give_action = (user, payload) => {
      const targetUser = findUserByUsername(_USERS(), payload.target_username)
      if (!targetUser) {
        say(`${user.info.display_name}, cannot give to ${payload.target_username} who doesnt exist...`)
        return
      }

      const ownedAmount = inventoryCount(user, payload.thing)
      const useAmount = Math.min(ownedAmount, payload.amount)
      if (useAmount > 0) {
        changeInventory(user, payload.thing, -useAmount)
        changeInventory(targetUser, payload.thing, useAmount)
        say(`${user.info.display_name} gave ${targetUser.info.display_name} ${useAmount} ${payload.thing} <3`)
      } else {
        say(`${user.info.display_name} tried to give ${payload.amount} ${payload.thing} to ${targetUser.info.display_name}. But what you dont have you cannot give. BibleThump`)
      }
    }

    const _EVT_sabotage = (user, payload) => {
      const item = itemDef(payload.thing)
      const sabotageAmount = payload.amount

      const targetUser = findUserByUsername(_USERS(), payload.target_username)
      if (!targetUser) {
        say(`${user.info.display_name}, who are you targeting... ${payload.target_username}? I dont know that guy LUL`)
        return
      }

      const ownedAmount = inventoryCount(targetUser, payload.thing)
      if (ownedAmount >= sabotageAmount) {
        changeInventory(targetUser, item.thing, -sabotageAmount)
        say(`${user.info.display_name} destroyed ${sabotageAmount} ${item.thing} of ${targetUser.info.display_name} CurseLit 🏵️ CurseLit `)
        return
      }

      if (ownedAmount > 0 && ownedAmount < sabotageAmount) {
        changeInventory(targetUser, item.thing, -sabotageAmount)
        say(`${user.info.display_name} destroyed all ${item.thing} of ${targetUser.info.display_name} CurseLit 🏵️ CurseLit `)
        return
      }

      say(`${user.info.display_name} tried to destroy ${targetUser.info.display_name}s farm, but they dont even have one LUL`)
    }

    const _EVT_user_start_action = (user, payload) => {
      const actions = payload.actions

      const currentAction = getCurrentUserAction(user)

      // do one action immediately
      const immediateAction = currentAction.name === 'idle' ? actions.shift() : null
      if (immediateAction) {
        setCurrentUserAction(user, immediateAction)
        say(`${user.info.display_name} goes ${actionText(immediateAction)}.`)
      } else {
        say(`${user.info.display_name} is currently busy ${actionText(currentAction)}.`)
      }

      if (actions.length === 0) {
        return
      }

      // queue the rest
      const currentQueueLen = user.state.queue.length
      const hasCalendar = inventoryCount(user, 'calendar')
      const maxQueueLen = hasCalendar ? 10 : 3
      const calendarHint = hasCalendar
        ? ''
        : ' To increase the maximum queue length build a calendar.'
      const canQueue = maxQueueLen - currentQueueLen
      if (canQueue <= 0) {
        say(`${user.info.display_name} can not queue any more actions.${calendarHint}`)
        return
      }

      const toQueueActions = actions.slice(0, canQueue)
      queueActions(user, toQueueActions)
      if (actions.length > canQueue) {
        say(`${toQueueActions.length} of ${actions.length} actions could be queued.${calendarHint}`)
      } else {
        say(`${toQueueActions.length} actions were queued.`)
      }
    }

    const _EVT_finish_action = (user, payload) => {
      const action = payload.action

      if (allActions[action.name]) {
        const possibleEvents = allActions[action.name].events
        const randomItem = determineRandomItem(possibleEvents)
        let foundSomething = false
        if (randomItem) {
          const item = randomItem

          // on encounter, put the thing into the inventory
          if (item.to === 'encounter') {
            let amount = item.amount
              ? fn.getRandomInt(item.amount.min, item.amount.max)
              : 1
            changeInventory(user, item.thing, amount)
            say(`${user.info.display_name} came back from ${actionText(action)} and found ${amount} ${item.thing} PogChamp`)
            foundSomething = true
          }
        }
        if (!foundSomething) {
          say(`${user.info.display_name} came back from ${actionText(action)} but got nothing BibleThump`)
        }
      }
      const nextAction = getNextQueuedAction(user)
      setCurrentUserAction(user, nextAction || {name: 'idle', args: []})
    }

    const _EVT_user_chat = (user, payload) => {
      const possibleEvents = allActions['chat'].events
      const randomItem = determineRandomItem(possibleEvents)
      if (randomItem) {
        const item = randomItem
        if (item.to === 'encounter') {
          let amount = item.amount
            ? fn.getRandomInt(item.amount.min, item.amount.max)
            : 1
          changeInventory(user, item.thing, amount)
          say(`${user.info.display_name} found ${amount} ${item.thing} while chatting PogChamp`)
        }
      }
    }

    const _EVT_user_consume = (user, payload) => {
      const item = itemDef(payload.thing)

      if (!item) {
        say(`${payload.thing}? You cannot consume this, even tho i dont even know what it is...`)
        return
      }

      const ownedAmount = inventoryCount(user, item.thing)
      if (ownedAmount >= payload.amount) {
        changeInventory(user, item.thing, -payload.amount)
        say(`${user.info.display_name} consumed ${payload.amount} ${item.thing}. Nothing happened..`)
        return
      }
      if (ownedAmount > 0 && ownedAmount < payload.amount) {
        changeInventory(user, item.thing, -ownedAmount)
        say(`${user.info.display_name} consumed all their ${item.thing}. Nothing happened..`)
        return
      }

      say(`${user.info.display_name} so badly wanted to consume ${item.thing}, but has none :(`)
    }

    const _EVT_user_uses_recipe = (user, payload) => {
      const item = itemDef(payload.thing)

      if (!item) {
        say(`${payload.thing}? I don't even understand that! 🕺🏼`)
        return
      }

      if ((item.recipes || []).length > 0) {
        let built = 0
        for (let i = 0; i < payload.amount; i++) {
          for (const recipe of item.recipes) {
            if (!canBuildRecipe(user, recipe)) {
              continue
            }
            for (const ingredient of recipe.consumes) {
              changeInventory(user, ingredient.thing, -ingredient.amount)
            }
            changeInventory(user, item.thing, 1)
            built += 1
            break
          }
          if (built >= payload.amount) {
            break
          }
        }
        const notEnoughMsg = built < payload.amount
          ? `Didnt have enough ingredients to build ${payload.amount}.`
          : ''
        if (built > 0) {
          say(`${user.info.display_name} created ${built} ${item.thing} Kreygasm ${notEnoughMsg}`)
        } else {
          say(`${user.info.display_name} does not have the ingredients to build a ${item.thing}`)
        }
      } else if (item.help) {
        say(item.help)
      } else {
        say(`One does not simply build ${item.thing}!`)
      }
    }

    const _EVT_user_change_inventory = (user, payload) => {
      for (const change of payload.changes) {
        const changeUser = createUserByUserinfo(_USERS(), change.userinfo)
        changeInventory(changeUser, change.thing, change.amount)
      }
      if (payload.message) {
        say(payload.message)
      }
    }

    // loop stuff that happens because time passes
    this.interval = setInterval(() => {
      const now = new Date().getTime()

      for (const user of Object.values(this.data.users)) {
        // 1. Check if the user is coming back from an action
        // -----------------------------------------------------------
        if (
          allActions[user.state.action.name] &&
          allActions[user.state.action.name].duration
        ) {
          // TODO: maybe we could calculate the actual duration
          //       at the start of the action
          const actualDuration = fn.getRandomInt(
            allActions[user.state.action.name].duration.min,
            allActions[user.state.action.name].duration.max
          ) * fn.SECOND
          if (now > user.state.since + (actualDuration)) {
            // The user is finished with the action
            this.evts.push(['finish_action', {
              userinfo: user.info,
              action: user.state.action,
              multiplier: 1,
            }])
          }
        }

        // 2. Check some random global events happening
        // -----------------------------------------------------------
        for (const evt of allGlobalEvents) {
          this.evts.push(...handle(evt, null, user))
        }

        // 3. Check all things the user has, maybe they will do
        // something on their own
        // -----------------------------------------------------------
        for (let thing in user.inventory) {
          if (!inventoryCount(user, thing)) {
            continue
          }
          let item = itemDef(thing)
          if (!item) {
            continue
          }
          for (let gen of (item.gen || [])) {
            this.evts.push(...handle(gen, item, user))
          }
        }
      }

      const evts = this.evts.slice()
      this.evts = []
      for (const evt of evts) {
        const name = evt[0]
        const payload = evt[1]
        const user = createUserByUserinfo(_USERS(), payload.userinfo)
        switch (name) {
          case 'user_gamble': _EVT_user_gamble(user, payload); break;
          case 'user_plant_action': _EVT_user_plant_action(user, payload); break;
          case 'user_give_action': _EVT_user_give_action(user, payload); break;
          case 'sabotage': _EVT_sabotage(user, payload); break;
          case 'user_chat': _EVT_user_chat(user, payload); break;
          case 'finish_action': _EVT_finish_action(user, payload); break;
          case 'user_consume': _EVT_user_consume(user, payload); break;
          case 'user_uses_recipe': _EVT_user_uses_recipe(user, payload); break;
          case 'user_start_action': _EVT_user_start_action(user, payload); break;
          case 'user_change_inventory': _EVT_user_change_inventory(user, payload); break;
        }
      }

      if (evts.length > 0) {
        this.storage.save(this.name, this.data)
        this.updateClients('change')
      }
    }, TICK_INTERVAL_SEC * fn.SECOND);
  }

  recipeCmd (command, client, target, context, msg) {
    const say = fn.sayFn(client, target)

    if (command.args.length >= 1) {
      const reqthing = command.args.join(' ')
      say(recipeText(reqthing) || `I dont know how to make ${reqthing} 😭`)
      return
    }

    for (const rec of allThings) {
      if (rec.show) {
        say(recipeText(rec.thing))
      }
    }
    say('The others are well protected secrets');
  }

  inventoryCmd (command, client, target, context, msg) {
    const say = fn.sayFn(client, target)
    const userinfo = userinfoByContext(context)
    const user = createUserByUserinfo(this.data.users, userinfo)

    if (command.args.length >= 1) {
      const reqthing = command.args.join(' ')
      // specific item
      if (!itemDef(reqthing)) {
        say(`${reqthing}? There is no such thing :(`)
        return
      }

      const amount = inventoryCount(user, reqthing)
      say(`${user.info.display_name} has ${amount} ${reqthing}`)
      return
    }

    // all items
    const items = []
    const things = Object.keys(user.inventory)
    things.sort()
    for (const thing of things) {
      const amount = inventoryCount(user, thing)
      if (!amount) {
        continue
      }
      items.push({ thing, amount })
    }

    if (items.length > 0) {
      const msgs = items.map(item => `${item.amount} ${item.thing}`)
      say(`${user.info.display_name} has ${msgs.join(', ')}`)
    } else {
      say(`${user.info.display_name} got nothing! At all... try hunting, gathering or mining!`)
    }
  }

  helpCmd (command, client, target, context, msg) {
    const say = fn.sayFn(client, target)
    say(`Welcome to the farm game! Commands: `)
    say(`※ Show inventory: inv [THING]`)
    say(`※ Collect items by doing actions: hunt|fish|mine|gather`)
    say(`※ Build other items: build|make|create THING`)
    say(`※ Lookup the recipe for a thing: recipe THING`)
    say(`※ Give someone something: give USER THING`)
    say(`※ Consume something: consume THING`)
    say(`※ Gamble random things from your inventory: gamble`)
    say(`※ Show leaderboard: best`)
    say(`※ All recipes (may be outdated): https://pastebin.com/mrcne89k`)
  }

  plantCmd (command, client, target, context, msg) {
    const say = fn.sayFn(client, target)
    const userinfo = userinfoByContext(context)

    if (command.args.length === 0) {
      say(`Usage: plant [AMOUNT] THING`)
      return
    }

    const item = fn.split(command.args.join(' '), ' ', 2)
    let amount = 1
    let thing = item[0]
    if (item.length > 1 && item[0].match(/^\d+$/)) {
      amount = parseInt(item[0], 10)
      thing = item[1]
    }

    this.evts.push(['user_plant_action', {
      userinfo,
      thing,
      amount,
    }])
  }

  giveCmd (command, client, target, context, msg) {
    const say = fn.sayFn(client, target)
    if (command.args.length <= 1) {
      say(`Usage: give TARGET_USER [AMOUNT] ITEM`);
      return
    }

    const item = fn.split(command.args.slice(1).join(' '), ' ', 2)
    let amount = 1
    let thing = item[0]
    if (item.length > 1 && item[0].match(/^\d+$/)) {
      amount = parseInt(item[0], 10)
      thing = item[1]
    }

    this.evts.push(['user_give_action', {
      userinfo: userinfoByContext(context),
      target_username: command.args[0],
      thing,
      amount,
    }])
  }

  farmCmd (command, client, target, context, msg) {
    const say = fn.sayFn(client, target)
    say('In addition to the farm recipe (recipe farm) u can get a farm by channel points too! It will make your 🏵️ grow beautifully Kappa');
  }

  lbCmd (command, client, target, context, msg) {
    const say = fn.sayFn(client, target)
    let leaders = Object.values(this.data.users).map(user => {
      return {
        user_name: user.info.display_name,
        amount: inventoryCount(user, 'rosette')
      }
    }).filter(u => u.amount > 0)
    leaders.sort((a, b) => b.amount - a.amount)

    const lb = leaders.slice(0, 3).map((u, i) => {
      return `[${i + 1}. ${u.user_name} (${u.amount} 🏵️)]`
    }).join('　')
    say(lb)
  }

  buildCmd (command, client, target, context, msg) {
    if (command.args.length === 0) {
      say(`Usage: build|create|make [AMOUNT] THING`)
      return
    }

    const item = fn.split(command.args.join(' '), ' ', 2)
    let amount = 1
    let thing = item[0]
    if (item.length > 1 && item[0].match(/^\d+$/)) {
      amount = parseInt(item[0], 10)
      thing = item[1]
    }

    this.evts.push(['user_uses_recipe', {
      userinfo: userinfoByContext(context),
      thing,
      amount,
    }])
  }

  gambleCmd (command, client, target, context, msg) {
    this.evts.push(['user_gamble', {
      userinfo: userinfoByContext(context),
    }])
  }

  consumeCmd (command, client, target, context, msg) {
    if (command.args.length === 0) {
      say(`Usage: consume [AMOUNT] THING`)
      return
    }

    const item = fn.split(command.args.join(' '), ' ', 2)
    let amount = 1
    let thing = item[0]
    if (item.length > 1 && item[0].match(/^\d+$/)) {
      amount = parseInt(item[0], 10)
      thing = item[1]
    }

    this.evts.push(['user_consume', {
      userinfo: userinfoByContext(context),
      thing: thing,
      amount: amount,
    }])
  }

  async page (req, res, next) {
    res.send(await fn.render('templates/index.twig', {
      wsBase: this.wss.connectstring()
    }))
  }

  wsdata (eventName) {
    // only send active users to the clients
    const now = new Date().getTime()
    const activeUsers = Object.values(this.data.users).filter(u => {
      return u.state.since > (now - INACTIVE_TIME)
    })
    return {
      event: eventName,
      data: {
        places: allPlaces,
        users: activeUsers,
      },
    }
  }

  updateClient (eventName, ws) {
    this.wss.notifyOne(this.wsdata(eventName), ws)
  }

  updateClients (eventName) {
    this.wss.notifyAll(this.wsdata(eventName))
  }

  wssClientSay (txt) {
    this.wss.notifyAll({ event: 'say', data: txt })
  }

  getWsEvents () {
    return {
      'conn': (ws) => {
        this.updateClient('init', ws)
      },
    }
  }

  getCommands () {
    return {
      'help': [{ fn: this.helpCmd.bind(this) }],
      'recipe': [{ fn: this.recipeCmd.bind(this) }],
      'inv': [{ fn: this.inventoryCmd.bind(this) }],
      'inventory': [{ fn: this.inventoryCmd.bind(this) }],
      'create': [{ fn: this.buildCmd.bind(this) }],
      'build': [{ fn: this.buildCmd.bind(this) }],
      'make': [{ fn: this.buildCmd.bind(this) }],
      'farm': [{ fn: this.farmCmd.bind(this) }],
      'best': [{ fn: this.lbCmd.bind(this) }],
      'gamble': [{ fn: this.gambleCmd.bind(this) }],
      'consume': [{ fn: this.consumeCmd.bind(this) }],
      'give': [{ fn: this.giveCmd.bind(this) }],
      'plant': [{ fn: this.plantCmd.bind(this) }],
    }
  }

  onChatMsg (client, target, context, msg) {
    // use the original message, easier to work with :p
    const actions = msg.split(',').map(item => {
      // first word is action,
      // rest is args for the action (currently no args exist)
      const split = fn.split(item.trim(), ' ', 2)
      if (split.length === 1) {
        split.push('')
      }
      const name = split[0].trim().toLowerCase()

      const args = split[1].split(' ').map(arg => arg.trim())
      let location = null
      if (args.length > 1) {
        if (args[0].match(/\d+/) && args[1].match(/\d+/)) {
          location = getClosestPlaceByCoord(args[0], args[1])
        }
      }
      if (location === null) {
        location = getPlaceByName(args.join(' '))
      }
      if (location === null) {
        if (name === 'fish') {
          location = getPlaceByName('central lake')
        } else if (name === 'hunt') {
          location = getPlaceByName('northwood')
        } else if (name === 'mine') {
          location = getPlaceByName('old mountains')
        } else if (name === 'gather') {
          location = getPlaceByName('the ends')
        }
      }

      return { name, location: location ? location.name : '' }
    }).filter(action => {
      return [ 'fish', 'hunt', 'mine', 'gather' ].includes(action.name)
    })

    if (actions.length > 0) {
      this.evts.push(['user_start_action', {
        userinfo: userinfoByContext(context),
        actions: actions,
      }])
    } else {
      this.evts.push(['user_chat', {
        userinfo: userinfoByContext(context),
      }])
    }
  }

  onRewardRedemption (redemption) {
    const userinfo = userinfoByRedemption(redemption)

    if (redemption.reward.title === 'Buy a farm') {
      this.evts.push(['user_change_inventory', {
        userinfo,
        changes: [
          { userinfo: userinfo, thing: 'farm', amount: 1 },
        ],
      }])
    }
    if (redemption.reward.title === 'Buy a sauropod') {
      this.evts.push(['user_change_inventory', {
        userinfo,
        changes: [
          { userinfo: userinfo, thing: 'sauropod', amount: 1 },
        ],
      }])
    }
    if (redemption.reward.title === 'Destroy a farm') {
      this.evts.push(['sabotage', {
        userinfo: userinfo,
        target_username: redemption.user_input,
        thing: 'farm',
        amount: 1,
      }])
    }
    // redemption.reward
    // { id, channel_id, title, prompt, cost, ... }
    // redemption.user
    // { id, login, display_name}
    console.log(redemption)
  }
}

module.exports = FarmGame
