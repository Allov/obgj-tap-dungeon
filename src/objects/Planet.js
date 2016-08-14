export default class Planet {
    constructor(name, game, x, y, asset) {
        this.name = name;
        this.game = game;
        this.x = x;
        this.y = y;
        this.asset = asset;

        this._alpha = 0.7;
    }

    preload() {
        this.game.load.image(this.name, this.asset);
    }

    create() {
        const sprite = this.game.add.sprite(this.x, this.y, this.name);
        sprite.scale.setTo(0.7, 0.7);
        sprite.alpha = this._alpha;
        this.game.add.tween(sprite).to( { x: -1000, y: this.y }, 60000, null, true, -1, false);
    }
}
