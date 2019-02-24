class Obstacles extends Component {
    constructor(x, y, width, height, hitpoint, speed, frame_set) {
        super(x, y, height, width);
        this.hitpoint = hitpoint;
        this.speed = speed;
        this.damage = 20;
        this.item = -1;
        this.delayCancel = 28;
        this.countCancel = this.delayCancel;
        this.animation = new Animation();
        this.animation.change(frame_set, 7);
        this.dy = this.y;

    }

    draw() {
        if(this.state == STATE.ALIVE) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else if(this.state == STATE.EXPLOSIVE) {
            
            this.animation.change(explosive_ob_frame_set, 60);
            this.animation.update();
            ctx.drawImage(
                explosiveOBImage,
                this.animation.frame.x, this.animation.frame.y, this.animation.frame.width, this.animation.frame.height,
                this.x - 6, this.dy, this.animation.frame.width, this.animation.frame.height
            )
        }
    }

    update(dt) {
        this.y += this.speed * dt;

        if(this.state == STATE.ALIVE) {
            const rectShip = new Rect(ship.x, ship.y, ship.x + ship.width, ship.y + ship.height);
            
            if(this.rect.collision(rectShip)) {
                ship.hitpoint = (ship.hitpoint - this.damage) < 0 ? 0 : (ship.hitpoint - this.damage);
                this.width = this.height = 0;
                this.hitpoint = 0;
                this.dead();
            }

            bullets.forEach(b => {
                if(this.rect.collision(b.rect) && b.state == STATE.ALIVE) {
                    this.hitpoint -= b.damage;
                    b.state = STATE.CANCEL;
                    if(this.hitpoint < 0) {
                        this.dead();
                    }
                }
            });
        }

        if(this.state == STATE.EXPLOSIVE) {
            this.countCancel--;
            if(this.countCancel == 0) {
                this.state = STATE.CANCEL;
            }
        }

        if(this.y > ctx.canvas.height + this.height) {
            this.reset();
        }
    }

    dead() {
        this.state = STATE.EXPLOSIVE;
        this.dy = this.y;
        if (this.item != -1) {
            const item = new Item(this.x, this.y, 20, 20, this.item);
            switch (this.item) {
                case 0:
                    item.image.src = 'image/bullet.png';
                    break;
                case 1:
                    item.image.src = 'image/health.png';
                    break;
            }
            items.push(item);
        } 
    }

    reset() {
        this.width = this.height = Math.floor(Math.random() * 8) + 16;
        this.y = -this.height;

        this.x = Math.floor(Math.random() * ctx.canvas.width);
        this.state = STATE.ALIVE;
        this.hitpoint = 100;
        this.countCancel = this.delayCancel;
        this.item = Math.floor(Math.random() * 20);
        this.animation.frame_index = 0;
    }
}