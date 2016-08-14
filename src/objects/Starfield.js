export default class Starfield {
    constructor(name, game, count, w, h) {
        this.name = name;
        this.game = game;
        this.count = count;
        this.w = w;
        this.h = h;
        this.stars = [];
        this.textures = [];
        this.sprites = [];
        this._alpha = 0.4;
        this._scale = 1;

        this.speed = 1;
    }

    preload() {
        this.game.load.image('star', 'assets/star.png');
    }

    create() {
        this.star = this.game.make.sprite(0, 0, 'star');

        this.textures.push(this.game.add.renderTexture(500, 500, 'starfield_texture1'));
        this.textures.push(this.game.add.renderTexture(500, 500, 'starfield_texture2'));
        this.textures.push(this.game.add.renderTexture(500, 500, 'starfield_texture3'));

        let color = 0xAAAAAA;
        let i = 0;
        for (let texture of this.textures) {
            this.sprites.push(this.game.add.sprite(0, 0, texture));
            this.sprites[i].tint = color;
            this.sprites[i].alpha = 0.4;
            color += 0x222222;
            i++;
        }

        let speed = 7;
        let texture = -1;

        for(let i = 0; i < this.count; i++) {
            if (i % 100 == 0) {
                speed--;
                texture++;
            }

            this.stars.push({
                x: this.game.world.randomX,
                y: this.game.world.randomY,
                speed,
                texture: this.textures[texture]
            });
        }
    }

    accelerate(acceleration) {
        this.speed += acceleration;

        if (this.speed > 2) {
            this.speed = 2;
        }

        if (acceleration > 0) {
            this._alpha += acceleration;
            this._scale += acceleration;
        } else {
            this._alpha -= 0.007;
            this._scale -= 0.007;
        }

        if (this._alpha > 1) {
            this._alpha = 1;
        }

        if (this._alpha < 0.4) {
            this._alpha = 0.4;
        }

        if (this._scale > 3) {
            this._scale = 3;
        }

        if (this._scale < 1) {
            this._scale = 1;
        }

        for (let sprite of this.sprites) {
            sprite.alpha = this._alpha;
            sprite.scale.setTo(this._scale, 1);
        }
    }

    render() {
        for(let i = 0; i < this.count; i++) {
            this.stars[i].x -= (this.stars[i].speed * this.speed);

            if (this.stars[i].x < 0) {
                this.stars[i].x = 600;
                this.stars[i].y = this.game.world.randomY;
            }

            if (i % 100 == 0)
            {
                //  If it's the first star of the layer then we clear the texture
                this.stars[i].texture.renderXY(this.star, this.stars[i].x, this.stars[i].y, true);
            } else {
                //  Otherwise just draw the star sprite where we need it
                this.stars[i].texture.renderXY(this.star, this.stars[i].x, this.stars[i].y, false);
            }
        }
    }
}
