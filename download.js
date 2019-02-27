function buildUrl(game, turn) {
  return (
    'https://engine.battlesnake.io/games/' +
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
  return {
    id: snake.ID,
    name: snake.Name,
    body: snake.Body.map(transformPoint),
    health: snake.Health
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
      id: game.Game.ID
    },
    turn: data.Turn,
    board: {
      width: game.Game.Width,
      height: game.Game.Height,
      // Only grab alive snakes
      snakes: data.Snakes.filter(snake => snake.Death == null).map(
        transformSnake
      ),
      food: data.Food.map(transformPoint)
    },
    you
  }
}

window.__regex = /\/g\/(.+)?\//
window.__gameId = window.location.href.match(window.__regex)[1]

fetch('https://engine.battlesnake.io/games/' + window.__gameId, {
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
