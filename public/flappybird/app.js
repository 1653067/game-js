const ctx = document.querySelector('canvas').getContext('2d');
ctx.canvas.width = 480;
ctx.canvas.height = 270;

const spaceCol = 80;
const disCol = 70;
const widthCol = 30;
let score = 0;

const controller = {
    space: { active: false, state: false },
    keyUpDown: function (event) {
        const key_state = (event.type == 'keydown') ? true : false;
        switch (event.keyCode) {
            case 32:
                if (key_state == true) {
                    bird.gravity -= bird.jumping ;
                }
                break;
        }
    }
};

function Column(pos, height) {
    this.pos = pos;
    this.height = height;
    this.score = false;
}

Column.prototype = {
    update() {

        this.pos -= 1.5;
        if (this.pos + widthCol < 0) {
            return false;
        }

        ctx.fillStyle = '#f00';
        ctx.fillRect(this.pos, 0, widthCol, this.height);
        ctx.fillRect(this.pos, this.height + spaceCol, widthCol, ctx.canvas.height - (this.height + spaceCol + 16));

        return true;
    },

    get rects() {
        const rects = [
            new Rect(this.pos, 0, this.pos + widthCol, this.height),
            new Rect(this.pos, this.height + spaceCol, this.pos + widthCol, ctx.canvas.height - 16),
            new Rect(this.pos, this.height, this.pos + this.widthCol, this.height + spaceCol)
        ];

        return rects;
    }
}

function Rect(left, top, right, bottom) {
    this.top = top;
    this.right = right;
    this.bottom = bottom;
    this.left = left;
}

Rect.prototype = {
    collision(rect) {
        if (this.top > rect.bottom ||
            this.right < rect.left ||
            this.bottom < rect.top ||
            this.left > rect.right) {
            return false;
        }
        return true;
    }
}

let cols = [];
const init = function (n) {
    for (let i = 0; i < n; i++) {
        cols.push(new Column(ctx.canvas.width + i * (disCol + widthCol), Math.floor((Math.random() * 130)) + 30));
    }
}

const bird = {
    width: 12,
    height: 16,
    x: ctx.canvas.width / 2,
    y: ctx.canvas.height / 2,
    gravity: 1,
    jumping: 500,
    fallingConstant: 1200,

    update: function () {
        ctx.beginPath();
        ctx.arc(bird.x, bird.y, bird.width, 0, 2 * Math.PI);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.closePath();
    },

    collision: function(col) {
        const rect = new Rect(this.x - this.width, this.y - this.width, this.x + this.width, this.y + this.width);
        const rects = col.rects;

        return (rect.collision(rects[0]) || rect.collision(rects[1]));
    },

    score: function(col) {
        const rect = new Rect(this.x - this.width, this.y - this.width, this.x + this.width, this.y + this.width);
        return rect.collision(col.rects[2]);
    }
};

let pt = 0;

const loop = function (time_stamp) {

    ctx.fillStyle = '#202830';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.fillStyle = '#373737';
    ctx.fillRect(0, ctx.canvas.height - 16, ctx.canvas.width, ctx.canvas.height);

    let isCancel = false;

    cols.forEach(col => {

        if(bird.collision(col)) {
            // console.log('collision'); 
            score = 0;
        }

        if(bird.score(col) && !col.score) {
            col.score = true;
            score++;
        }

        if (!col.update()) {
            isCancel = true;
        }

        // ctx.fillStyle = '#f0f';
        // ctx.fillRect(col.pos, col.height + spaceCol, widthCol, ctx.canvas.height - (col.height + spaceCol + 16))
    });

    if (isCancel) {
        cols.push(new Column(cols[cols.length - 1].pos + (widthCol + disCol), Math.floor((Math.random() * 130) ) + 30));
        cols.shift();
    }

    dt = (time_stamp - pt) / 1000;
    pt = time_stamp;

    bird.gravity += bird.fallingConstant * dt;
    bird.y += bird.gravity * dt;

    bird.gravity *= 0.9; //friction

    if (bird.y > ctx.canvas.height - 16 - bird.width) {
        score = 0;
        bird.y = ctx.canvas.height - 16 - bird.width;
    }


    bird.update();

    ctx.fillStyle = '#fff';
    ctx.font = '50px Arial'
    ctx.fillText(score.toString(), ctx.canvas.width/2, 60);

    window.requestAnimationFrame(loop);
}

window.addEventListener('keydown', controller.keyUpDown);
window.addEventListener('keyup', controller.keyUpDown);

init(7);
window.requestAnimationFrame(loop);