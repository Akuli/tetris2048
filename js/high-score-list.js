define(['./local-storage.js'], function(localStorageManager) {
  "use strict";

  const highScoreListElem = document.getElementById('high-score-list');
  const noHighScoresMessage = document.getElementById('no-high-scores');

  const HIGH_SCORES_MAX = 10;

  function loadHighScores() {
    const storedHighScores = localStorageManager.get('highScores');
    if (storedHighScores !== null) {
      try {
        return JSON.parse(storedHighScores);
      } catch(e) {
        console.log(e);     // eslint-disable-line no-console
      }
    }
    return [];
  }

  const highScores = loadHighScores();
  highScores.sort((a, b) => b-a);   // numeric sort, biggest to smallest
  highScores.splice(HIGH_SCORES_MAX);

  function saveHighScores() {
    localStorageManager.set('highScores', JSON.stringify(highScores));
  }

  function updateHighScoreView() {
    highScoreListElem.innerHTML = '';
    if (highScores.length === 0) {
      noHighScoresMessage.style.display = '';
    } else {
      noHighScoresMessage.style.display = 'none';
      for (const score of highScores) {
        const li = document.createElement('li');
        li.textContent = '' + score;
        highScoreListElem.appendChild(li);
      }
    }
  }
  updateHighScoreView();

  // returns true if the score ends up in the list, false otherwise
  function addPossibleHighScore(score) {
    if (highScores.length === HIGH_SCORES_MAX && score <= Math.min(...highScores)) {
      return false;
    }

    highScores.push(score);
    highScores.sort((a, b) => b-a);
    highScores.splice(HIGH_SCORES_MAX);
    saveHighScores();
    updateHighScoreView();
    return true;
  }

  return addPossibleHighScore;
});
