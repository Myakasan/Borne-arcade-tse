var gameCore;
var puck;
var leftPaddle;
var rightPaddle;
var gameKeysHeld = {};

var GameDirection =
{
    UP: 1,
    DOWN : 2,
    LEFT: 3,
    RIGHT: 4
};

window.onload = function()
{
    GameInit();
};

function GameInit()
{
    gameCore = new GameCore();
    puck = new Puck();
    leftPaddle = new Paddle(false);
    rightPaddle = new Paddle(true);
    gameCore.update();
    gameCore.drawSplashScreen();
}

function GameCore()
{
    this.splashScreenIsVisible = true;
    this.canvas = document.getElementById("pong-gameboard");
    this.ctx = this.canvas.getContext("2d");
    this.canvas.height = 450;
    this.canvas.width = 800;
    this.ctx.height = this.canvas.height;
    this.ctx.width = this.canvas.width;
}

GameCore.prototype.update = function()
{
    if(!this.splashScreenIsVisible)
    {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawBoard();
        puck.update();
        leftPaddle.update();
        rightPaddle.update();
        this.checkPaddles(puck, leftPaddle, rightPaddle);
    }

    requestAnimFrame(this.update.bind(gameCore));
    this.trackControls();
}

GameCore.prototype.trackControls = function()
{
    if (gameKeysHeld["z"]) {
        leftPaddle.move(GameDirection.UP);
    }

    if (gameKeysHeld["s"]) {
        leftPaddle.move(GameDirection.DOWN);
    }

    if(gameKeysHeld["ArrowUp"]) {
        rightPaddle.move(GameDirection.UP);
    }

    if (gameKeysHeld["ArrowDown"]) {
        rightPaddle.move(GameDirection.DOWN);
    }

    if(this.splashScreenIsVisible)
    {
        if (gameKeysHeld[" "]) {
            this.splashScreenIsVisible = false;
            puck.serve();
        }
    }
}

GameCore.prototype.drawSplashScreen = function(paddle)
{
    this.splashScreenIsVisible = true;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = '#CCC';
    this.ctx.font = "45px Orbitron";

    if(paddle != null)
    {
        var victoryString = (!paddle.isRightPaddle) ? "Player one wins!" : "Player two wins!";
        this.ctx.fillText(victoryString, 300, 350);
    }

    this.ctx.fillText("Please press Spacebar to start.", 5, 250);
    this.ctx.save();

    leftPaddle.score = 0;
    rightPaddle.score = 0;
}

GameCore.prototype.drawBoard = function()
{
    this.ctx.beginPath();
    this.ctx.setLineDash([25,20]);
    this.ctx.moveTo(this.ctx.width/2, 0);
    this.ctx.lineTo(this.ctx.width/2, this.ctx.height);
    this.ctx.strokeStyle = "#CCC";
    this.ctx.lineWidth = 0;
    this.ctx.stroke();

    this.ctx.fillStyle = '#CCC';
    this.ctx.font = "45px Orbitron";
    this.ctx.fillText(leftPaddle.score, (this.ctx.width/2)/2, 75);
    this.ctx.fillText(rightPaddle.score, (this.ctx.width/2)*1.5, 75);
}

GameCore.prototype.checkPaddles = function(puck, leftPaddle, rightPaddle)
{
   if ((puck.yPos > rightPaddle.yPos) && (puck.yPos < rightPaddle.yPos + rightPaddle.height))
    {
        if((puck.xPos > rightPaddle.xPos - rightPaddle.width) && (puck.xPos < rightPaddle.xPos + rightPaddle.width))
        {
            var intersectionNormalization = (((rightPaddle.yPos + (rightPaddle.height/2)) - puck.yPos) / (rightPaddle.height/2));
            puck.ballSpeedConst += 1;
            puck.xVel = (puck.ballSpeedConst * Math.cos(intersectionNormalization));
            puck.yVel = (puck.ballSpeedConst * Math.sin(intersectionNormalization));
        }
    }
    else if(puck.xPos > gameCore.ctx.width + puck.size*2)
    {
        puck.serve(GameDirection.LEFT);
        this.IncrementScore(leftPaddle);
    }

    if ((puck.yPos > leftPaddle.yPos) && (puck.yPos < leftPaddle.yPos + leftPaddle.height))
    {
        if((puck.xPos < leftPaddle.xPos + leftPaddle.width) && (puck.xPos > leftPaddle.xPos - leftPaddle.width))
        {
            var intersectionNormalization = (((leftPaddle.yPos + (leftPaddle.height/2)) - puck.yPos) / (leftPaddle.height/2)) *-1;
            puck.ballSpeedConst += 1;
            puck.xVel = (puck.ballSpeedConst *- Math.cos(intersectionNormalization));
            puck.yVel = (puck.ballSpeedConst *- Math.sin(intersectionNormalization));
        }
    }
    else if(puck.xPos < 0 - puck.size*2)
    {
        puck.serve(GameDirection.RIGHT);
        this.IncrementScore(rightPaddle);
    }
}

GameCore.prototype.IncrementScore = function(paddle)
{
    paddle.score++;
    if(paddle.score == 10)
        this.drawSplashScreen(paddle);
}

window.addEventListener("keydown", function(event)
{
    gameKeysHeld[event.key] = true;
});

window.addEventListener("keyup", function(event)
{
    gameKeysHeld[event.key] = false;
});

window.requestAnimFrame = (function() {
    return  window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||

    function(callback) {
        window.setTimeout(callback, 1000 / 60);
    };
})();

function Paddle(right)
{
    this.isRightPaddle = right;
    this.width = 10;
    this.height = 100;
    this.score = 0;
    this.xPos = ((right) ? gameCore.ctx.width - this.width*2 : this.xPos = 0 + this.width);
    this.yPos = gameCore.ctx.height/2 - this.height/2;
}

Paddle.prototype.move = function(movementDirection)
{
    if(movementDirection == GameDirection.UP && this.yPos > 0 + (this.height * 0.3))
    {
        this.yPos -= 10;
    }

    if(movementDirection == GameDirection.DOWN && this.yPos < gameCore.ctx.height - (this.height / 0.7))
    {
        this.yPos += 10;
    }
}

Paddle.prototype.draw = function()
{
    gameCore.ctx.beginPath();
    gameCore.ctx.rect(this.xPos, this.yPos, this.width, this.height);
    gameCore.ctx.fillStyle = "#FFF";
    gameCore.ctx.fill();
}

Paddle.prototype.update = function()
{
    this.draw();
}

function Puck()
{
    this.ballSpeedConst = 5;
    this.size = 10;
    this.xVel = 0;
    this.yVel = 0;
    this.xPos = 0;
    this.yPos = 0;
}

Puck.prototype.draw = function()
{
    gameCore.ctx.beginPath();
    gameCore.ctx.rect(this.xPos, this.yPos, this.size, this.size);
    gameCore.ctx.fillStyle = "#FFF";
    gameCore.ctx.fill();
}

Puck.prototype.checkBoundary = function()
{
   if (this.yPos < 0 || this.yPos > gameCore.ctx.height - this.size) {
        this.yVel = this.yVel * -1;
    }
}

Puck.prototype.serve = function(direction)
{
    this.ballSpeedConst = 5;
    this.xPos = gameCore.ctx.width/2 - this.size/2;

    if(direction == null)
        direction = (generateRandomBit()) ? GameDirection.LEFT : GameDirection.RIGHT;

    if(direction == GameDirection.RIGHT)
    {
        this.xVel = this.ballSpeedConst;
    }
    else if(direction == GameDirection.LEFT)
    {
        this.xVel = this.ballSpeedConst * -1;
    }

    if(generateRandomBit() == 0)
    {
        this.yPos = this.size;
    }
    else
    {
        this.yPos = (gameCore.canvas.height - this.size);
    }

    this.yVel = (generateRandomBit()) ? this.ballSpeedConst : this.ballSpeedConst;
}

Puck.prototype.update = function()
{
    this.xPos -= this.xVel;
    this.yPos -= this.yVel;
	this.checkBoundary();
    this.draw();
}

function generateRandomBit()
{
    return Math.round(Math.random() * (1 - 0));
}
