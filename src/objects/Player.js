import Ship from './Ship';

export default class Player extends Ship {
    constructor(name, game, x, y, direction, asset, stats) {
        super(name, game, x, y, direction, asset, stats);

        this.stats = Object.assign({}, this.stats, stats, {
            health: 10,
            maxHealth: 10,
            xp: 0,
            coins: 0
        });
    }

    award(content) {
        super.award(content);

        this.stats.xp += content.xp || 0;
        this.stats.coins += content.coins || 0;
        this.stats.health += content.health || 0;
    }
}
