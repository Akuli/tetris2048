define(['./game-logic.js', './move-events.js', './local-storage.js'], function(gameLogic, bindMoveEvents, localStorageManager) {
  "use strict";

  const gameContainer = document.getElementById('game-container');
  const scoreElem = document.getElementById('score');

  const statusMessagesDiv = document.getElementById('status-messages');
  const bigStatusElem = document.getElementById('big-status');
  const smallStatusElem = document.getElementById('small-status');

  const newGameButton = document.getElementById('new-game-button');
  const pauseButton = document.getElementById('pause-button');

  const squares = {};
  for (let x = 0; x < gameLogic.WIDTH; x++) {
    for (let y = 0; y < gameLogic.HEIGHT; y++) {
      const square = document.createElement('div');

      square.classList.add('square');
      square.style.gridColumn = x + 1;
      square.style.gridRow = gameLogic.HEIGHT - y;
      square.appendChild(document.createElement('div'));

      if (x === 0 && y === 0) { square.id = 'debugSquare'; }

      gameContainer.appendChild(square);
      squares[x + ',' + y] = square;
    }
  }

  let game = null;

  const NUMBER_OF_COLORS = 7;

  function refresh() {
    for (let x = 0; x < gameLogic.WIDTH; x++) {
      for (let y = 0; y < gameLogic.HEIGHT; y++) {
        const number = game.numberAt(x, y);
        const square = squares[x + ',' + y];

        for (let i = 0; i < NUMBER_OF_COLORS; i++) {
          square.classList.remove('color' + i);
        }
        square.classList.remove('empty');

        if (number === null) {
          square.childNodes[0].textContent = "";
          square.classList.add('empty');
        } else {
          square.childNodes[0].textContent = number;
          square.classList.add('color' + ( Math.round(Math.log2(number)) % NUMBER_OF_COLORS ));
        }
      }
    }

    scoreElem.textContent = "Score: " + game.score;

    if (game.state === gameLogic.GameState.RUNNING) {
      bigStatusElem.textContent = "";
      smallStatusElem.textContent = "";
      statusMessagesDiv.classList.remove('showing');
    } else if (game.state === gameLogic.GameState.PAUSED) {
      bigStatusElem.textContent = "Paused";
      smallStatusElem.textContent = "Press P to continue.";
      statusMessagesDiv.classList.add('showing');
    } else if (game.state === gameLogic.GameState.GAME_OVER_LOW_SCORE) {
      bigStatusElem.textContent = "Game Over :(";
      smallStatusElem.textContent = "Press F2 to play again!";
      statusMessagesDiv.classList.add('showing');
    } else if (game.state === gameLogic.GameState.GAME_OVER_HIGH_SCORE) {
      bigStatusElem.textContent = "Game Over :(";
      smallStatusElem.innerHTML = game.score + " is a high score!<br>Press F2 to play again.";
      statusMessagesDiv.classList.add('showing');
    } else {
      throw new Error("unknown game state: " + game.state);
    }

    if (game.state === gameLogic.GameState.PAUSED) {
      pauseButton.textContent = "Unpause (P)";
    } else {
      pauseButton.textContent = "Pause (P)";
    }

    localStorageManager.set('game', JSON.stringify(game.toJSON()));
  }

  let intervalId = null;

  function onTimeout() {
    if (game.doSomething()) {
      refresh();
    }

    if (game.state === gameLogic.GameState.GAME_OVER_LOW_SCORE ||
        game.state === gameLogic.GameState.GAME_OVER_HIGH_SCORE) {
      intervalId = null;
    } else {
      intervalId = window.setTimeout(onTimeout, game.delay);
    }
  }

  function setCurrentGame(theGame) {
    if (intervalId !== null) {
      window.clearInterval(intervalId);
    }

    game = theGame;
    refresh();
    intervalId = window.setTimeout(onTimeout, game.delay);
  }

  document.addEventListener('keydown', event => {
    let handled = true;

    switch (event.key) {
    case 'F2':
      setCurrentGame(new gameLogic.Game());
      break;
    case 'P':
    case 'p':
      game.togglePause();
      break;
    default:
      //console.log(event.key);
      handled = false;
      break;
    }

    if (handled) {
      refresh();
      event.preventDefault();
    }
  });

  bindMoveEvents(direction => {
    switch (direction) {
    case 'left':
      game.movingBlock.moveLeft();
      break;
    case 'right':
      game.movingBlock.moveRight();
      break;
    case 'down':
      game.movingBlock.moveDown();
      break;
    case 'down all the way':
      game.movingBlock.moveDownAllTheWay();
      break;
    default:
      throw new Error("unknown direction: " + direction);
    }
    refresh();
  });

  newGameButton.addEventListener('click', () => {
    setCurrentGame(new gameLogic.Game());
  });
  pauseButton.addEventListener('click', () => {
    game.togglePause();
    refresh();
  });

  function runGame() {
    let game = new gameLogic.Game();
    const storedGameString = localStorageManager.get('game');
    if (storedGameString !== null) {
      try {
        game = gameLogic.Game.fromJSON(JSON.parse(storedGameString));
      } catch(e) {
        console.log(e);     // eslint-disable-line no-console
      }
    }
    setCurrentGame(game);
  }

  return runGame;
});
