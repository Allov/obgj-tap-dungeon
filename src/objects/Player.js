import Ship from './Ship';
import ColoredText from './ColoredText';

export default class Player extends Ship {
    constructor(name, game, x, y, direction, asset, stats) {
        super(name, game, x, y, direction, asset, stats);

        this.stats = {
            health: 10,
            maxHealth: 10,
            xp: 0,
            coins: 0
        };
        this.stats = Object.assign({}, this.stats, stats);
    }

    award(content) {
        super.award(content);

        this.stats.xp += content.xp || 0;
        this.stats.coins += content.coins || 0;
        this.stats.health += (content.health || 0);

        if (this.stats.health > this.stats.maxHealth) {
            this.stats.health = this.stats.maxHealth;
        } else if (content.health > 0) {
            const ct = new ColoredText(this.game, this.sprite.x + (this.sprite.width / 2), this.sprite.y + (this.sprite.height / 2), `{#0f0}+${content.health}`, { font: 'bold 36px Courier New', align: 'center' })
            ct.anchor.x = 0.5;

            this.game.add.tween(ct).to({ y: this.sprite.y - 50, alpha: 0 }, 2000, null, true, 0, 0)
                .onComplete.add(() => ct.kill());
        }

        this.stats.damage += content.damage || 0;
    }
}
