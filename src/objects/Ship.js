import BaseObject from './BaseObject';
import { text } from '../helpers/Helpers';

export default class Ship extends BaseObject {
    constructor(name, game, x, y, direction, asset, stats) {
        super(name, game, x, y, direction, asset);

        this.stats = stats;
    }

    hit(damage) {
        this.stats.health -= damage;

        const x = this.sprite.x + this.sprite.width / 2;
        const y = this.sprite.y + this.sprite.height / 2;;
        const dt = text(this.game, -damage.pad(2, '0'), x, y, { fill: '#ff0', font: 'bold 24px Courier New' });
        this.game.add.tween(dt).to({ y: y + 90, alpha: 1 }, 1000, Phaser.Easing.Bounce.Out, true, 0, 0)
            .onComplete.add(() => dt.kill(), this);

        if (this.stats.health <= 0) {
            this.idle.stop();
            this.game.add.tween(this.sprite).to({ x: this.x + 50, y: this.y + 20, alpha: 0 }, 1500, 'Sine.easeInOut', true, 0, 0)
                .onComplete.add(() => {
                    this.dead = true;
                    this.sprite.kill();
            }, this);
            this.ready = false;

            this.game.sound.play('explosion', 0.2);
        } else {
            this.game.sound.play('hit', 0.2);
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
