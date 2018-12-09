(function() {
  "use strict";

  document.addEventListener('DOMContentLoaded', () => {
    require(['./js/game.js', './js/high-score-list.js'], (runGame, addHighScore) => {
      runGame(possibleHighScore => {
        addHighScore(possibleHighScore);
      });
    });
  });
}());
