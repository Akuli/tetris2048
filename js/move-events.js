define([], function() {
  "use strict";

  function bindMoveEvents(callback) {
    const gameContainer = document.getElementById('game-container');

    document.addEventListener('keydown', event => {
      switch (event.key) {
      case 'ArrowLeft':
        callback('left');
        break;
      case 'ArrowRight':
        callback('right');
        break;
      case 'ArrowDown':
        callback('down all the way');
        break;
      case ' ':
        callback('down');
        break;
      }
    });

    // https://github.com/gabrielecirulli/2048/blob/master/js/keyboard_input_manager.js
    let touchStartClientX, touchStartClientY;
    let squareWidth, squareHeight;

    gameContainer.addEventListener('touchstart', event => {
      if (event.targetTouches.length === 1) {
        touchStartClientX = event.targetTouches[0].clientX;
        touchStartClientY = event.targetTouches[0].clientY;

        // the size of the squares is specified in the css, so i don't want to
        // have it here, this doesn't break if it's changed
        const style = window.getComputedStyle(gameContainer);
        squareWidth = +( /^([0-9]+)px$/.exec(style.gridAutoColumns)[1] );
        squareHeight = +( /^([0-9]+)px$/.exec(style.gridAutoRows)[1] );

        event.preventDefault();
      }
    });

    gameContainer.addEventListener('touchmove', event => {
      if (event.targetTouches.length === 1) {
        let deltaX = event.targetTouches[0].clientX - touchStartClientX;
        let deltaY = event.targetTouches[0].clientY - touchStartClientY;

        while (deltaX < -squareWidth) {
          callback('left');
          touchStartClientX -= squareWidth;
          deltaX += squareWidth;
        }
        while (deltaX > squareWidth) {
          callback('right');
          touchStartClientX += squareWidth;
          deltaX -= squareHeight;
        }
        while (deltaY > squareHeight) {
          callback('down');
          touchStartClientY += squareHeight;
          deltaY -= squareHeight;
        }

        event.preventDefault();
      }
    });

    gameContainer.addEventListener('touchend', event => {
      if (touchStartClientX !== null && touchStartClientY !== null) {
        event.preventDefault();
      }
      touchStartClientX = touchStartClientY = null;
    });
  }

  return bindMoveEvents;
});
