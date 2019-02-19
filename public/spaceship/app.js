const ctx = document.querySelector('canvas').getContext('2d');

ctx.canvas.width = 480;
ctx.canvas.height = 270;

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
    constructor(x, y, alpha) {
        this.x = x;
        this.y = y;
        this.alpha = 0;
        this.d = 10;
        this.count = 0;
        this.speed = 300;
        this.damage = 20;
        this.alpha = alpha;
        this.collision = false;
    }

    update(dt) {
        const cos = Math.cos(toRad(90 - this.alpha));
        const sin = Math.sin(toRad(90 - this.alpha));

        this.y -= this.speed * dt;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.beginPath();

        const x = this.x;

        // ctx.moveTo(x, this.y);
        // ctx.lineTo(x, this.y - 10);

        ctx.moveTo(x + (ship.y - this.y) * sin, (ship.y - this.y) * cos + ship.y);
        ctx.lineTo(x + (ship.y - this.y - 10) * sin, (ship.y - this.y - 10) * cos + ship.y);

        // ctx.moveTo(x + (ship.y - this.y) * cos, (ship.y - this.y) * sin + ship.y);
        // ctx.lineTo(x + (ship.y - this.y - 10) * cos, (ship.y - this.y - 10) * sin + ship.y);

        ctx.stroke();
        ctx.closePath();
    }

    get rect() {
        const cos = Math.cos(toRad(90 - this.alpha));
        const sin = Math.sin(toRad(90 - this.alpha));
        const x = this.x;
        return new Rect
            (
                x + (ship.y - this.y) * sin,
                (ship.y - this.y) * cos + ship.y,
                x + (ship.y - this.y - 10) * sin,
                (ship.y - this.y - 10) * cos + ship.y
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
                    if(ship.bullet > 12) {
                        ship.bullet = 12;
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

        const rectShip = new Rect(ship.x, ship.y, ship.x + ship.width, ship.y + ship.height);
        
        if(this.rect.collision(rectShip) && !this.collision) {
            ship.hitpoint = (ship.hitpoint - this.damage) < 0 ? 0 : (ship.hitpoint - this.damage);
            this.collision = true;
            this.width = this.height = 0;
        }

        bullets.forEach(b => {
            if(this.rect.collision(b.rect) && !b.collision) {
                this.hitpoint -= b.damage;
                b.collision = true;
                if(this.hitpoint < 0) {
                    this.collision = true; 
                    this.width = this.height = 0;
                    if(this.item != -1) {
                        const item = new Item(this.x, this.y, 20, 20, this.item);
                        switch(this.item) {
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
            }
        });

        if(this.y > ctx.canvas.height + this.height) {
            this.x = Math.floor(Math.random() * ctx.canvas.width);
            this.width = this.height = Math.floor(Math.random() * 8) + 16;
            this.y = -this.height;
            this.collision = false;
            this.hitpoint = 100;
            this.item = Math.floor(Math.random() * 20);
        }
    }
}

let pt = 0;
let count = 10;

const loop = function(time_stamp) {
    const dt = (time_stamp - pt) /1000;
    pt = time_stamp;

    ctx.fillStyle = '#202830';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

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

    if(controller.shot) {
        count--;
        if(count == 0) {
            count = ship.delay;
            let deg = 270 - Math.floor(ship.bullet / 2) * 30;
            for(let i = 0; i < ship.bullet; i++) {
                bullets.push(new Bullet(ship.x + ship.width / 2, ship.y, deg));
                deg += 30;
            }
        }
    }
    ship.draw();
    bullets.forEach(i => i.update(dt));

    meteors.forEach(m => {
        m.update(dt);
        m.draw();
    });

    items.forEach(item => {
        item.update(dt);
        item.draw();
    })

    bullets = bullets.filter(b => (b.x >= -ctx.canvas.width && b.y >= -ctx.canvas.height && !b.collision));
    items = items.filter(item => (item.y <= ctx.canvas.height - item.height && !item.collision));

    window.requestAnimationFrame(loop);
}

let bullets = [];
let items = [];

ship.image.src = '/spaceship/space_ship.png';
ship.x = ctx.canvas.width / 2 - ship.width / 2;
ship.y = ctx.canvas.height - ship.height;

let meteors = [];
for(let i = 0; i < 10; i++) {
    const m = new Obstacles(100 + Math.floor(Math.random() * 200), 1000, 24, 24, 100, Math.floor(Math.random() * 30) + 50);
    m.image.src = '/spaceship/meteorite.png'
    meteors.push(m);
}

window.addEventListener('keydown',controller.keyUpDown);
window.addEventListener('keyup', controller.keyUpDown);

window.requestAnimationFrame(loop);