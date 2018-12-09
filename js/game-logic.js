define([], function() {
  "use strict";
  const WIDTH = 7;
  const HEIGHT = 15;

  const GameState = Object.freeze({ RUNNING: 1, PAUSED: 2, OVER: 3 });

  class Block {
    constructor(game) {
      this._game = game;
      this.x = Math.floor(WIDTH / 2);
      this.y = HEIGHT;
      this.number = 1;
    }

    _move(deltaX, deltaY) {
      if (this._game.state !== GameState.RUNNING) {
        return false;
      }

      const newX = this.x + deltaX;
      const newY = this.y + deltaY;
      if (newX < 0 ||
          newX >= WIDTH ||
          newY < 0 ||
          this._game.frozenSquares[newX + ',' + newY] !== undefined) {
        return false;
      }

      this.x = newX;
      this.y = newY;
      return true;
    }

    moveLeft() { return this._move(-1, 0); }
    moveRight() { return this._move(+1, 0); }
    moveDown() { return this._move(0, -1); }
    moveDownAllTheWay() { while(this.moveDown()){} }
  }

  // https://stackoverflow.com/a/6274381
  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  class Game {
    constructor() {
      this.movingBlock = null;
      this.frozenSquares = {};
      this.state = GameState.RUNNING;
      this.addBlock();

      this._mergePlaces = [];
      for (let x = 0; x < WIDTH; x++) {
        for (let y = 0; y < HEIGHT; y++) {
          if (y+1 !== HEIGHT) { this._mergePlaces.push([ x, y, x, y+1 ]); }
          if (x+1 !== WIDTH)  { this._mergePlaces.push([ x, y, x+1, y ]); }
        }
      }

    }

    get score() {
      let result = 0;
      for (let x = 0; x < WIDTH; x++) {
        for (let y = 0; y < HEIGHT; y++) {
          if (this.frozenSquares[x + ',' + y] !== undefined) {
            result += this.frozenSquares[x + ',' + y];
          }
        }
      }
      return result;
    }

    get delay() {
      return 700 - this.score;
    }

    addBlock() {
      this.movingBlock = new Block(this);
    }

    numberAt(x, y) {
      const number = this.frozenSquares[x + ',' + y];
      if (number !== undefined) {
        return number;
      }
      if (this.movingBlock.x === x && this.movingBlock.y === y) {
        return this.movingBlock.number;
      }
      return null;
    }

    freezeMovingBlock() {
      this.frozenSquares[this.movingBlock.x + ',' + this.movingBlock.y] = this.movingBlock.number;
    }

    // this is O(n^wat)
    mergeBlocks() {
      while (true) {
        let didSomething = false;

        shuffle(this._mergePlaces);
        for (const [x1, y1, x2, y2] of this._mergePlaces) {
          const number1 = this.frozenSquares[x1 + ',' + y1];
          const number2 = this.frozenSquares[x2 + ',' + y2];
          if (number1 === undefined || number2 === undefined || number1 !== number2) {
            continue;
          }

          const points = [ x1 + ',' + y1, x2 + ',' + y2 ];
          shuffle(points);
          this.frozenSquares[points[0]] *= 2;
          delete this.frozenSquares[points[1]];
          didSomething = true;
          break;
        }

        if (!didSomething) {
          return;
        }
      }
    }

    doSomething() {
      if (this.state !== GameState.RUNNING) {
        return;
      }

      if (this.movingBlock.moveDown()) {
        return;
      }
      this.freezeMovingBlock();
      this.mergeBlocks();
      this.addBlock();

      for (let x = 0; x < WIDTH; x++) {
        if (this.frozenSquares[x + ',' + HEIGHT] !== undefined) {
          this.state = GameState.OVER;
          break;
        }
      }
    }

    togglePause() {
      if (this.state === GameState.RUNNING) {
        this.state = GameState.PAUSED;
      } else if (this.state === GameState.PAUSED) {
        this.state = GameState.RUNNING;
      }
    }

    toJSON() {
      return {
        movingBlockX: this.movingBlock.x,
        movingBlockY: this.movingBlock.y,
        frozenSquares: this.frozenSquares,
        state: this.state
      };
    }

    static fromJSON(json) {
      if (typeof json.movingBlockX !== 'number' ||
          typeof json.movingBlockY !== 'number' ||
          typeof json.frozenSquares !== 'object' ||   // TODO: validate better?
          !Object.values(GameState).includes(json.state)) {
        throw new Error("invalid game state json: " + json);
      }

      const game = new Game();
      game.movingBlock.x = json.movingBlockX;
      game.movingBlock.y = json.movingBlockY;
      game.frozenSquares = json.frozenSquares;
      game.state = json.state;
      return game;
    }
  }


  return {
    WIDTH: WIDTH,
    HEIGHT: HEIGHT,
    Game: Game,
    GameState: GameState
  };
});
