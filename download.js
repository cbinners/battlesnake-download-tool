function buildUrl(game, turn) {
  return (
    'https://engine.battlesnake.com/games/' +
    game +
    '/frames?offset=' +
    turn +
    '&limit=1'
  )
}

function transformPoint(point) {
  return {
    x: point.X,
    y: point.Y
  }
}

function transformSnake(snake) {
  let body = snake.Body.map(transformPoint)
  return {
    id: snake.ID,
    name: snake.Name,
    body: body,
    head: body[0],
    length: body.length,
    health: snake.Health,
    shout: snake.Shout,
    squad: snake.Squad
  }
}

function transformFrameToInput(game, frameData) {
  let name = window.__name
  let data = frameData.Frames[0]

  let you = data.Snakes.find(snake => {
    return snake.Name == name
  })

  if (!you) {
    throw new Error('You must provide a valid snake name')
  }

  you = transformSnake(you)

  return {
    game: {
      id: game.Game.ID,
      ruleset: {
        name: game.Game.Ruleset.name,
        version: "",
        settings: {
          foodSpawnChance: parseInt(game.Game.Ruleset.foodSpawnChance),
          minimumFood: parseInt(game.Game.Ruleset.minimumFood),
          hazardDamagePerTurn: parseInt(game.Game.Ruleset.damagePerTurn),
          royale: {
            shrinkEveryNTurns: parseInt(game.Game.Ruleset.shrinkEveryNTurns)
          },
          squad: {
            allowBodyCollisions: game.Game.Ruleset.allowBodyCollisions === 'true',
            sharedElimination: game.Game.Ruleset.sharedElimination === 'true',
            sharedHealth: game.Game.Ruleset.sharedHealth === 'true',
            sharedLength: game.Game.Ruleset.sharedLength === 'true'
          }
        }
      },
      timeout: game.Game.SnakeTimeout
    },
    turn: data.Turn,
    board: {
      width: game.Game.Width,
      height: game.Game.Height,
      // Only grab alive snakes
      snakes: data.Snakes.filter(snake => snake.Death == null).map(
        transformSnake
      ),
      food: data.Food.map(transformPoint),
      hazards: data.Hazards.map(transformPoint)
    },
    you
  }
}

window.__regex = /\/g\/(.+)?\//
window.__gameId = window.location.href.match(window.__regex)[1]

fetch('https://engine.battlesnake.com/games/' + window.__gameId, {
  method: 'GET'
})
  .then(res => res.json())
  .then(game => {
    return fetch(buildUrl(window.__gameId, window.__turn), {
      method: 'GET'
    })
      .then(res => res.json())
      .then(res => {
        const savedata = JSON.stringify(transformFrameToInput(game, res))
        document.body.innerHTML +=
          '<a id="download" download="input-' +
          game.Game.ID +
          '-turn-' +
          window.__turn +
          '.json" href="data:text;charset=utf-8,' +
          encodeURIComponent(savedata) +
          '"></a>'
        document.getElementById('download').click()
      })
      .catch(err => {
        console.log(err)
      })
  })
