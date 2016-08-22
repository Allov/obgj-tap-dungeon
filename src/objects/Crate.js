import _ from 'lodash';
import GameState from '../states/GameState';
import BaseObject from './BaseObject';
import ColoredText from './ColoredText';

export default class Crate extends BaseObject {
    constructor(name, game, x, y, direction, asset, stats, content) {
        super(name, game, x, y, direction, asset);

        const greatCount = Math.rnd(2, 3);
        this.stats = Object.assign({}, this.stats, stats, {
            nonFailures: greatCount,
            maximumFailures: 3
        });

        this.content = Object.assign({}, this.content, content, {
            xp: Math.rnd(5, 10),
            coins: Math.rnd(2, 4),
            damage: 0.25 * greatCount,
            health: greatCount * 3,
        });

        this.failures = 0;
    }

    create() {
        super.create();

        this.state = this.game.state.states['GameState'];
        this.state.shoot.add(this._hit, this);

        this.ct = new ColoredText(this.game, this.game.world.centerX, this.game.world.centerY + 50, '', { font: 'bold 18px Courier New', align: 'center' })
        this.ct.anchor.x = 0.5;
    }

    render() {
        this.text = `{#fff}Get {#ff0}${this.stats.nonFailures} {#f80}greats{#fff} to unlock\n`+
                    `allowed failures: {#f00}${this.stats.maximumFailures - this.failures}{#fff}\n`+
                    `\n`+
                    `reward: {#99f}+${this.content.damage.toFixed(0)} damage {#0f0}+${this.content.health} health`;
        this.ct.coloredText = this.text;
    }

    _hit(e) {
        if (_.isEqual(e.combo, GameState.Combos.GREAT)) {
            this.stats.nonFailures--;
            this.game.sound.play('great', 0.2);
        } else {
            this.failures++;
            this.game.sound.play('error', 0.2);
        }

        if (this.stats.nonFailures <= 0) {
            e.shooter.award(this.content);
            this.kill();
            this.game.sound.play('powerup', 0.2);
        } else if (this.failures >= this.stats.maximumFailures) {
            this.kill();
            this.game.sound.play('explosion', 0.2);
        }
    }

    kill() {
        this.idle.stop();
        this.dead = true;
        this.game.add.tween(this.sprite).to({ x: this.x + 50, y: this.y + 20, alpha: 0 }, 1500, 'Sine.easeInOut', true, 0, 0);
        this.sprite.kill();
        this.state.shoot.removeAll(this);
        this.ready = false;
        this.ct.kill();
    }
}
