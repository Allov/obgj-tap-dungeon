import _ from 'lodash';
import Ship from './Ship';
import GameState from '../states/GameState';

export default class Ennemy extends Ship {
    constructor(name, game, x, y, direction, asset, stats, content) {
        super(name, game, x, y, direction, asset, stats);

        this.stats = {
            health: 10,
            damage: 1,
            attackSpeed: 5000 // in ms
        };
        this.stats = Object.assign({}, this.stats, stats);

        this.content = {
            xp: Math.rnd(10, 20),
            coins: Math.rnd(1, 2)
        };

        this.content = Object.assign({}, this.content, content);
    }

    create() {
        super.create();

        this.state = this.game.state.states['GameState'];
        this.state.shoot.add(this._hit, this);
    }

    _hit(e) {
        if (!_.isEqual(e.combo, GameState.Combos.FAILED)) {
            this.hit(e.shooter.stats.damage);

            if (this.dead) {
                console.log(`${this.name} died.`, this.content);
                e.shooter.award(this.content);
                this.state.shoot.removeAll(this);
            }
        }
    }
}
