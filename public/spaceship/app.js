// const ctx = document.querySelector('canvas').getContext('2d');

const ctx = document.createElement('canvas').getContext('2d');
const display = document.querySelector('canvas').getContext('2d');

ctx.canvas.width = 480;
ctx.canvas.height = 270;

display.canvas.width = 480 * 1.5;
display.canvas.height = 270 * 1.5;
display.imageSmoothingEnabled = false;

const LEFT = {x: -1, y: 0};
const UP = {x: 0, y: -1};
const RIGHT = {x: 1, y: 0};
const DOWN = {x: 0, y: 1};

const toRad = function(deg) {
    return deg * Math.PI / 180;
};

const ship = {
    x: 0,
    y: 0,
    direction: RIGHT,
    width: 24,
    height: 24,
    delay: 7,
    speed: 150,
    hitpoint: 100,
    bullet: 1,
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
    
        ctx.drawImage(ship.image, ship.x, ship.y, ship.width, ship.height);
        if(controller.up) {
            ctx.drawImage(fireImage, 137, 53, 11, 18, ship.x + ship.width / 2 - 5.5, ship.y + ship.height - 2, 11, 18);
        } else 
        ctx.drawImage(fireImage, 116, 57, 13, 8, ship.x + ship.width / 2 - 6.5, ship.y + ship.height - 2, 13, 8);
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

class Bullet {
    constructor(x, y, alpha, frame_index, ship) {
        this.x = x;
        this.y = y;
        this.alpha = 0;
        this.d = 10;
        this.count = 0;
        this.speed = 300;
        this.damage = 20;
        this.alpha = alpha;
        this.color = '#fff';
        this.collision = false;
        this.frame_index = frame_index;
        this.ship = ship;
    }

    update(dt) {
        this.y -= this.speed * dt;

        const cos = Math.cos(toRad(this.alpha));
        const sin = Math.sin(toRad(this.alpha));
        const d1 = this.ship.y - this.y;
        const d2 = this.ship.y - this.y - this.d;

        const x = this.x + sin * d1 - 7.5;
        const y = this.ship.y + cos * d1;

        if(!this.collision) {
            ctx.drawImage(bulletImage, frame_bullet[this.frame_index].x, frame_bullet[this.frame_index].y, 15, 15, x, y, 15, 15);
        } else {
            ctx.drawImage(explosiveImage, x, y, 16, 16);
        }
    }

    get rect() {
        const cos = Math.cos(toRad(this.alpha));
        const sin = Math.sin(toRad(this.alpha));
        const d1 = this.ship.y - this.y;
        const d2 = this.ship.y - this.y - this.d;
        return new Rect
            (
                this.x + sin * d1,
                this.ship.y + cos * d1,
                this.x + sin * d2,
                this.ship.y + cos * d2
            );
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

class Component {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = 110;
        this.image = new Image();
        this.collision = false;
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    get rect() {
        return new Rect(this.x, this.y, this.x + this.width, this.y + this.height);
    }
}

class Item extends Component {

    constructor(x, y, width, height, type) {
        super(x, y, width, height);
        this.type = type;
    }

    update(dt) {
        this.y += this.speed * dt;

        const rectShip = new Rect(ship.x, ship.y, ship.x + ship.width, ship.y + ship.height);

        if(this.rect.collision(rectShip) && !this.collision) {
            switch (this.type) {
                case 0:
                    ship.bullet += 2;
                    if(ship.bullet > 16) {
                        ship.bullet = 16;
                    }
                break;
                case 1:
                    ship.hitpoint += 40;
                    if(ship.hitpoint > 100) {
                        ship.hitpoint = 100;
                    }
                break;
            }

            this.collision = true;
        }
    }

}

class Obstacles extends Component {
    constructor(x, y, width, height, hitpoint, speed) {
        super(x, y, height, width);
        this.hitpoint = hitpoint;
        this.speed = speed;
        this.damage = 20;
        this.item = -1;
    }

    update(dt) {
        this.y += this.speed * dt;

        if(!this.collision) {
            const rectShip = new Rect(ship.x, ship.y, ship.x + ship.width, ship.y + ship.height);
            
            if(this.rect.collision(rectShip)) {
                ship.hitpoint = (ship.hitpoint - this.damage) < 0 ? 0 : (ship.hitpoint - this.damage);
                this.collision = true;
                this.width = this.height = 0;
                this.hitpoint = 0;
                this.dead();
            }

            bullets.forEach(b => {
                if(this.rect.collision(b.rect) && !b.collision) {
                    this.hitpoint -= b.damage;
                    b.collision = true;
                    if(this.hitpoint < 0) {
                        this.dead();
                    }
                }
            });
        }

        if(this.y > ctx.canvas.height + this.height) {
            this.reset();
        }
    }

    dead() {
        this.collision = true;
        this.width = this.height = 0;
        if (this.item != -1) {
            const item = new Item(this.x, this.y, 20, 20, this.item);
            switch (this.item) {
                case 0:
                    item.image.src = '/spaceship/bullet.png';
                    break;
                case 1:
                    item.image.src = '/spaceship/health.png';
                    break;
            }
            items.push(item);
        } 
    }

    reset() {
        this.x = Math.floor(Math.random() * ctx.canvas.width);
        this.width = this.height = Math.floor(Math.random() * 8) + 16;
        this.y = -this.height;
        this.collision = false;
        this.hitpoint = 100;
        this.item = Math.floor(Math.random() * 20);
    }
}

class Enemy extends Obstacles {
    constructor(x, y, width, height, hitpoint, speed, bullet) {
        super(x, y, width, height, hitpoint, speed);
        this.bullet = bullet;
        this.bullets = [];
        this.delay = 100;
        this.count = 0;
    }

    update(dt) {
        super.update(dt);
        if(this.hitpoint > 0) {
            this.count--;
            if(this.count < 0) {
                this.count = this.delay;
                let deg = - Math.floor(this.bullet / 2) * 22.5;
                let frame = Math.floor(this.bullet / 2);
                for(let i = 0; i < this.bullet; i++) {                
                    let bullet = new Bullet(this.x + this.width / 2, this.y - this.height , deg, frame, this);
                    bullet.speed = 20;
                    bullet.color = '#0ff';
                    bullet.damage = 10;
                    this.bullets.push(bullet);
                    deg += 22.5;
                    frame--;
                    if(frame < 0) {
                        frame = frame_bullet.length - 1;
                    }
                }
            }
        }   

        const rectShip = new Rect(ship.x, ship.y, ship.x + ship.width, ship.y + ship.height);
        this.bullets.forEach(b => {
            b.update(dt);
            if(rectShip.collision(b.rect) && !b.collision) {
                b.collision = true;
                ship.hitpoint -= b.damage;
                if(ship.hitpoint < 0) {
                    ship.hitpoint = 0;
                }
            }
        });
        this.bullets = this.bullets.filter(b => !b.collision);
    }

    reset() {
        this.x = Math.floor(Math.random() * ctx.canvas.width);
        this.width = this.height = 24;
        this.y = -this.height;
        this.collision = false;
        this.hitpoint = 100;
        this.item = Math.floor(Math.random() * 20);
        this.count = 0;
        this.bullets = [];
    }
}

let pt = 0;
let count = ship.delay;

const loop = function(time_stamp) {
    const dt = (time_stamp - pt) /1000;
    pt = time_stamp;

    // ctx.fillStyle = '#202830';
    // ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.drawImage(background, 0, 0, ctx.canvas.width, ctx.canvas.height);

    if(controller.right && ship.x <= ctx.canvas.width - ship.width) {
        ship.x += ship.speed * dt;
    }

    if(controller.left && ship.x >= 0) {
        ship.x -= ship.speed * dt;
    }

    if(controller.up && ship.y >= 0) {
        ship.y -= ship.speed * dt;
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

    bullets = bullets.filter(b => (b.x >= -ctx.canvas.width && b.y >= -ctx.canvas.height && !b.collision));
    items = items.filter(item => (item.y <= ctx.canvas.height - item.height && !item.collision));

    display.drawImage(ctx.canvas , 0, 0, ctx.canvas.width, ctx.canvas.height, 0, 0, display.canvas.width, display.canvas.height);
    window.requestAnimationFrame(loop);
}

let bullets = [];
let items = [];

ship.image.src = '/spaceship/space_ship.png';
ship.x = ctx.canvas.width / 2 - ship.width / 2;
ship.y = ctx.canvas.height - ship.height;

let meteors = [];
for(let i = 0; i < 5; i++) {
    const m = new Obstacles(Math.floor(Math.random() * ctx.canvas.width), -24, 24, 24, 100, Math.floor(Math.random() * 30) + 50);
    m.image.src = '/spaceship/meteorite.png'
    meteors.push(m);
}

let enemys = [];
for(let i = 0; i < 3; i++) {
    const enemy = new Enemy(100 + Math.floor(Math.random() * ctx.canvas.width), -24, 24, 24, 100, Math.floor(Math.random() * 30) + 50, 3);
    enemy.image.src = '/spaceship/enemy.png'
    enemys.push(enemy);
}

const bulletImage = new Image();
bulletImage.src = '/spaceship/bullet-1.png';

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

const explosiveImage = new Image();
explosiveImage.src = '/spaceship/explosive.png';

const fireImage = new Image();
fireImage.src = '/spaceship/b.png';

const background = new Image();
background.src = '/spaceship/background.jpg';

window.addEventListener('keydown',controller.keyUpDown);
window.addEventListener('keyup', controller.keyUpDown);

window.requestAnimationFrame(loop);