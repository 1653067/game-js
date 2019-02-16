const sizeBrick = 20;
const widthGameArea = 280;
let brick, nextBrick;
let score = 0;
let gameOver = false;

const getHighScore = function() {
    if(localStorage.getItem('highScore') === null) {
        return 0;
    } else {
        return localStorage.getItem('highScore');
    }
}

const setHighScore = function(score) {
    localStorage.setItem('highScore', score);
}

let highScore = getHighScore();

const gameArea = {
    canvas: document.createElement('canvas'),
    start: function () {
        this.canvas.width = 480; // (width game 280)
        this.canvas.height = 480;

        this.context = this.canvas.getContext('2d');

        //add to body
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);

        //paint bg
        this.context.fillStyle = '#202830';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        //paint separeate line
        this.context.beginPath();
        this.context.moveTo(280, 0);
        this.context.lineTo(280, this.canvas.height);
        this.context.strokeStyle = '#fff';
        this.context.stroke();
        this.context.closePath();

        //paint next
        this.context.beginPath();
        this.context.rect(290, 10, this.canvas.width - 300, 200);
        this.context.strokeStyle = '#fff';
        this.context.stroke();
        this.context.closePath();

        //paint score
        this.context.beginPath();
        this.context.rect(290, 220, this.canvas.width - 300, 200);
        this.context.strokeStyle = '#fff';
        this.context.stroke();
        this.context.closePath();

        this.context.font = "30px Arial";
        this.context.textAlign = 'center';
        this.context.fillStyle = '#fff';
        this.context.fillText(score.toString(), 290 + (this.canvas.width - 300) / 2, 230);

        //update
        this.interval = setInterval(updateGameArea, 20);
    },
    clear: function () {
        this.context.fillStyle = '#202830';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        //paint separeate line
        this.context.beginPath();
        this.context.moveTo(282, 0);
        this.context.lineTo(282, this.canvas.height);
        this.context.strokeStyle = '#fff';
        this.context.stroke();
        this.context.closePath();

        //paint next
        this.context.beginPath();
        this.context.rect(290, 10, this.canvas.width - 300, 200);
        this.context.strokeStyle = '#fff';
        this.context.stroke();
        this.context.closePath();

        //paint score
        this.context.beginPath();
        this.context.rect(290, 220, this.canvas.width - 300, 200);
        this.context.strokeStyle = '#fff';
        this.context.stroke();
        this.context.closePath();

        this.context.font = "28px Arial";
        this.context.textAlign = 'center';
        this.context.fillStyle = '#fff';
        this.context.fillText('Score', 290 + (this.canvas.width - 300) / 2, 250);
        this.context.fillText(score.toString(), 290 + (this.canvas.width - 300) / 2, 300);

        this.context.fillText('High Score', 290 + (this.canvas.width - 300) / 2, 350);
        this.context.fillText(highScore.toString(), 290 + (this.canvas.width - 300) / 2, 400);
    },
    restart: function() {
        if(typeof(this.interval) !== 'undefined') {
            clearInterval(this.interval);
        }
    }
}

function Cell(color) {
    this.color = color;
    this.status = 0;
}

const board = {
    rows: 24,
    cols: 14,
    arr: [],
    update: function () {
        const ctx = gameArea.context;
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (this.arr[i * this.cols + j].status === 1) {

                    ctx.beginPath();
                    ctx.fillStyle = this.arr[i * this.cols + j].color;
                    ctx.rect(j * sizeBrick, i * sizeBrick, sizeBrick, sizeBrick);
                    ctx.fill();
                    ctx.strokeStyle = '#202830';
                    ctx.stroke();
                    ctx.closePath();
                }
            }
        }
    },
    clear: function () {
        let r = 0;
        for (let i = 0; i < this.rows; i++) {
            let count = 0;
            for (let j = 0; j < this.cols; j++) {
                if (this.arr[i * this.cols + j].status === 1) {
                    count++;
                }
            }
            if (count == this.cols) {
                for (let n = i; n >= 1; n--) {
                    for (let m = 0; m < this.cols; m++) {
                        this.arr[n * this.cols + m].status = this.arr[(n - 1) * this.cols + m].status;
                        this.arr[n * this.cols + m].color = this.arr[(n - 1) * this.cols + m].color;
                    }
                }
                r++;
            }
        }
        score += (r * r) * 10;
    }
}

function updateGameArea() {
    if(gameOver) {
        const ctx = gameArea.context;

        ctx.fillStyle = 'rgba(51, 51, 51, 0.7)';
        ctx.fillRect(0, 0, 280, 480);

        ctx.font = "28px Arial";
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.fillText('Game Over', 140, 220);
        ctx.font = "20px Arial";
        ctx.textAlign = 'center';

        ctx.fillText('Press Enter to play agian', 140, 250);
        gameArea.restart();
    } else {
        gameArea.clear();
        board.clear();
        board.update();

        //x, y of nextBrick;
        const xNext = 290 + 180 / 2 - (sizeBrick * nextBrick.cols) / 2;
        const yNext = 10 + 190 / 2 - (sizeBrick * nextBrick.rows) / 2;

        nextBrick.draw(xNext, yNext);
        const isUpdated = brick.update();
        if (!isUpdated) {
            const x = Math.round(brick.x / sizeBrick);
            const y = Math.round(brick.y / sizeBrick);

            for (let i = 0; i < brick.rows; i++) {
                for (let j = 0; j < brick.cols; j++) {
                    if (brick.arr[i * brick.cols + j] === 1) {
                        const pos = (y + i) * board.cols + (x + j);
                        board.arr[pos].color = brick.color;
                        board.arr[pos].status = 1;
                    }
                }
            }
            if(nextBrick.check(board, 0, 0)) {
                brick = nextBrick;
                nextBrick = new Brick(Math.floor((Math.random() * 5) + 1));
            } else {
                gameOver = true;
            }
        }

        if(score > highScore) {
            setHighScore(score);
            highScore = score;
        }
    }
}

function startGame() {
    gameArea.restart();
    gameArea.start();
    board.arr = [];

    const size = board.cols * board.rows;
    for (let i = 0; i < size; i++) {
        board.arr.push(new Cell('#202830'));
    }
    brick = new Brick(Math.floor((Math.random() * 5) + 1));
    nextBrick = new Brick(Math.floor((Math.random() * 5) + 1));
}

class Brick {
    constructor(type) {
        this.type = type;
        this.x = 0;
        this.y = 0;
        this.speed = 2;
        this.count = 0;
        this.block = false;
        switch (this.type) {
            case 1: {
                this.rows = 2;
                this.cols = 2;
                this.color = '#f00';
                this.arr = [1, 1, 1, 1];
                break;
            }
            case 2: {
                this.rows = 4;
                this.cols = 1;
                this.color = '#ff0';
                this.arr = [1, 1, 1, 1];
                break;
            }
            case 3: {
                this.rows = 3;
                this.cols = 2;
                this.color = '#fff';
                this.arr = [1, 0, 1, 0, 1, 1];
                break;
            }
            case 4: {
                this.rows = 3;
                this.cols = 2;
                this.color = '#0ff';
                this.arr = [1, 0, 1, 1, 0, 1];
                break;
            }
            case 5: {
                this.rows = 2;
                this.cols = 3;
                this.color = '#f0f';
                this.arr = [0, 1, 0, 1, 1, 1];
            }
        }
    }

    check(board, speedX, speedY) {
        const x = Math.round((this.x + speedX) / sizeBrick);
        const y = Math.round((this.y + speedY) / sizeBrick);
        for (let i = 0; i < brick.rows; i++) {
            for (let j = 0; j < brick.cols; j++) {
                if (this.arr[i * brick.cols + j] === 1) {
                    const pos = (y + i) * board.cols + (x + j);
                    if (board.arr[pos].status === 1) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    update() {

        // if (this.y + this.speed < gameArea.canvas.height - this.rows * sizeBrick && this.check(board, 0, this.speed)) {
        //     if (this.count <= 0)
        //         this.y += this.speed;
        // }
        // else {
        //     this.speed = 2;
        //     this.count = 0;
        //     return false;
        // }

        if(controller.up.active) {
            controller.up.active = false;
            this.rotate();
        }

        if(controller.down.active) {
            this.speed = 10;
            this.block = true;
            controller.down.active = false;
        }

        if(!this.block && controller.left.active) {
            if(this.x - sizeBrick >= 0 && this.check(board, -sizeBrick, 0)) {
                this.x -= this.speed;
                this.arrow = -1;
            } else {
                controller.left.active = false;
            }
        }

        if(!this.block && controller.right.active) {
            if(this.x + sizeBrick * (this.cols + 1) <= widthGameArea && this.check(board, sizeBrick, 0)) {
                this.x += this.speed;
                this.arrow = 1;
            }
            else {
                controller.right.active = false;
            }
        }

        if(!controller.left.active && !controller.right.active) {
            if(this.x % sizeBrick != 0) {
                this.x += this.arrow;
            }
        }

        if(this.block || (!controller.left.active && !controller.right.active)) {
            if (this.y + this.speed < gameArea.canvas.height - this.rows * sizeBrick && this.check(board, 0, this.speed)) {
                    this.y += this.speed;
            } else {
                this.speed = 2;
                this.count = 0;
                this.block = false;
                return false;
            }
        }

        const ctx = gameArea.context;
        ctx.fillStyle = 'rgba(255,255,255, 0.2)';
        ctx.fillRect(this.x, 0, sizeBrick * this.cols, gameArea.canvas.height);
        ctx.fillStyle = this.color;
        this.draw(this.x, this.y);

        return true;
    }

    draw(x, y) {
        const ctx = gameArea.context;
        ctx.fillStyle = this.color;
        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.rows; j++) {
                if (this.arr[j * this.cols + i] === 1) {
                    ctx.beginPath();
                    ctx.rect(x + i * sizeBrick, y + j * sizeBrick, sizeBrick, sizeBrick);
                    ctx.fill();
                    ctx.strokeStyle = '#202830';
                    ctx.stroke();
                    ctx.closePath();
                }
            }
        }
    }

    rotate() {
        const oldArr = this.arr;
        this.arr = [];
        for (let i = 0; i < this.cols; i++) {
            for (let j = this.rows - 1; j >= 0; j--) {
                this.arr.push(oldArr[j * this.cols + i]);
            }
        }

        let tmp = this.cols;
        this.cols = this.rows;
        this.rows = tmp;

        if(this.x + this.cols * sizeBrick > widthGameArea ||
            !this.check(board, 0, 0)) {
            this.arr = oldArr;
            let tmp = this.cols;
            this.cols = this.rows;
            this.rows = tmp;
        }
    }

    left() {
        if (this.count === 0 &&
            this.x - sizeBrick >= 0 &&
            this.check(board, -sizeBrick, 0)) {
            this.count = sizeBrick;
            this.arrow = -1;
        }
    }

    right() {
        if (this.count === 0 &&
            this.x + (this.cols + 1) * sizeBrick <= widthGameArea && 
            this.check(board, sizeBrick, 0)) 
        {
            this.count = sizeBrick;
            this.arrow = 1;
        }
    }

    down() {
        this.speed = 10;
        this.count = -1;
    }
}

const controller = {
    left: {active: false, state: false},
    up: {active: false, state: false},
    right: {active: false, state: false},
    down: {active: false, state: false},

    keyUpDown: function(event) {
        const key_state = (event.type == 'keydown') ? true : false;
        
        switch (event.keyCode) {
            case 37:
                if(controller.left.state != key_state)
                    controller.left.active = key_state;
                controller.left.state = key_state;
            break;

            case 38:
                if(controller.up.state != key_state)
                    controller.up.active = key_state;
                controller.up.state = key_state;
            break;

            case 39:
                if(controller.right.state != key_state)
                    controller.right.active = key_state;
                controller.right.state = key_state;
            break;

            case 40:
                if(controller.down.state != key_state)
                    controller.down.active = key_state;
                controller.down.state = key_state;
            break;
        }
    }
};

window.addEventListener('keydown', controller.keyUpDown);
window.addEventListener('keyup', controller.keyUpDown);

startGame();