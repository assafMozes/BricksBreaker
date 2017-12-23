

(function bricksBreakerGame() {
var canvas = document.getElementById('xoCanvas')
// console.log( document.fullscreenEnabled)
// canvas.requestFullscreen()

var ctx = canvas.getContext('2d')
var rect = canvas.getBoundingClientRect();
var blob = document.getElementById('blob');
var ballImage = document.getElementById('ball');
var mush = document.getElementById('mush');
var ballR = canvas.width / 60;
var imageWidth = blob.width / 5;
var timeBenchmark = 1000 / 60;
var brickHeight = canvas.height * 8 / 100;
var paddleHeight = 24 * canvas.height / 25;
var margins = {
    bricksAndCanvasSides: canvas.width * 6 / 100,
    BricksSides: canvas.width * 0.3 / 100,
    CanvasTopToBricks: canvas.height * 8 / 100,
    BricksUpDown: canvas.height * 3 / 100,
}
var me;
//----------------------------------------------------------------------------------------------------------------------------------------------------------
function Game(levels) {
    this.levels = levels;
    this.brickWidth;
    this.score = 0;
    this.lives = 5;
    this.allBricks = [];
    this.paddle = new PaddleMaker();
    this.ball = new BallMaker()
    this.currentLevel = 0;
    this.isLevelOver = false;
    this.fontSize = 20;
    this.fontd = 0.8;
    this.prevTimeOut = 0;
    this.imageCounter = 0;
    this.endLevelCouner = 0;
    this.bonuses = [];
    this.bonusesCounter = 0;
}
//----------------------------------------------------------------------------------------------------------------------------------------------------------
Game.prototype.makeNextLevel = function () {
    var thisLevel = this.levels[this.currentLevel]
    this.brickWidth = ((canvas.width - margins.bricksAndCanvasSides * 2 - (thisLevel[2] - 1) * margins.BricksSides) / thisLevel[2]);
    this.allBricks = createNewLevelObjects(thisLevel[0], thisLevel[1], thisLevel[2], this.brickWidth)
    me = this;

}
//----------------------------------------------------------------------------------------------------------------------------------------------------------
Game.prototype.drawObjects = function (numOfLines, numOfBricksInALine) {
    me.drawText()
    me.drawBricks(numOfLines, numOfBricksInALine)
    me.drawPaddle()
    me.drawBall()
    me.drawbonuses()
}
//----------------------------------------------------------------------------------------------------------------------------------------------------------
Game.prototype.drawbonuses = function () {
    var bonus;
    for (i = 0; i < this.bonuses.length; i++) {
        bonus = this.bonuses[i];
        if (bonus != undefined && bonus.exist == true)
            ctx.drawImage(bonus.img, 0, 0, bonus.img.width / 2, bonus.img.height, bonus.x, bonus.y, bonus.width / 2, bonus.height);
    }
}
//----------------------------------------------------------------------------------------------------------------------------------------------------------
Game.prototype.drawBricks = function (numOfLines, numOfBricksInALine) {
    for (var j = 0; j < numOfLines; j++) {
        for (var i = 0; i < numOfBricksInALine; i++) {
            this.allBricks[j][i].drawOneBrick()
        }
    }
}
//----------------------------------------------------------------------------------------------------------------------------------------------------------
Game.prototype.drawText = function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.font = "30px Arial";
    ctx.fillText("score: " + this.score, canvas.width / 20, canvas.height / 20);
    var txtMeasure = ctx.measureText("live: " + this.lives);
    ctx.fillText("live: " + this.lives, canvas.width - canvas.width / 20 - txtMeasure.width, canvas.height / 20);
}
//----------------------------------------------------------------------------------------------------------------------------------------------------------
Game.prototype.drawPaddle = function () {
    var paddleLeftArcCenX = this.paddle.x;
    var paddleRightArcCenX = this.paddle.x + this.paddle.width;
    var paddleArcsCenY = this.paddle.y + this.ball.radios;
    ctx.beginPath()
    ctx.fillStyle = '#F00'
    ctx.arc(paddleLeftArcCenX, paddleArcsCenY, this.ball.radios, 0, 2 * Math.PI, true)
    ctx.arc(paddleRightArcCenX, paddleArcsCenY, this.ball.radios, 0, 2 * Math.PI, true)
    ctx.fill()
    ctx.beginPath()
    ctx.fillStyle = '#666'
    ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.ball.radios * 2)
    ctx.fill()
}
//----------------------------------------------------------------------------------------------------------------------------------------------------------
Game.prototype.drawBall = function () {
    ctx.beginPath()
    ctx.drawImage(ballImage, 0, 0, ballImage.width, ballImage.height,
        this.ball.x - this.ball.radios, this.ball.y - this.ball.radios,
        2 * this.ball.radios, 2 * this.ball.radios);
}
//----------------------------------------------------------------------------------------------------------------------------------------------------------
Game.prototype.drawGameOver = function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.font = this.fontSize + "px Arial";
    var txtMeasure = ctx.measureText("game over...");
    ctx.fillText("game over...", (canvas.width - txtMeasure.width) / 2, (canvas.height) / 2);
    this.isLevelOver = true;
    this.fontSize += this.fontd;
    if (this.fontSize > 120 || this.fontSize < 20)
        this.fontd *= -1;
}
//----------------------------------------------------------------------------------------------------------------------------------------------------------
Game.prototype.drawYouWin = function () {
    ctx.fillStyle = "rgb(" + parseInt(Math.random() * 256) + ',' + parseInt(Math.random() * 256) + ',' +
        parseInt(Math.random() * 256) + ')'
    ctx.font = parseInt(Math.random() * 40) + "px Arial";
    ctx.fillText("you win!", parseInt(Math.random() * canvas.width), parseInt(Math.random() * canvas.height));
}
//----------------------------------------------------------------------------------------------------------------------------------------------------------
Game.prototype.drawNextLevel = function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.font = "60px Arial";
    var txtMeasure = ctx.measureText("level " + (me.currentLevel) + " is over");
    ctx.fillText("level " + (this.currentLevel) + " is over", me.endLevelCouner - txtMeasure.width, (canvas.height - 60) / 2);
}

//----------------------------------------------------------------------------------------------------------------------------------------------------------
Game.prototype.refreshGame = function (timeOut) {
    me.imageCounter = (me.imageCounter + 20) % blob.width;
    me.endLevelCouner = (me.endLevelCouner + 5) % 1000
    // var correction
    // if (timeOut != undefined)
    // correction = (timeOut - me.prevTimeOut) / timeBenchmark;
    // else
    // correction = 1;    
    // console.log(correction);
    // me.prevTimeOut = timeOut;
    if (me.lives == 0) {
        me.drawGameOver()
    }
    else if (me.isLevelOver == false) {
        me.drawObjects(me.levels[me.currentLevel][0].length, me.levels[me.currentLevel][2])
        if (me.ball.status == 'movin') {
            me.ball.x += me.ball.dx;
            me.ball.y += me.ball.dy;
            me.ball.Fx += me.ball.dx;
            me.ball.Fy += me.ball.dy;
            me.ball.hitWalls()
            me.ballGoesDown()
            me.bricksStatus()
            for (var i = 0; i < me.bonuses.length; i++)
                if (me.bonuses[i] != undefined && me.bonuses[i].exist == true)
                    if (me.bonuses[i].y + 40 >= me.paddle.y && me.bonuses[i].x >= me.paddle.x &&
                        me.bonuses[i].x <= me.paddle.x + me.paddle.width) {
                        me.bonuses[i] = undefined;
                        me.paddle.width += 30
                    }
                    else
                        me.bonuses[i].move()
        }
    }
    else if (me.currentLevel == me.levels.length)
        me.drawYouWin()
    else
        me.drawNextLevel()
    requestAnimationFrame(me.refreshGame)
}
//----------------------------------------------------------------------------------------------------------------------------------------------------------
Game.prototype.bonus = function (x, y) {
    this.bonuses[this.bonusesCounter] = new createBonus(mush, x, y);
    this.bonusesCounter++;
}
//----------------------------------------------------------------------------------------------------------------------------------------------------------
Game.prototype.bricksStatus = function () {
    var ballFx = me.ball.x + me.ball.dx
    var ballFy = me.ball.y + me.ball.dy
    var brick;
    me.isLevelOver = true;
    for (var j = 0; j < me.levels[me.currentLevel][0].length; j++) {
        for (var i = 0; i < me.levels[me.currentLevel][2]; i++) {
            brick = me.allBricks[j][i]
            if (Math.abs(ballFx - brick.x - me.brickWidth / 2) < me.ball.radios + me.brickWidth / 2 &&
                ballFy > brick.y && ballFy < brick.y + brickHeight && brick.strenth > 0) {
                brick.strenth -= 1;
                if (brick.strenth == 0 && brick.sprite == true)
                    me.bonus(brick.x + me.brickWidth / 2, brick.y + brickHeight)
                me.ball.dx *= -1;
                me.score += brick.startStrenth - brick.strenth
            }
            if (Math.abs(ballFy - brick.y - brickHeight / 2) < me.ball.radios + brickHeight / 2 &&
                ballFx > brick.x && ballFx < brick.x + me.brickWidth && brick.strenth > 0) {
                brick.strenth -= 1;
                if (brick.strenth == 0 && brick.sprite == true)
                    me.bonus(brick.x + me.brickWidth / 2, brick.y + brickHeight)
                me.ball.dy *= -1;
                me.score += brick.startStrenth - brick.strenth
            }
            if (brick.strenth > 0)
                me.isLevelOver = false;
        }
    }
    if (me.isLevelOver == true) {
        me.currentLevel++
        if (me.currentLevel < me.levels.length) {
            me.paddle = new PaddleMaker()
            me.ball = new BallMaker()
            // levelComplete()
            me.makeNextLevel()
        }
    }
}
//----------------------------------------------------------------------------------------------------------------------------------------------------------
Game.prototype.ballGoesDown = function () {
    var ballFx = this.ball.x + this.ball.dx
    var ballFy = this.ball.y + this.ball.dy
    // var dist = Math.pow(Math.pow(this.paddle.LeftArcCenX - ballFx, 2) + Math.pow(this.paddle.ArcsCenY - ballFy, 2), 0.5)
    // console.log("dist:" +dist)


    if (paddleHeight - ballFy < this.ball.radios && ballFx > this.paddle.x && ballFx < this.paddle.x + this.paddle.width) {
        var engle;
        this.ball.dy = (this.ball.dy * (-1))
        if (this.ball.dx > 0) {
            engle = (ballFx - this.paddle.x) / (this.paddle.width / 2)
        }
        else {
            engle = (this.paddle.x + this.paddle.width - ballFx) / (this.paddle.width / 2)
        }
        if (engle > 4)
            engle = 1.7;
        else if (engle < 1 / 4)
            engle = 1 / 1.7;
        else if (engle > 2)
            engle = 1.3
        else if (engle < 1 / 2)
            engle = 1 / 1.3
        else
            engle = 1
        if (this.ball.dx * engle > canvas.width / 300 && this.ball.dx * engle < 3 * canvas.width / 100) {
            this.ball.dx *= engle
            this.ball.dy /= engle
        }
    }
    // else if (dist<2*this.ball.radios)
    // this.ball.dy *= -3;
    else if (ballFy + this.ball.radios > this.paddle.y) {
        this.lives--
        this.paddle = new PaddleMaker()
        this.ball = new BallMaker()
        this.bonuses = [];
        this.bonusesCounter = 0;

    }
}
//----------------------------------------------------------------------------------------------------------------------------------------------------------
Game.prototype.allLiseners = function () {

    canvas.addEventListener('mousemove', function (event) {
  
        if (event.clientX - rect.left > me.paddle.width / 2 && event.clientX - rect.left < canvas.width - me.paddle.width / 2) {
            me.paddle.x = (event.clientX - rect.left - me.paddle.width / 2);
            if (me.ball.status === 'static')
                me.ball.x = me.paddle.x + me.paddle.width / 2
        }
    })

    window.addEventListener('keydown', function (event) {
        if (event.key != "ArrowRight" && event.key != "ArrowLeft")
            return
        if (me.paddle.x < canvas.width - me.paddle.width && event.key == "ArrowRight") {
            me.paddle.x += 30;
            if (me.ball.status == 'static')
                me.ball.x += 30;
        }
        else if (me.paddle.x > 0 && event.key == "ArrowLeft") {
            me.paddle.x -= 30;
            if (me.ball.status == 'static')
                me.ball.x -= 30;
        }
    })

    window.addEventListener('click', function (event) {
              if (canvas.requestFullscreen) {
	canvas.requestFullscreen();
} else if (canvas.webkitRequestFullscreen) {
	canvas.webkitRequestFullscreen();
} else if (canvas.mozRequestFullScreen) {
	canvas.mozRequestFullScreen();
} else if (canvas.msRequestFullscreen) {
	canvas.msRequestFullscreen();
}
        if (me.lives == 0 || me.currentLevel == me.levels.length) {
            newGame = new Game(levels);
            newGame.allLiseners();
            newGame.makeNextLevel();
        }
        else if (me.isLevelOver == false)
            me.ball.status = 'movin';
        else me.isLevelOver = false;
    })

    window.addEventListener('keydown', function (event) {
        if (event.key == " ")
            me.ball.status = 'movin';
    })
}
//----------------------------------------------------------------------------------------------------------------------------------------------------------
function PaddleMaker() {
    this.height = canvas.height / 50;
    this.width = 2 * canvas.width / 8;
    this.x = canvas.width / 2 - this.width / 2;
    this.y = paddleHeight;
    // this.LeftArcCenX = canvas.width / 2 - this.width / 2;
    // this.RightArcCenX = canvas.width / 2 + this.width / 2;
    // this.ArcsCenY = 24 * canvas.height / 25 + canvas.width / 72;
}
//----------------------------------------------------------------------------------------------------------------------------------------------------------
function BallMaker() {
    this.x = canvas.width / 2;
    this.y = canvas.height * 24 / 25 - canvas.width / 60;
    this.status = 'static';
    this.dx = canvas.width / 100;
    this.dy = -canvas.height / 100;
    this.Fx = this.x + this.dx
    this.Fy = this.y + this.dy
    this.radios = canvas.width / 60;

}
//----------------------------------------------------------------------------------------------------------------------------------------------------------
BallMaker.prototype.hitWalls = function () {
    var ballFx = this.x + this.dx
    var ballFy = this.y + this.dy
    if (ballFx + this.radios > canvas.width || ballFx - this.radios < 0)
        this.dx *= -1;
    if (ballFy - this.radios < 0)
        this.dy *= -1;
}
//----------------------------------------------------------------------------------------------------------------------------------------------------------
function createNewLevelObjects(allColors, theShape, numOfBricks, bricksWidth) {
    var allBricks = [];
    var sprite;
    var strenth
    for (var j = 0; j < allColors.length; j++) {
        allBricks[j] = []
        for (var i = 0; i < numOfBricks; i++) {
            strenth = allColors.length - j;
            sprite = false;
            if ((i + j) % 3 == 0)
                sprite = true;
            if (theShape == 'xxx' && (i !== j && i + j !== allColors.length - 1))
                strenth = 0;
            if (theShape == 'oct' && Math.abs(i - j) !== (allColors.length - 1) / 2 &&
                i + j !== (allColors.length - 1) / 2 && (i + j !== 3 * (allColors.length - 1) / 2))
                strenth = 0;
            if (theShape == 'rect' && i !== 0 && j !== 0 && i !== allColors.length - 1 && j !== allColors.length - 1)
                strenth = 0;
            if (theShape == 'mmm' && i !== 0 && i !== allColors.length - 1 &&
                ((i !== j && i + j !== allColors.length - 1) || j > (allColors.length - 1) / 2))
                strenth = 0;
            allBricks[j][i] = new createBrick(allColors[j], j, i, bricksWidth, strenth, sprite)
        }
    }
    return allBricks
}
//----------------------------------------------------------------------------------------------------------------------------------------------------------
function createBrick(color, lineNum, posInLine, bricksWidth, strenth, sprite) {
    this.startStrenth = strenth;
    this.color = color;
    this.width = bricksWidth;
    this.height = brickHeight;
    this.x = margins.bricksAndCanvasSides + (margins.BricksSides + bricksWidth) * posInLine;
    this.y = margins.CanvasTopToBricks + (margins.BricksUpDown + brickHeight) * lineNum;
    this.strenth = strenth;
    this.sprite = sprite;
}
//----------------------------------------------------------------------------------------------------------------------------------------------------------
createBrick.prototype.drawOneBrick = function () {
    var curSpriteImg;
    var brickOpacity;
    var leyers = 7;
    ctx.beginPath()
    brickOpacity = this.strenth / this.startStrenth;
    ctx.fillStyle = this.color;
    for (var k = 0; k < leyers; k++) {
        ctx.globalAlpha = ((k + 1) / leyers) * brickOpacity;
        ctx.fillRect(this.x + (this.width * k / leyers), this.y + (this.height * k / leyers),
            (this.width - (this.width * k * 2 / leyers)) * (this.strenth / this.strenth),
            this.height - (this.height * k * 2 / leyers))
        ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (this.sprite == true && this.strenth > 0) {
        curSpriteImg = parseInt(me.imageCounter / imageWidth) * imageWidth;
        ctx.drawImage(blob, curSpriteImg, 0, imageWidth, blob.height, this.x, this.y, this.width, this.height);
    }
}
//----------------------------------------------------------------------------------------------------------------------------------------------------------
function createBonus(img, x, y) {
    this.width = canvas.width / 10;
    this.height = canvas.height / 10;
    this.x = x;
    this.y = y;
    this.img = img;
    this.dy = canvas.height / 300;
    this.exist = true;
}
createBonus.prototype.move = function () {
    this.y += this.dy;
}
//----------------------------------------------------------------------------------------------------------------------------------------------------------
var newGame = new Game(levels);
newGame.allLiseners();
newGame.makeNextLevel();
me.refreshGame()
})()