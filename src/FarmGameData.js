const allPlaces = [
  // forests
  {
    name: 'catsnout',
    type: 'forest',
    location: [106,200],
  },
  {
    name: 'northwood',
    type: 'forest',
    location: [500, 184],
  },
  {
    name: 'the mane',
    type: 'forest',
    location: [300, 185],
  },
  {
    name: 'waview forest',
    type: 'forest',
    location: [200, 492],
  },


  // mountains
  {
    name: 'catseye',
    type: 'mountain',
    location: [236,127],
  },
  {
    name: 'old mountains',
    type: 'mountain',
    location: [859, 188],
  },
  {
    name: 'tschoess hill',
    type: 'mountain',
    location: [665, 615],
  },
  {
    name: 'waview mountain',
    type: 'mountain',
    location: [175,689],
  },

  // lakes
  {
    name: 'central lake',
    type: 'lake',
    location: [599,328],
  },

  // plains
  {
    name: 'the ends',
    type: 'plains',
    location: [1010,420],
  },
  {
    name: 'heidland',
    type: 'plains',
    location: [633,102],
  },
  {
    name: 'wilderness',
    type: 'plains',
    location: [313,440],
  },
  {
    name: 'newport plains',
    type: 'plains',
    location: [163,575],
  },
]

// players can build these manually
const allThings = [
  { thing: 'ore' },
  { thing: 'gold' },
  { thing: 'leaf' },
  { thing: 'sand' },
  { thing: 'water' },
  { thing: 'feather' },
  { thing: 'diamond' },
  {
    thing: 'stone',
    recipes: [
      {
        consumes: [{thing: 'sand', amount: 10}],
        requires: [{thing: 'pressure-machine', amount: 1}],
      }
    ],
  },
  {
    thing: 'kirinokirino',
    recipes: [
      {consumes: [
        {thing: 'water', amount: 1},
        {thing: 'cat', amount: 1},
      ]}
    ],
    gen: [
      {
        condition: { allOf: [{chance: 0.005}, { thing: 'apple', amount: 1 }] },
        then: {
          effect: {
            changes: [{thing: 'apple', amount: -1}],
          },
          message: `A {{thing}} of {{username}} ate an apple 🍎`,
        },
      },
    ],
  },
  {
    thing: 'bacing',
    recipes: [
      {consumes: [
        {thing: 'musical-note', amount: 1},
        {thing: 'penguin', amount: 1},
        {thing: 'chess-board', amount: 1},
      ]}
    ],
  },
  {
    thing: 'paper',
    recipes: [
      { consumes: [ {thing: 'wood', amount: 2}, {thing: 'water', amount: 2} ]}
    ],
  },
  {
    thing: 'ink',
    recipes: [
      { consumes: [ {thing: 'bug', amount: 3} ] },
    ],
  },
  {
    thing: 'candle',
    recipes: [
      {consumes: [{thing: 'beewax', amount: 2}]}
    ],
  },
  {
    thing: 'calendar',
    recipes: [
      { consumes: [
        {thing: 'paper', amount: 1},
        {thing: 'ink', amount: 1 },
      ] },
    ],
  },
  {
    thing: 'rare kirino-stone',
    recipes: [
      {
        consumes: [
          {thing: 'kirinokirino', amount: 10},
          {thing: 'stone', amount: 10},
        ],
      },
    ],
  },
  {
    thing: 'rare bacing-stone',
    recipes: [
      {
        consumes: [
          {thing: 'bacing', amount: 10},
          {thing: 'stone', amount: 10},
        ],
      },
    ],
  },
  {
    thing: 'pressure-machine',
  },
  {
    thing: 'farm',
    recipes: [
      {
        consumes: [
          {thing: 'wood', amount: 10},
          {thing: 'stone', amount: 10},
        ],
      },
    ],
  },
  {
    thing: 'seed',
    plant: 'plant',
  },
  {
    thing: 'pinecone',
    plant: 'small tree',
  },
  {
    thing: 'small tree',
    gen: [
      {
        condition: {chance: 0.25},
        then: {
          effect: {
            changes: [ {thing: 'tree', amount: 1 }, {thing: 'small tree', amount: -1} ]
          },
          message: `A {{thing}} of {{username}} grew into a tree!`
        }
      },
    ]
  },
  {
    thing: 'string',
    recipes: [
      {
        consumes: [
          {thing: 'rope', amount: 3},
        ],
      },
    ],
  },
  {
    thing: 'guitar',
    recipes: [
      {
        consumes: [
          {thing: 'wood', amount: 1},
          {thing: 'string', amount: 1},
        ],
      },
    ],
  },
  {
    thing: 'violin',
    recipes: [
      {
        consumes: [
          {thing: 'wood', amount: 1},
          {thing: 'guitar', string: 1},
        ],
      },
    ],
  },
  {
    thing: 'piano',
    recipes: [
      { consumes: [ {thing: 'wood', amount: 5} ] },
    ],
  },
  {
    thing: 'musical-note',
    recipes: [
      { consumes: [ {thing: 'guitar', amount: 1} ] },
      { consumes: [ {thing: 'violin', amount: 1} ] },
      { consumes: [ {thing: 'piano', amount: 1} ] },
    ],
  },
  {
    thing: 'freezer',
    recipes: [
      { consumes: [
        {thing: 'metal', amount: 2},
        {thing: 'gold', amount: 2},
        {thing: 'stone', amount: 2},
      ]}
    ],
  },
  {
    thing: 'oven',
    recipes: [
      { consumes: [
        {thing: 'metal', amount: 2},
        {thing: 'stone', amount: 2},
        {thing: 'coal', amount: 2},
      ]}
    ],
  },
  {
    thing: 'ice',
    recipes: [
      {
        consumes: [ {thing: 'water', amount: 1} ],
        requires: [ {thing: 'freezer', amount: 1} ],
      },
    ],
  },
  {
    thing: 'penguin',
    recipes: [
      {
        consumes: [
          {thing: 'bird', amount: 2},
          {thing: 'ice', amount: 1},
        ],
      },
    ],
  },
  {
    thing: 'chess-board',
    recipes: [
      {
        consumes: [ {thing: 'wood', amount: 10} ],
      },
    ],
  },
  {
    thing: 'plant',
    recipes: [
      {
        consumes: [ {thing: 'seed', amount: 1} ],
        requires: [ {thing: 'farm', amount: 1} ],
      },
    ],
    gen: [
      // plant has tiny chance to grow into something...
      {
        condition: {chance: 0.1},
        then: {
          oneOf: [
            {effect: {
              changes: [ {thing: 'chili', amount: 1, multiplier: 'farm' }, {thing: 'plant', amount: -1} ],
              message: `A {{thing}} of {{username}} grew into a chili!`,
            }},
            {effect: {
              changes: [ {thing: 'hibiscus', amount: 1, multiplier: 'farm' }, {thing: 'plant', amount: -1} ],
              message: `A {{thing}} of {{username}} grew into a hibiscus!`,
            }},
            {effect: {
              changes: [ {thing: 'rosette', amount: 1, multiplier: 'farm' }, {thing: 'plant', amount: -1} ],
              message: `A {{thing}} of {{username}} grew into a rosette!`,
            }},
            {effect: {
              changes: [ {thing: 'rose', amount: 1, multiplier: 'farm' }, {thing: 'plant', amount: -1} ],
              message: `A {{thing}} of {{username}} grew into a rose!`,
            }},
            {effect: {
              changes: [ {thing: 'grass', amount: 1, multiplier: 'farm' }, {thing: 'plant', amount: -1} ],
              message: `A {{thing}} of {{username}} grew into a grass!`,
            }},
            {effect: {
              changes: [ {thing: 'hops', amount: 1, multiplier: 'farm' }, {thing: 'plant', amount: -1} ],
              message: `A {{thing}} of {{username}} grew into a hops!`,
            }},
            {effect: {
              changes: [ {thing: 'grape', amount: 1, multiplier: 'farm' }, {thing: 'plant', amount: -1} ],
              message: `A {{thing}} of {{username}} grew into a grape!`,
            }},
            {effect: {
              changes: [ {thing: 'carrot', amount: 1, multiplier: 'farm' }, {thing: 'plant', amount: -1} ],
              message: `A {{thing}} of {{username}} grew into a carrot!`,
            }},
            {effect: {
              changes: [ {thing: 'potato', amount: 1, multiplier: 'farm' }, {thing: 'plant', amount: -1} ],
              message: `A {{thing}} of {{username}} grew into a potato!`,
            }},
          ],
        },
      },
    ],
  }, // plant can grow into something else
  // these can grow from plants:
  {
    thing: 'grass',
    recipes: [
      { consumes: [ {thing: 'plant', amount: 1} ] },
    ],
  },
  {
    thing: 'rope',
    recipes: [
      { consumes: [ {thing: 'grass', amount: 3} ] },
    ],
  },
  {
    thing: 'birdtrap',
    recipes: [
      { consumes: [
        {thing: 'twig', amount: 3},
        {thing: 'rope', amount: 3},
      ] },
    ],
    gen: [
      {
        condition: {chance: 0.001},
        then: {
          oneOf: [
            {effect: {
              changes: [ {thing: 'twig', amount: 1} ],
              message: `A {{thing}} of {{username}} broke and only a twig is left.`
            }},
            {effect: {
              changes: [ {thing: 'rope', amount: 1} ],
              message: `A {{thing}} of {{username}} broke and only a rope is left.`
            }},
          ]
        }
      },
    ],
  },
  {
    thing: 'hibiscus',
    gen: [
      {
        condition: {chance: 0.001},
        then: {
          effect: {
            changes: [ {thing: 'seed', amount: 2} ],
            message: `A {{thing}} of {{username}} withered into 2 seed. 🏚️🥀.`
          },
        }
      },
    ],
  },
  { thing: 'coal' },
  { thing: 'egg' },
  { thing: 'fish' },
  { thing: 'beewax' },
  { thing: 'crab' },
  { thing: 'hops' }, // it can only grow from plant :(
  { thing: 'grape' }, // it can only grow from plant :(
  { thing: 'malt',
    recipes: [
      { consumes: [{thing: 'seed', amount: 3}] },
    ],
  },
  {
    thing: 'beer',
    recipes: [
      { consumes: [
        {thing: 'hops', amount: 1},
        {thing: 'water', amount: 1},
        {thing: 'malt', amount: 1},
      ] },
    ],
  },
  {
    thing: 'wine',
    recipes: [
      { consumes: [
        {thing: 'grape', amount: 2},
        {thing: 'water', amount: 1},
      ] },
    ],
  },
  {
    thing: 'slime',
    recipes: [
      { consumes: [
        {thing: 'water', amount: 1},
        {thing: 'glue', amount: 1},
      ] },
    ],
  },
  {
    thing: 'carrot',
  },
  {
    thing: 'potato',
  },
  {
    thing: 'carrot cake',
    recipes: [
      { consumes: [
        {thing: 'carrot', amount: 1},
        {thing: 'flour', amount: 1},
        {thing: 'water', amount: 1},
        {thing: 'egg', amount: 1},
        {thing: 'cream', amount: 1},
      ] },
    ],
  },
  {
    thing: 'flour',
    recipes: [
      { consumes: [ {thing: 'seed', amount: 3} ] }
    ],
  },
  {
    thing: 'bird',
    gen: [
      {
        condition: {chance: 0.05},
        then: {
          effect: {
            changes: [ {thing: 'egg', amount: 1} ],
            message: `A {{thing}} of {{username}} laid an egg SeemsGood`,
          }
        }
      },
      {
        condition: {chance: 0.05},
        then: {
          effect: {
            changes: [ {thing: 'feather', amount: 1} ],
            message: `A {{thing}} of {{username}} generated a feather SeemsGood`,
          }
        }
      },
    ],
  },
  {
    thing: 'rose',
    gen: [
      {
        condition: {chance: 0.001},
        then: {
          effect: {
            changes: [ {thing: 'seed', amount: 2} ],
            message: `A {{thing}} of {{username}} withered into 2 seed. 🏚️🥀.`
          }
        }
      },
    ],
  },
  {
    thing: 'chili',
  },
  {
    thing: 'black',
    recipes: [
      { consumes: [
        {thing: 'rosette', amount: 1},
        {thing: 'coal', amount: 1},
      ] },
    ],
  },
  {
    thing: 'flavor',
    recipes: [
      { consumes: [ {thing: 'rosette', amount: 1}, {thing: 'rose', amount: 1} ] },
    ],
  },
  {
    thing: 'hotness',
    recipes: [
      { consumes: [ {thing: 'rosette', amount: 1}, {thing: 'chili', amount: 1} ] },
    ],
  },
  {
    thing: 'coffee',
    recipes: [
      // good coffee :P
      { consumes: [
        {thing: 'blackness', amount: 1},
        {thing: 'flavor', amount: 1},
        {thing: 'hotness', amount: 1},
      ] },
      // normal coffee
      { consumes: [
        {thing: 'coffeebean', amount: 1},
        {thing: 'water', amount: 1}
      ] }
    ],
  },
  {
    thing: 'rosette',
    help: 'You cannot build a 🏵️, silly! But you can gamble stuff to get it, or it may grow from a plant.',
    gen: [
      {
        condition: {chance: 0.01},
        then: {
          effect: {
            changes: [ {thing: 'seed', amount: 10} ],
            message: `A {{thing}} of {{username}} withered into 10 seed. 🏚️🥀.`
          }
        }
      },
    ]
  },
  {
    thing: 'tree',
    gen: [
      {
        condition: {chance: 0.05},
        then: {
          effect: {
            changes: [ {thing: 'twig', amount: 5} ],
            message: `A {{thing}} of {{username}} withered into 5 twig. 🏚️🥀.`
          }
        }
      },
      {
        condition: {chance: 0.05},
        then: {
          effect: {
            changes: [ {thing: 'pinecone', amount: 1} ],
            message: `A {{thing}} of {{username}} generated a pinecone SeemsGood`,
          }
        }
      },
    ],
    help: 'You cannot build a tree, but you can plant seeds. maybe they will grow into a tree? (build plant)',
  },
  {
    thing: 'glue',
    recipes: [
      { consumes: [ {thing: 'seed', amount: 2}, {thing: 'beewax', amount: 2} ] },
    ],
  },
  {
    thing: 'fertilizer',
  },
  {
    thing: 'cheese',
  },
  {
    thing: 'meat',
  },
  {
    thing: 'steak',
    recipes: [
      {
        consumes: [{thing: 'meat', amount: 1}],
        requires: [{thing: 'campfire', amount: 1}],
      },
      {
        consumes: [{thing: 'meat', amount: 1}],
        requires: [{thing: 'oven', amount: 1}],
      }
    ]
  },
  {
    thing: 'campfire',
    recipes: [
      { consumes: [{thing: 'wood', amount: 1}] },
      { consumes: [{thing: 'twig', amount: 5}] },
    ],
    gen: [
      // campfire will go out quickly
      {
        condition: {chance: 1},
        then: {
          effect: {
            changes: [{thing: 'campfire', amount: -1}],
            message: '{{username}}s {{thing}} went out.'
          }
        }
      },
    ],
  },
  {
    thing: 'cat',
    recipes: [
      {consumes: [
        {thing: 'monkey', amount: 3},
        {thing: 'cheese', amount: 1},
        {thing: 'glue', amount: 1},
      ]}
    ],
    gen: [
      {
        condition: {chance: 0.01},
        then: {
          condition: { thing: 'meat', amount: 1 },
          then: {
            effect: {
              changes: [{thing: 'meat', amount: -1}]
            },
            message: `A {{thing}} of {{username}} ate 1 meat.`,
          },
          else: {
            effect: {
              changes: [{thing: 'cat', amount: -1}]
            },
            message: 'A {{thing}} of {{username}} wanted to eat some meat, but there was none and it left.'
          }
        }
      }
    ],
  },
  {
    thing: 'catgirl',
    recipes: [
      {consumes: [
        {thing: 'cat', amount: 1},
        {thing: 'girl', amount: 1},
      ]},
    ],
    help: 'it is hard to make a 🐱👧 :('
  },
  {
    thing: 'girl',
    recipes: [
      {consumes: [
        {thing: 'rosette', amount: 10},
        {thing: 'monkey', amount: 1},
        {thing: 'soul', amount: 1},
      ]}
    ],
  },
  {
    thing: 'monkey',
    recipes: [
      {consumes: [
        {thing: 'cat', amount: 1},
        {thing: 'glue', amount: 1},
        {thing: 'rosette', amount: 1},
      ]}
    ],
    gen: [
      {
        condition: {chance: 0.005},
        then: {
          condition: { thing: 'cheese', amount: 1 },
          then: {
            effect: {
              changes: [{thing: 'cheese', amount: -1}]
            },
            message: `A {{thing}} of {{username}} ate 1 cheese.`,
          },
          else: {
            effect: {
              changes: [{thing: 'monkey', amount: -1}]
            },
            message: 'A {{thing}} of {{username}} wanted to eat a cheese, but there was none and it left.'
          }
        }
      }
    ],
  },
  {
    thing: 'bug',
    gen: [
      {
        condition: {chance: 0.005},
        then: {
          condition: { thing: 'seed', amount: 1 },
          then: {
            effect: {
              changes: [{thing: 'seed', amount: -1}]
            },
            message: `A {{thing}} of {{username}} ate 1 seed.`,
          },
          else: {
            effect: {
              changes: [{thing: 'monkey', amount: -1}]
            },
            message: 'A {{thing}} of {{username}} wanted to eat a seed, but there was none and it left.'
          }
        }
      }
    ],
  },
  // it can be found, or tree withers and turns into some twigs
  {
    thing: 'twig',
  },
  {
    thing: 'wood',
    recipes: [
      {consumes: [ {thing: 'twig', amount: 3} ]},
      {consumes: [ {thing: 'tree', amount: 1} ]},
    ],
  },
  {
    thing: 'longbar',
    recipes: [
      {consumes: [ {thing: 'wood', amount: 10} ]},
    ],
  },
  {
    thing: 'zpiece',
    recipes: [
      {consumes: [ {thing: 'wood', amount: 10} ]},
    ],
  },
  {
    thing: 'spiece',
    recipes: [
      {consumes: [ {thing: 'wood', amount: 10} ]},
    ],
  },
  {
    thing: 'cage',
    recipes: [
      {consumes: [
        {thing: 'longbar', amount: 4},
        {thing: 'spiece', amount: 2},
        {thing: 'zpiece', amount: 2},
      ]},
    ],
  },
  {
    thing: 'bigcage',
    recipes: [
      {consumes: [
        {thing: 'cage', amount: 4},
        {thing: 'glue', amount: 2},
      ]},
    ],
  },
  {
    thing: 'hibiscus tea',
    recipes: [
      {consumes: [
        {thing: 'hibiscus', amount: 1},
        {thing: 'water', amount: 1},
      ]},
    ],
  },
  {
    thing: 'sauropod',
    gen: [
      {
        condition: {chance: 0.001},
        then: {
          condition: { thing: 'bigcage', amount: 1 },
          then: {
            effect: {
              changes: [
                {thing: 'bigcage', amount: -1 },
              ],
              message: `A {{thing}} of {{username}} tried to escape. The bigcage hold it back, but it got destroyed.`
            },
          },
          else: {
            effect: {
              changes: [
                {thing: 'bigcage', amount: -1},
                {thing: 'seed', amount: -1000},
              ],
              message: `A {{thing}} of {{username}} escaped and even took 1000 seeds with it :/`
            },
          },
        },
      },
      {
        condition: {chance: 0.001},
        then: {
          condition: {allOf: [{ thing: 'tree', amount: 10 }, { thing: 'rosette', amount: 5}]},
          then: {
            effect: {
              changes: [
                {thing: 'tree', amount: -10},
                {thing: 'rosette', amount: -5},
              ],
            },
            message: `A {{thing}} of {{username}} ate 10 trees and 5 rosettes.`,
          },
          else: {
            effect: {
              changes: [
                {thing: 'sauropod', amount: -1},
                // eat as many as possible:
                {thing: 'tree', amount: -10},
                {thing: 'rosette', amount: -5},
              ],
            },
            message: 'A {{thing}} {{username}} wanted to eat 10 trees and 5 rosettes, but there were not enough and it left.'
          }
        }
      }
    ],
  }
]

// events chances in total for each event may not be above 100
const allActions = {
  chat: {
    type: 'automatic',
    events: [
      // what can happen on chat?
      { thing: 'seed',     chance: 1,       to: 'encounter', amount: {min: 1, max: 5} },
      { thing: 'twig',     chance: 1,       to: 'encounter', amount: {min: 1, max: 5} },
      { thing: 'rose',     chance: 0.5,     to: 'encounter', amount: {min: 1, max: 1} },
      { thing: 'rosette',  chance: 0.5,     to: 'encounter', amount: {min: 1, max: 1} },
      { thing: 'cheese',   chance: 0.1,     to: 'encounter', amount: {min: 1, max: 1} },
      { thing: 'meat',     chance: 0.1,     to: 'encounter', amount: {min: 1, max: 1} },
      { thing: 'sauropod', chance: 0.0001,  to: 'encounter', amount: {min: 1, max: 1} },
    ]
  },
  hunt: {
    type: 'manual',
    duration: {min: 60, max: 60}, // in seconds
    events: [
      // what can happen on a hunt?
      { thing: 'sauropod', chance: 0.0001,  to: 'encounter', amount: {min: 1, max: 1} },
      { thing: 'cat',      chance: 5,       to: 'encounter', amount: {min: 1, max: 1} },
      { thing: 'monkey',   chance: 5,       to: 'encounter', amount: {min: 1, max: 1} },
      { thing: 'bug',      chance: 5,       to: 'encounter', amount: {min: 1, max: 1} },
      { thing: 'beer',     chance: 3,       to: 'encounter', amount: {min: 1, max: 1} },
      { thing: 'bird',     chance: 5,       to: 'encounter', amount: {min: 1, max: 1} },
      { thing: 'penguin',  chance: 0.5,     to: 'encounter', amount: {min: 1, max: 1} },
    ]
  },
  fish: {
    type: 'manual',
    duration: {min: 60, max: 60}, // in seconds
    events: [
      // what can happen on a fishing trip?
      { thing: 'whale',    chance: 0.01,    to: 'encounter', amount: {min: 1, max: 1} },
      { thing: 'shoe',     chance: 1,       to: 'encounter', amount: {min: 1, max: 1} },
      { thing: 'beer',     chance: 1,       to: 'encounter', amount: {min: 1, max: 1} },
      { thing: 'fish',     chance: 10,      to: 'encounter', amount: {min: 1, max: 2} },
      { thing: 'crab',     chance: 5,       to: 'encounter', amount: {min: 1, max: 2} },
    ]
  },
  gather: {
    type: 'manual',
    duration: {min: 60, max: 60}, // in seconds
    events: [
      // what can happen on a gather?
      { thing: 'seed',     chance: 20,      to: 'encounter', amount: {min: 2, max: 12} },
      { thing: 'grass',    chance: 20,      to: 'encounter', amount: {min: 1, max: 10} },
      { thing: 'cheese',   chance: 5,       to: 'encounter', amount: {min: 1, max: 1} },
      { thing: 'meat',     chance: 5,       to: 'encounter', amount: {min: 1, max: 1} },
      { thing: 'beewax',   chance: 5,       to: 'encounter', amount: {min: 1, max: 1} },
      { thing: 'tree',     chance: 0.5,     to: 'encounter', amount: {min: 1, max: 1} },
      { thing: 'twig',     chance: 5,       to: 'encounter', amount: {min: 1, max: 10} },
      { thing: 'bug',      chance: 1,       to: 'encounter', amount: {min: 1, max: 10} },
      { thing: 'water',    chance: 20,      to: 'encounter', amount: {min: 1, max: 12} },
      { thing: 'beer',     chance: 3,       to: 'encounter', amount: {min: 1, max: 5} },
      { thing: 'stone',    chance: 3,       to: 'encounter', amount: {min: 1, max: 5} },
      { thing: 'pinecone', chance: 10,      to: 'encounter', amount: {min: 1, max: 5} },
    ]
  },
  mine: {
    type: 'manual',
    duration: {min: 80, max: 80}, // in seconds
    events: [
      { thing: 'stone',      chance: 20,      to: 'encounter', amount: {min: 1, max: 5} },
      { thing: 'gold',       chance: 8,       to: 'encounter', amount: {min: 1, max: 5} },
      { thing: 'coal',       chance: 9,       to: 'encounter', amount: {min: 1, max: 5} },
      { thing: 'diamond',    chance: 5,       to: 'encounter', amount: {min: 1, max: 5} },
      { thing: 'skull',      chance: 0.01,    to: 'encounter', amount: {min: 1, max: 1} },
    ]
  },
}

const allGlobalEvents = [
  {
    // chance that some birds come and try to eat seeds
    condition: {allOf: [{chance: 0.05}, {thing: 'seed', amount: 1}] },
    then: {
      condition: { thing: 'birdtrap', amount: 1 },
      then: {
        effect: {
          changes: [ { thing: 'bird', amount: 1 } ],
          message: `A random bird wanted to pick a seed from {{username}}. But it is caught by the trap! +1 bird`,
        }
      },
      else: {
        condition: { thing: 'cat', amount: 1 },
        then: {
          effect: {
            changes: [ { thing: 'feather', amount: 1 } ],
            message: `A random bird wanted to pick a seed from {{username}}. But the 🐈🐈 protected it.`,
          },
        },
        else: {
          effect: {
            changes: [ { thing: 'seed', amount: -1 } ],
            message: `A random bird picked a seed of {{username}}. consider some protection 🐈`,
          },
        },
      },
    },
  },
]

module.exports = {
  allPlaces,
  allThings,
  allActions,
  allGlobalEvents,
}
