let load = document.getElementById('load')
let snakeloader = document.getElementById('snakeloader')
let regex = /\/g\/(.+)?\//

function selectElement(el) {
  window._name = el.target.dataset.name
  let snakeEl = document.getElementById('snakes')
  snakeEl.childNodes.forEach(node => {
    node.classList.remove('active')
  })
  el.target.classList.add('active')
}

chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
  console.log('LOADED')
  let gameId = tabs[0].url.match(regex)[1]

  fetch('https://engine.battlesnake.com/games/' + gameId, {
    method: 'GET'
  })
    .then(res => res.json())
    .then(res => {
      let names = res.LastFrame.Snakes.map(snake => snake.Name)
      let snakeEl = document.getElementById('snakes')
      names.forEach(name => {
        let node = document.createElement('div')
        node.setAttribute('data-name', name)
        node.onclick = selectElement
        let text = document.createTextNode(name)
        node.appendChild(text)
        snakeEl.appendChild(node)
      })
    })
})

load.onclick = function(element) {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    // Set the vars
    let turn = document.getElementById('turn').value
    chrome.tabs.executeScript(
      tabs[0].id,
      {
        code:
          'window.__turn = ' + turn + ';window.__name ="' + window._name + '";'
      },
      function() {
        chrome.tabs.executeScript(tabs[0].id, {
          file: 'download.js'
        })
      }
    )
  })
}
