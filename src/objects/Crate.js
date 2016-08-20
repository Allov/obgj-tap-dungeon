import _ from 'lodash';
import GameState from '../States/GameState';

export default class Crate {
    constructor(name, game, x, y, direction, asset, stats, content) {
        this.name = name;
        this.game = game;
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.asset = asset;

        this.stats = Object.assign({}, this.stats, stats, {
            nonFailures: 3,
            maximumFailures: 3
        });

        this.content = Object.assign({}, this.content, content, {
            xp: Math.rnd(5, 10),
            coins: Math.rnd(2, 4)
        });

        this.failures = 0;

        this.ready = false;
        this.onReady = new Phaser.Signal();
    }

    create() {
        this.sprite = this.game.add.sprite(this.x, this.y, this.asset);
        this.sprite.alpha = 0;
        this.sprite.scale.setTo(0.2);

        const intro = this.game.add.tween(this.sprite).to({ x: this.x + (this.direction * 200), alpha: 1 }, 2000, 'Sine.easeInOut', true, 0, 0);
        intro.onComplete.add(() => {
            this.ready = true;
            this.onReady.dispatch(this);
        });

        this.idle = this.game.add.tween(this.sprite).to( { x: this.x + (this.direction * 200), y: this.y + Math.rnd(7, 15) }, Math.rnd(500,700), 'Sine.easeInOut', false, -1, false, true);
        intro.chain(this.idle);

        this.state = this.game.state.states['GameState'];
        this.state.shoot.add(this._hit, this);
    }

    _hit(e) {
        if (!_.isEqual(e.combo, GameState.Combos.FAILED)) {
            this.stats.nonFailures -= 1;
        } else {
            this.failures++;
        }

        if (this.stats.nonFailures <= 0) {
            e.shooter.award(this.content);
            this.kill();
        } else if (this.failures >= this.stats.maximumFailures) {
            this.kill();
        }
    }

    kill() {
        this.idle.stop();
        this.dead = true;
        this.game.add.tween(this.sprite).to({ x: this.x + 50, y: this.y + 20, alpha: 0 }, 1500, 'Sine.easeInOut', true, 0, 0);
        this.sprite.kill();
        console.log(`${this.name} died.`, this.content);
        this.state.shoot.removeAll(this);
        this.ready = false;
    }
}
