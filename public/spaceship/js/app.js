// const ctx = document.querySelector('canvas').getContext('2d');

const ctx = document.createElement('canvas').getContext('2d');
const display = document.querySelector('canvas').getContext('2d');

ctx.canvas.width = 480;
ctx.canvas.height = 270;

display.canvas.width = 480 * 1.5;
display.canvas.height = 270 * 1.5;
display.imageSmoothingEnabled = false;

const STATE = {
    ALIVE: 0,
    EXPLOSIVE: 1,
    CANCEL: 2
}

const toRad = function(deg) {
    return deg * Math.PI / 180;
};



const ship = {
    x: 0,
    y: 0,
    width: 24,
    height: 24,
    delay: 7,
    speed: 150,
    hitpoint: 100,
    bullet: 1,
    animation: new Animation(),
    image: new Image(),
    draw: function() {
        //draw hitpoint

        let widthHP = 100;
        let heightHP = 10;

        ctx.fillStyle = '#f00';
        ctx.fillRect(10, 10, this.hitpoint * widthHP / 100, heightHP);

        ctx.beginPath();
        ctx.rect(10, 10, widthHP, heightHP);
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#f00';
        ctx.stroke();
        ctx.closePath();

        //draw ship
    
        ship.animation.update();

        ctx.drawImage(ship.image, ship.x, ship.y, ship.width, ship.height);
        ctx.drawImage(
            fireImage,
            ship.animation.frame.x, ship.animation.frame.y, ship.animation.frame.width, ship.animation.frame.height,
            ship.x + ship.width / 2 - ship.animation.frame.width / 2 - 0.5, ship.y + ship.height - 2, ship.animation.frame.width, ship.animation.frame.height
        );
    }
}

const controller = {
    left: false,
    up: false,
    right: false,
    down: false,
    shot: false,

    keyUpDown: function(event) {
        const key_state = event.type == 'keydown';
        switch(event.keyCode) {
            case 32:
                controller.shot = key_state;
            break;
            case 37:
                controller.left = key_state;
            break;
            case 38:
                controller.up = key_state;
            break;
            case 39:
                controller.right = key_state;
            break;
            case 40:
                controller.down = key_state;
            break;

        }
    }
}

class Rect {
    constructor(left, top, right, bottom) {
        this.left = left;
        this.top = top;
        this.right = right;
        this.bottom = bottom;
    }

    collision(rect) {
        if (this.left > rect.right ||
            this.top > rect.bottom ||
            this.right < rect.left ||
            this.bottom < rect.top) {
            return false;
        }

        return true;
    }
}

let pt = 0;
let count = ship.delay;

const loop = function(time_stamp) {
    const dt = (time_stamp - pt) /1000;
    pt = time_stamp;

    //draw background
    ctx.drawImage(background, 0, 0, ctx.canvas.width, ctx.canvas.height);

    if(controller.right && ship.x <= ctx.canvas.width - ship.width) {
        ship.x += ship.speed * dt;
    }

    if(controller.left && ship.x >= 0) {
        ship.x -= ship.speed * dt;
    }

    if(controller.up && ship.y >= 0) {
        ship.y -= ship.speed * dt;
        ship.animation.change(fire_sprite_sheet[1], 15);
    } else {
        ship.animation.change(fire_sprite_sheet[0], 15);
    }

    if(controller.down && ship.y <= ctx.canvas.height - ship.height) {
        ship.y += ship.speed * dt;
    }

    count--;
    if (count == 0) {
        count = ship.delay;
        let deg = 180 + Math.floor(ship.bullet / 2) * 22.5;
        let frame = Math.floor(frame_bullet.length / 2) - Math.floor(ship.bullet / 2);
        for (let i = 0; i < ship.bullet; i++) {
            bullets.push(new Bullet(ship.x + ship.width / 2, ship.y, deg, frame, ship));
            deg -= 22.5;
            frame++;
        }
    }
    
    ship.draw();

    meteors.forEach(m => {
        m.update(dt);
        m.draw();
    });

    enemys.forEach(enemy => {
        enemy.update(dt);
        enemy.draw();
    });

    items.forEach(item => {
        item.update(dt);
        item.draw();
    });

    bullets.forEach(i => i.update(dt));

    bullets = bullets.filter(b => (b.x >= -ctx.canvas.width && b.y >= -ctx.canvas.height && b.state != STATE.CANCEL));
    items = items.filter(item => (item.y <= ctx.canvas.height - item.height && item.state != STATE.CANCEL));

    display.drawImage(ctx.canvas , 0, 0, ctx.canvas.width, ctx.canvas.height, 0, 0, display.canvas.width, display.canvas.height);
    window.requestAnimationFrame(loop);
}

const explosiveImage = new Image();
explosiveImage.src = '/spaceship/image/explosive.png';

class Frame {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}

const fireImage = new Image();
fireImage.src = '/spaceship/image/b.png';
const fire_sprite_sheet = [
    [
        new Frame(116, 57, 13, 8),
        new Frame(116, 67, 13, 10)
    ],
    [
        new Frame(137, 53, 11, 16),
        new Frame(137, 72, 11, 18)
    ]
];

const explosiveOBImage = new Image();
explosiveOBImage.src = '/spaceship/image/explosive-ob.png';

let explosive_ob_frame_set = [
    new Frame(0, 0, 30, 30),
    new Frame(30, 0, 30, 30),
    new Frame(60, 0, 30, 30),
    new Frame(90, 0, 30, 30),
    new Frame(120, 0, 30, 30)
];

let bullets = [];
let items = [];

ship.image.src = '/spaceship/image/space_ship.png';
ship.x = ctx.canvas.width / 2 - ship.width / 2;
ship.y = ctx.canvas.height - ship.height;

let meteors = [];
for(let i = 0; i < 5; i++) {
    const m = new Obstacles(Math.floor(Math.random() * ctx.canvas.width), -24, 24, 24, 100, Math.floor(Math.random() * 30) + 50, explosive_ob_frame_set);
    m.image.src = '/spaceship/image/meteorite.png'
    meteors.push(m);
}

let enemys = [];
for(let i = 0; i < 3; i++) {
    const enemy = new Enemy(100 + Math.floor(Math.random() * ctx.canvas.width), -24, 24, 24, 100, Math.floor(Math.random() * 30) + 50, explosive_ob_frame_set, 3);
    enemy.image.src = '/spaceship/image/enemy.png'
    enemys.push(enemy);
}

const bulletImage = new Image();
bulletImage.src = '/spaceship/image/bullet-1.png';

const frame_bullet = [
    {x: 0, y: 0},
    {x: 15, y: 0},
    {x: 30, y: 0},
    {x: 45, y: 0},
    {x: 60, y: 0},
    {x: 75, y: 0},
    {x: 90, y: 0}, 
    {x: 105, y: 0}, 
    {x: 120, y: 0}, 
    {x: 135, y: 0},
    {x: 150, y: 0},
    {x: 165, y: 0},
    {x: 180, y: 0},
    {x: 195, y: 0},
    {x: 210, y: 0},
    {x: 225, y: 0}
];



const background = new Image();
background.src = '/spaceship/image/background.jpg';

window.addEventListener('keydown',controller.keyUpDown);
window.addEventListener('keyup', controller.keyUpDown);

window.requestAnimationFrame(loop);