class Component {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = 110;
        this.image = new Image();
        this.state = STATE.ALIVE;
    }

    draw() {
        if(this.state == STATE.ALIVE) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
    }

    update(dt) {

    }

    get rect() {
        return new Rect(this.x, this.y, this.x + this.width, this.y + this.height);
    }
}