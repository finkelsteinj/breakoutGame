var x = 50,
    y = 250,
    dx = 3,
    dy = 3,
    canvasWidth = 800,
    canvasHeight = 600
    paddleWidth = 150,
    paddleHeight = 10,
    paddleX = (canvasWidth - paddleWidth) / 2,
    paddleY = canvasHeight - paddleHeight - 5,
    paddledX = 5,
    brickWidth = (canvasWidth - 10) / 13,
    brickHeight = 15,
    brickX = 5,
    brickY = 50,
    brickCol = 12,
    brickRow = 6,
    numberLives = 3,
    livesX = 30,
    livesY = 615,
    gameSpeed = 5,
    gameActive = true;

var bricksArr = [];
  for (var c = 0; c < brickCol; c++) {
    // creates a new empty array in 'bricks[]' at position 'c'
    bricksArr[c] = [];
    for (var r = 0; r < brickRow; r++) {
      // creates a new brick, in 'brick[c]' at postion 'r'
      bricksArr[c][r] = { x: 0, y: 0, status: 1};
    }
  }

var livesArr = [];
  for (var r = 0; r < numberLives; r++) {
    livesArr[r] = { x: 0, status: 1};
  }

function menu() {

}

function startGame() {
  gameArea.start();
  ball = new ballComponent(x, y, 10, "#0892d0");
  paddle = new paddleComponent(paddleX,
                                paddleY,
                                paddleWidth,
                                paddleHeight,
                                "gray");
  bricks = new brickComponents(brickX,
                                brickY,
                                brickWidth,
                                brickHeight,
                                "#0892d0");
  lives = new livesComponent(livesX, livesY, 10, "#0892d0");
}

var gameArea = {
  canvas : document.createElement("canvas"),
  start : function() {
    this.canvas.width = canvasWidth;
    this.canvas.height = canvasHeight + 40;
    this.context = this.canvas.getContext("2d");
    this.canvas.style.position = "absolute";
    this.canvas.style.left = "550px";
    document.body.insertBefore(this.canvas, document.body.childNodes[0]);
    this.interval = window.requestAnimationFrame(updateGameArea);

    // keyboard movement - 37 is left arrow - 39 is right arrow
    window.addEventListener('keydown', function (e) {
        e.preventDefault();
        gameArea.keys = (gameArea.keys || []);
        gameArea.keys[e.keyCode] = (e.type == "keydown");
    })
    window.addEventListener('keyup', function (e) {
        gameArea.keys[e.keyCode] = (e.type == "keydown");
    })
  },
  clear : function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },
  reset : function() {
    this.clear();
    startGame();
  }
}


// creates paddle object
function paddleComponent(x, y, width, height, color) {
  this.width = width;
  this.height = height;
  this.x = x;
  this.y = y;

  this.update = function() {
    ctx = gameArea.context;
    ctx.fillStyle = color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  // checks if the ball collides between the x and y pos of the paddle
  this.checkCollisionWithPaddle = function() {
    if (ball.y >= this.y - ball.radius
        && ball.y <= this.y + this.height - ball.radius
        && ball.x >= this.x - ball.radius
        && ball.x <= this.x + this.width + ball.radius) {
            return true;
            console.log('ball-paddle collision')
    } else {
      return false;
    }
  }

  this.bounceOffPaddle = function() {
    if (paddle.checkCollisionWithPaddle() === true) {

      // if ball collides w/ left side of paddle, ball goes left
      if (ball.x + ball.radius <= this.x + (this.width / 2)) {
        dx = -(Math.abs(dx));
        console.log('ball collides w/ left side of paddle')

       // if ball collides w/ right side of paddle, ball goes right
     } else if (ball.x + ball.radius > this.x + (this.width / 2)) {
        dx = Math.abs(dx);
         console.log('ball collides w/ right side of paddle')
      }

      playBoop();
      dy = -dy;
    }
  }

  // blocks paddle from going too far left or right of canvas
  this.keepPaddleInGameArea = function() {
    if (this.x <= 0)
      this.x = 0;

    if (this.x + this.width >= canvasWidth)
      this.x = canvasWidth - this.width;
  }
}


// creates ball object
function ballComponent(x, y, radius, color) {
  this.radius = radius;
  this.x = x;
  this.y = y;

  this.update = function() {
    ctx = gameArea.context;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
  }

  this.hitSideWalls = function() {
    if (this.x + dx < this.radius
          || this.x + dx > canvasWidth - this.radius)
      dx = -dx;
  }

  this.hitTopWall = function() {
    if (this.y + dy < this.radius)
      dy = -dy;
  }

  this.hitFloor = function() {
    if (this.y + dy > canvasWidth - this.radius) {
      console.log('Out of Bounds')

      // reset ball position
      this.x = x;
      this.y = y;
      this.dx = Math.abs(dx);
      this.dy = Math.abs(dy);

      numberLives = numberLives - 1;
      console.log('Number of Lives: ' + numberLives)
      livesArr[numberLives].status = 0;
    }
  }
}


//creates brick components
function brickComponents(x, y, width, height, color) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;

  this.update = function() {
    for (var c = 0; c < brickCol; c++) {
      for (var r = 0; r < brickRow; r++) {
        if (bricksArr[c][r].status == 1) {
          this.x = (c * (this.width + 5)) + 7;
          this.y = (r * (this.height + 5)) + 50;

          bricksArr[c][r].x = this.x;
          bricksArr[c][r].y = this.y;

          ctx = gameArea.context;
          ctx.fillStyle = color;
          ctx.fillRect(this.x, this.y, this.width, this.height);
        }
      }
    }
  }

  this.brickCollision = function() {
    for (c = 0; c < brickCol; c++) {
      for (r = 0; r < brickRow; r++) {
        var b = bricksArr[c][r];

        if (b.status == 1
            && ball.y >= b.y - ball.radius
            && ball.y <= b.y + this.height + ball.radius
            && ball.x >= b.x - ball.radius
            && ball.x <= b.x + this.width + ball.radius) {
                dy = -dy;
                b.status = 0;
                playBoop();
                console.log('ball intersects y-pos of brick')
                updateScore();
        }
      }
    }
  }

  this.isBrickActive = function() {
    for (c = 0; c < brickCol; c++) {
      for (r = 0; r < brickRow; r++) {
        return bricksArr[c][r] = 1;
      }
    }
  }

  this.resetBricks = function() {
    if(bricksArr.some(isBrickActive) !== true) {
      for (c = 0; c < brickCol; c++) {
        for (r = 0; r < brickRow; r++) {
          var b = bricksArr[c][r];
          b.status = 1;
        }
      }
    }
  }
}


function playBoop() {
  var boopSound = new Audio("boop.mp3");
  boopSound.play();
}

function playGameOver() {
  var gameOverSound = new Audio("game over.mp3");
  gameOverSound.play();
}

function livesComponent(x, y, radius, color) {
  this.x = x;
  this.y = y;
  this.radius = radius;

  this.update = function() {
    for (r = 0; r < numberLives; r++) {
      var l = livesArr[r];

      if (l.status == 1) {
        ctx = gameArea.context;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.closePath();

        this.x = this.x + (this.radius * 2) + 5;
      }
    }
    this.x = x;
  }

  this.checkLives = function() {
    if (numberLives <= 0) {
      gameArea.clear();

      ctx = gameArea.context;
      ctx.font = "100px Arial";
      ctx.fillStyle = "red";
      ctx.textAlign = "center";
      ctx.fillText("GAME OVER", canvasWidth / 2, canvasHeight / 2);
      playGameOver();
      gameActive = false;
    }
  }
}

// once called, 100 points are added to the score
function updateScore() {
    if (numberLives > 0) {
      var score = document.getElementById('score');
      var scoreNumber = +score.innerHTML;
      scoreNumber = scoreNumber + 100;
      score.innerHTML = scoreNumber;
    }
  }


// functions run every interval, as long as gameArea.start is running
function updateGameArea() {
  if (gameActive != false) {
    requestAnimationFrame(updateGameArea);
    gameArea.clear();
    if (gameArea.keys && gameArea.keys[37]) { paddle.x -= paddledX; }
    if (gameArea.keys && gameArea.keys[39]) { paddle.x += paddledX; }
    ball.x += dx;
    ball.y += dy;
    ball.update();
    ball.hitSideWalls();
    ball.hitTopWall();
    ball.hitFloor();
    paddle.update();
    paddle.bounceOffPaddle();
    paddle.keepPaddleInGameArea();
    bricks.update();
    bricks.brickCollision();
    bricks.resetBricks();
    lives.update();
    lives.checkLives();
  }
}
