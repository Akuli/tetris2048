define([], function() {
  "use strict";

  function bindMoveEvents(keyElem, touchElem, callback) {
    console.log("boo");
    keyElem.addEventListener('keydown', event => {
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

    touchElem.addEventListener('touchstart', event => {
      if (event.targetTouches.length === 1) {
        console.log('touch starts')
        touchStartClientX = event.targetTouches[0].clientX;
        touchStartClientY = event.targetTouches[0].clientY;
        event.preventDefault();
      }
    });

    touchElem.addEventListener('touchmove', event => event.preventDefault());

    touchElem.addEventListener('touchend', event => {
      if (touchStartClientX !== null && touchStartClientY !== null) {
        const deltaX = event.changedTouches[0].clientX - touchStartClientX;
        const deltaY = event.changedTouches[0].clientY - touchStartClientY;
        console.log(deltaX, deltaY);

        if (Math.hypot(deltaX, deltaY) > 10) {
          if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // something horizontal
            if (deltaX > 0) {
              callback('right');
            } else {
              callback('left');
            }
          } else {
            if (deltaY > 0) {
              callback('down');
            }
            // else it's up, which is ignored
          }
        }
      }

      touchStartClientX = touchStartClientY = null;
    });
  }

  return bindMoveEvents;
});
