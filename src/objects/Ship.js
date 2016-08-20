export default class Ship {
    constructor(name, game, x, y, direction, asset, stats) {
        this.name = name;
        this.game = game;
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.asset = asset;

        this.stats = stats;
        this.ready = false;
        this.onReady = new Phaser.Signal();
    }

    create() {
        this.sprite = this.game.add.sprite(this.x, this.y, this.asset);
        this.sprite.scale.setTo(0.2, 0.2);
        this.sprite.alpha = 0;

        const intro = this.game.add.tween(this.sprite).to({ x: this.x + (this.direction * 200), alpha: 1 }, 2000, 'Sine.easeInOut', true, 0, 0);
        intro.onComplete.add(() => {
            this.ready = true;
            this.onReady.dispatch(this);
        });

        this.idle = this.game.add.tween(this.sprite).to( { x: this.x + (this.direction * 200), y: this.y + Math.rnd(7, 15) }, Math.rnd(500,700), 'Sine.easeInOut', false, -1, false, true);
        intro.chain(this.idle);
    }

    hit(damage) {
        this.stats.health -= damage;

        if (this.stats.health <= 0) {
            this.idle.stop();
            this.dead = true;
            this.game.add.tween(this.sprite).to({ x: this.x + 50, y: this.y + 20, alpha: 0 }, 1500, 'Sine.easeInOut', true, 0, 0);
            this.sprite.kill();
            this.ready = false;
        }
    }

    attack(object, multiplier) {
        const dmg = this.stats.damage * multiplier;
        object.hit(dmg);

        return dmg;
    }

    award(content) {
    }

    render() {
    }
}
