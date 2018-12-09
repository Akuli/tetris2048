(function() {
  "use strict";

  document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('game-container');
    const scoreElem = document.getElementById('score');

    const statusMessagesDiv = document.getElementById('status-messages');
    const bigStatusElem = document.getElementById('big-status');
    const smallStatusElem = document.getElementById('small-status');

    require(['./js/game-logic.js', './js/move-events.js'], (gameLogic, bindMoveEvents) => {
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
      let useLocalStorage = true;   // disabling is mostly for running this thing from a file

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

          if (useLocalStorage) {
            try {
              window.localStorage.setItem('tetris2048-game', JSON.stringify(game.toJSON()));
            } catch(e) {
              console.log(e);
              useLocalStorage = false;
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
        } else if (game.state === gameLogic.GameState.OVER) {
          bigStatusElem.textContent = "Game Over :(";
          smallStatusElem.textContent = "Press F2 to play again!";
          statusMessagesDiv.classList.add('showing');
        } else {
          throw new Error("unknown game state: " + game.state);
        }

        if (game.state === gameLogic.GameState.PAUSED) {
          document.getElementById('pause-button').textContent = "Unpause (P)";
        } else {
          document.getElementById('pause-button').textContent = "Pause (P)";
        }
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

      let intervalId = null;

      function onTimeout() {
        game.doSomething();
        refresh();

        if (game.state === gameLogic.GameState.OVER) {
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

      function loadGameFromLocalStorage() {
        try {
          const stored = window.localStorage.getItem('tetris2048-game');
          if (typeof stored === 'string') {   // not e.g. null
            return gameLogic.Game.fromJSON(JSON.parse(stored));
          }
        } catch(e) {
          console.log(e);   // eslint-disable-line no-console
        }

        return new gameLogic.Game();
      }

      setCurrentGame(loadGameFromLocalStorage());

      document.getElementById('new-game-button').addEventListener('click', () => {
        setCurrentGame(new gameLogic.Game());
      });
      document.getElementById('pause-button').addEventListener('click', () => {
        game.togglePause();
        refresh();
      });
    });
  });
}());
