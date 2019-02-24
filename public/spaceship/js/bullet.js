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
        this.frame_index = frame_index;
        this.state = STATE.ALIVE;
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

        if(this.state == STATE.ALIVE) {
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