class Item extends Component {

    constructor(x, y, width, height, type) {
        super(x, y, width, height);
        this.type = type;
    }

    update(dt) {
        this.y += this.speed * dt;

        const rectShip = new Rect(ship.x, ship.y, ship.x + ship.width, ship.y + ship.height);

        if(this.rect.collision(rectShip) && this.state == STATE.ALIVE) {
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

            this.state = STATE.CANCEL;
        }
    }

}