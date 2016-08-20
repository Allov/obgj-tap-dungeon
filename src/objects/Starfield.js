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

        this.textures.push(this.game.add.renderTexture(this.w, this.h, 'starfield_texture1'));
        this.textures.push(this.game.add.renderTexture(this.w, this.h, 'starfield_texture2'));
        this.textures.push(this.game.add.renderTexture(this.w, this.h, 'starfield_texture3'));

        let color = 0xAAAAAA;
        let i = 0;
        let speed = 1;
        for (let texture of this.textures) {
            for(let i = 0; i < 2; i++) {
                const field = this._createFieldTexture(color, texture, speed, i, false /*trailing effect*/);
                this.sprites.push(field);
            }

            color += 0x222222;
            speed += 1;
            i++;
        }

        let texture = -1;
        for(let i = 0; i < this.count; i++) {
            let clear = false;
            if (i % (this.count / this.textures.length)  == 0) {
                clear = true;
                texture++;
            }

            this.textures[texture].renderXY(this.star, this.game.world.randomX, this.game.world.randomY, clear);
        }
    }

    _createFieldTexture(color, texture, speed, position, trailingEffectOnly) {
        const field = this.game.add.sprite(0, 0, texture);
        field.tint = color;
        field.alpha = 0.4;
        field.x = (this.w + 1) * position; // make it so it follows the first sprite
        field.speed = speed;
        field.trailingEffectOnly = trailingEffectOnly;
        field.visible = !trailingEffectOnly;

        return field;
    }

    accelerate(acceleration) {
        this.speed += acceleration;

        if (this.speed > 2) {
            this.speed = 2;
        }

        if (acceleration > 0) {
            this._alpha += acceleration;
            // this._scale += acceleration;
        } else {
            this._alpha -= 0.007;
            // this._scale -= 0.007;
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
            //sprite.scale.setTo(this._scale, 1);
        }
    }

    render() {
        for(let sprite of this.sprites) {
            this._moveSprite(sprite);
        }
    }

    _moveSprite(sprite) {
        sprite.x -= sprite.speed * this.speed;

        const w = this.w; // (this.w * this._scale);
        if (sprite.x + w < 0) {
            sprite.x = w + 1; // going back to the queue!
        }
    }
}
