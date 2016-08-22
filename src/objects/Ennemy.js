import _ from 'lodash';
import Ship from './Ship';
import GameState from '../states/GameState';

export default class Ennemy extends Ship {
    constructor(name, game, x, y, direction, asset, stats, content) {
        super(name, game, x, y, direction, asset, stats);

        this.stats = {
            health: 10,
            damage: 1,
            attackSpeed: Math.rnd(2000, 3000) // in ms
        };
        this.stats = Object.assign({}, this.stats, stats);

        this.content = {
            xp: Math.rnd(10, 20),
            coins: Math.rnd(1, 2),
            health: Math.rnd(0, 10)
        };

        this.content = Object.assign({}, this.content, content);
        this.id = Math.rnd(1, 1000);
    }

    create() {
        super.create();

        this.state = this.game.state.states['GameState'];
        this.state.shoot.add(this._hit, this);
    }

    _hit(e) {
        if (!_.isEqual(e.combo, GameState.Combos.FAILED)) {
            this.hit(e.shooter.stats.damage * e.combo.multiplier);

            if (this.dead) {
                this.kill(e);
            }
        }
    }

    kill(e) {
        if (e) {
            e.shooter.award(this.content);
        }
        this.state.shoot.removeAll(this);
    }
}
