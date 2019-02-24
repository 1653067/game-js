class Enemy extends Obstacles {
    constructor(x, y, width, height, hitpoint, speed, frame_set, bullet) {
        super(x, y, width, height, hitpoint, speed, frame_set);
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
            if(rectShip.collision(b.rect) && b.state == STATE.ALIVE) {
                b.state = STATE.CANCEL;
                ship.hitpoint -= b.damage;
                if(ship.hitpoint < 0) {
                    ship.hitpoint = 0;
                }
            }
        });
        this.bullets = this.bullets.filter(b => b.state != STATE.CANCEL);
    }

    reset() {
        super.reset();
        this.width = this.height = 24;
        this.y = -this.height;
        this.count = 0;
        this.countCancel = this.delayCancel;
        this.bullets = [];
    }
}