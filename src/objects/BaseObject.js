export default class BaseObject {
    constructor(name, game, x, y, direction, asset) {
        this.name = name;
        this.game = game;
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.asset = asset;

        this.ready = false;
        this.onReady = new Phaser.Signal();
    }

    create() {
        this.sprite = this.game.add.sprite(this.x, this.y, this.asset);
        this.sprite.alpha = 0;

        // const offset = (100 * this.direction) - (this.sprite.width * this.direction);
        // const position = this.x + offset + (this.direction * ((this.game.world.centerX / 2)));

        let position = 0;

        if (this.direction > 0) {
            position = 25;
        } else {
            position = (this.game.world.width - 25) - this.sprite.width;
        }

        const intro = this.game.add.tween(this.sprite).to({ x: position, alpha: 1 }, 2000, 'Sine.easeInOut', true, 0, 0);
        intro.onComplete.add(() => {
            this.ready = true;
            this.onReady.dispatch(this);
        });

        this.idle = this.game.add.tween(this.sprite).to( { x: position, y: this.y + Math.rnd(7, 15) }, Math.rnd(500,700), 'Sine.easeInOut', false, -1, false, true);
        intro.chain(this.idle);
    }
}
