import _ from 'lodash';
import Player from '../objects/Player';
import Ennemy from '../objects/Ennemy';
import Starfield from '../objects/Starfield';
import Metronome from '../objects/Metronome';
import Crate from '../objects/Crate';
import { config } from './StateConfig';
import { text } from '../helpers/Helpers';
import ColoredText from '../objects/ColoredText';

export default class GameState extends Phaser.State {

    static get MINUTE_IN_MS() {
        return 60000;
    }

    static get Combos() {
        return {
            GREAT: { text: 'great', color: '255, 128, 0', multiplier: 1.5 },
            GOOD: { text: 'good', color: '50, 200, 50', multiplier: 1 },
            WEAK: { text: 'weak', color: '128, 128, 128', multiplier: 0.5 },
            FAILED: { text: 'failed', color: '255, 0, 0', multiplier: 0 }
        };

    }
    constructor() {
        super();

        this.shoot = new Phaser.Signal();
    }

    preload() {
        this.ready = false;

        this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL

        this.BPM = 175;
        this.shipPosition = 300;
        //this.BPM = 87.5;

        this.starfield = new Starfield('starfield', this.game, 300, this.game.scale.width, this.game.scale.height);
        this.starfield.preload();
        this.objectCounts = 0;

        if (!this.game.cache.checkImageKey('player')) {
            this.game.load.image('player', 'assets/player.png');
            this.game.load.image('ennemy1', 'assets/ennemy1.png');
            this.game.load.image('ennemy2', 'assets/ennemy2.png');
            this.game.load.image('ennemy3', 'assets/ennemy3.png');
            this.game.load.image('box', 'assets/box.png');
            this.game.load.image('tech', 'assets/tech.svg');
            this.game.load.image('laser', 'assets/laser.png');
            this.game.load.image('healthbar', 'assets/healthbar.png');
            this.game.load.image('player_healthbar', 'assets/player_healthbar.png');
            this.game.load.audio('laser', 'assets/laser.wav');
            this.game.load.audio('laser-good', 'assets/laser-good.wav');
            this.game.load.audio('laser-weak', 'assets/laser-weak.wav');
            this.game.load.audio('explosion', 'assets/explosion.wav');
            this.game.load.audio('powerup', 'assets/powerup.wav');
            this.game.load.audio('hit', 'assets/hit.wav');
            this.game.load.audio('error', 'assets/error.wav');
            this.game.load.audio('great', 'assets/great.wav');
            this.game.load.audio('game_audio', 'assets/dnd3-3.ogg');
        } else {
            this.alreadyLoaded = true;
        }
    }

    create() {
        this.game.physics.startSystem(Phaser.Physics.ARCADE);

        this.audio = this.game.sound.play('game_audio', 0.4, false /* no looping, we get to the end when it's done */);
        this.audio.onStop.addOnce(() => this.game.state.start('EndState'), this);

        this.audio.onDecoded.addOnce(this._initBoard, this);

        this.metronome = new Metronome('metronome', this.game, this.audio, this.game.world.centerX, this.game.world.centerY + 200, 200, 30, this.BPM, { weak: 0.2, good: 0.1, great: 0.05 });
        this.metronome.beat.add(this._beat, this);

        this.thresholds = {
            great: this.metronome.quarterNote * 0.05, // +/- 5%, ex: BPM=60s, quarterNote=1000ms, great = press > 900 || press < 100
            good: this.metronome.quarterNote * 0.1,
            weak: this.metronome.quarterNote * 0.2
        };

        this.acceleration = 0;
        this.counter = 0;

        this.game.input.keyboard.addKeyCapture([Phaser.Keyboard.C, Phaser.Keyboard.A]);
        this.game.input.keyboard.addKey(Phaser.Keyboard.C).onDown.add(this._check, this);
        this.game.input.onTap.add(this._checkTap, this);
        this.accelerateKey = this.game.input.keyboard.addKey(Phaser.Keyboard.A);

        this.starfield.create();

        this.metronome.create();

        this.loading = text(this.game, 'loading...', this.game.world.centerX, this.game.world.centerY, { fill: '#FFF' });

        const ct = new ColoredText(this.game, 800, this.game.world.height - 130, `{#fff}Tap the {#99F}blue{#fff} marker\nwhen it's on the {#ff0}yellow{#fff} marker\nto {#f00}attack`, { font: 'bold 18px Courier New', align: 'center' })
        ct.anchor.x = 0.5;

        this.game.add.tween(ct).to({ x: this.game.world.centerX }, 2000, Phaser.Easing.Bounce.Out, true, 0, 0);
        this.game.add.tween(ct).to({ alpha: 0 }, 2000, null, true, 7000, 0)
            .onComplete.add(() => ct.kill());
    }

    update() {
        if (!this.ready) {
            return;
        }

        this.game.physics.arcade.collide(this.ennemy.sprite, this.weapon.bullets, this._damageEnnemy, null, this);
        this.game.physics.arcade.collide(this.player.sprite, this.ennemyWeapon.bullets, this._damagePlayer, null, this);

        this.ennemyHealth.width = (this.ennemy.stats.health / this.ennemy.stats.maxHealth) * this.game.world.width;
        this.ennemyHealthBar.updateCrop();

        this.playerHealth.width = (this.player.stats.health / this.player.stats.maxHealth) * this.game.world.width;
        this.playerHealthBar.updateCrop();
    }

    render() {
        if (!this.ready) {
            this.starfield.render();
            return;
        }

        if (this.player && this.player.dead) {
            this.game.add.tween(this.audio).to({ volume: 0 }, 1000, null, true, 0, 0)
                .onComplete.add(() => {
                    this.ennemy.kill();
                    this.audio.stop();
                }, this);
        }

        if (!this.audio.isDecoded) {
            return;
        } else {
            this.loading.visible = false;
        }

        // this.game.debug.text(`${this.player.stats.xp} xp`, 20, 40, '#0F0');
        // this.game.debug.text(`${this.player.stats.coins} coins`, 20, 60, '#0FF');
        // this.game.debug.text(`${this.player.stats.health} health`, 20, 80, '#F88');

        if (this.ennemy.ready && !this.ennemy.dead) {
            this.attackTimer.visible = true;
            this.attackTimer.x = this.ennemy.sprite.x;
            this.attackTimer.y = this.ennemy.sprite.y - 20;
            this.attackTimer.width = (this.nextAttack - this.game.time.now) / this.ennemy.stats.attackSpeed * 100;
        } else {
            this.attackTimer.visible = false;
        }

        if (this.nextAttack <= this.game.time.now) {
            this._attack();
            this.nextAttack = this.game.time.now + this.ennemy.stats.attackSpeed;
        }

        if (this.ennemy.dead && !this.accelerate) {
            this.accelerate = true;
            this.metronome.disable();
            this.nextAttack = null;
            this.counter = 0;
            this.currentCombo = null;
            this.game.add.tween(this).to({ acceleration: 0.3 }, 3000, null, true, 0, 0)
                .onComplete.add(() => {
                    this.accelerate = false;
                    this._spawnEnnemy();
                });
        }

        if (this.accelerateKey.isDown || this.accelerate) {
            this.acceleration += 0.001;
        } else if (this.starfield.speed > 1) {
            this.acceleration = -0.05;
        } else {
            this.acceleration = 0;
            this.starfield.speed = 1;
        }

        this.starfield.accelerate(this.acceleration);
        this.starfield.render();

        this.metronome.render();

        if (this.ennemy.render) {
            this.ennemy.render();
        }

        // this.game.debug.body(this.player.sprite);
        // this.game.debug.body(this.ennemy.sprite);
    }

    _initBoard() {
        // player health
        const playerHealth = 50;
        this.player = new Player('player', this.game, -100, this.shipPosition, 1, 'player', { health: playerHealth, damage: 5, maxHealth: playerHealth });
        this.player.create();

        this._spawnEnnemy();

        this.weapon = this.game.add.weapon(30, 'laser');
        this.weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
        this.weapon.bulletAngleOffset = 90;
        this.weapon.bulletSpeed = 400;
        this.weapon.fireRate = this.quarterNote;
        this.weapon.bulletRotateToVelocity = true;

        this.ennemyWeapon = this.game.add.weapon(30, 'laser');
        this.ennemyWeapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
        this.ennemyWeapon.bulletAngleOffset = 90;
        this.ennemyWeapon.bulletSpeed = 400;
        this.ennemyWeapon.fireRate = this.quarterNote;
        this.ennemyWeapon.bulletRotateToVelocity = true;

        this.game.physics.arcade.enable(this.player.sprite);
        this.player.sprite.body.allowGravity = false;
        this.player.sprite.body.immovable = true;

        this.ennemyHealthBar = this.game.add.sprite(0, this.shipPosition + 150, 'healthbar');
        this.ennemyHealthBar.x = this.game.world.centerX - (this.ennemyHealthBar.width / 2);

        this.ennemyHealth = new Phaser.Rectangle(0, 0, this.ennemyHealthBar.width, this.ennemyHealthBar.height);
        this.ennemyHealthBar.crop(this.ennemyHealth);

        this.playerHealthBar = this.game.add.sprite(0, 20, 'player_healthbar');
        this.playerHealthBar.x = this.game.world.centerX - (this.playerHealthBar.width / 2);

        this.playerHealth = new Phaser.Rectangle(0, 0, this.playerHealthBar.width, this.playerHealthBar.height);
        this.playerHealthBar.crop(this.playerHealth);

        const g = new Phaser.Graphics(0, 0);
        g.lineStyle(4, 0xFF0000);
        g.moveTo(0, 0);
        g.lineTo(100, 0);

        this.attackTimer = this.game.add.sprite(this.ennemy.sprite.x, this.ennemy.sprite.y - 20, g.generateTexture());

        this.ready = true;
    }

    _checkTap() {
        this._check(null, 150);
    }

    _check(e, delay = 50) {
        if (!this.ennemy.ready || this.ennemy.dead) return;

        const timeLeft = this.metronome.untilNextBeat + this.metronome.bnb + delay; // +50ms for synchronisation? That's just for me though... need to adjust per player

        let failed = false;
        if (timeLeft > (this.metronome.quarterNote - this.thresholds.great) || timeLeft < this.thresholds.great) {
            this._resetOrAddToCurrentCombo(GameState.Combos.GREAT);
            this.game.sound.play('laser', 0.2);

            if (this.nextAttack) this.nextAttack += 200;

            config.great = (config.great || 1) + 1;
        } else if (timeLeft > (this.metronome.quarterNote - this.thresholds.good) || timeLeft < this.thresholds.good) {
            this._resetOrAddToCurrentCombo(GameState.Combos.GOOD);
            this.game.sound.play('laser-good', 0.2);
            config.good = (config.good || 1) + 1;
        } else if (timeLeft > (this.metronome.quarterNote - this.thresholds.weak) || timeLeft < this.thresholds.weak) {
            this._resetOrAddToCurrentCombo(GameState.Combos.WEAK);
            this.game.sound.play('laser-weak', 0.2);
            config.weak = (config.weak || 1) + 1;
        } else {
            this._resetOrAddToCurrentCombo(GameState.Combos.FAILED);

            if (this.nextAttack) this.nextAttack -= 500;

            if (this.ennemy instanceof Crate) {
                this.game.sound.play('laser-weak', 0.2);
            } else {
                this.game.sound.play('error', 0.2);
            }

            config.fail = (config.fail || 1) + 1;
        }

        if (this.ennemy instanceof Crate || !_.isEqual(this.currentCombo, GameState.Combos.FAILED)) {
            const p = new Phaser.Point(this.player.sprite.x + this.player.sprite.width, this.player.sprite.y + (this.player.sprite.height / 2 - 5));
            this.weapon.fire(p, this.ennemy.sprite.x + this.ennemy.sprite.width, this.ennemy.sprite.y + (this.ennemy.sprite.height / 2));
        }

        const t = text(this.game, `${this.currentCombo.text}`, this.game.world.centerX, this.game.world.centerY - 200, { font: 'bold 45px Courier New', fill: `rgba(${this.currentCombo.color}, 1)` });
        this.game.add.tween(t).to({ y: t.y - 50, alpha: 0 }, 1000, Phaser.Easing.Sinusoidal.Out, true, 0, 0, false)
            .onComplete.add(() => t.kill());

        this.game.add.tween(t.scale).to({ x: 1 + this.currentCombo.multiplier, y: 1 + this.currentCombo.multiplier }, 1000, Phaser.Easing.Sinusoidal.Out, true, 0, 0, false)
    }

    _damageEnnemy(ennemy, bullet) {
        this.shoot.dispatch({
            combo: this.currentCombo,
            counter: this.counter,
            shooter: this.player
        });

        bullet.kill();
    }

    _damagePlayer(player, bullet) {
        this.player.hit(this.ennemy.stats.damage);
        this.game.camera.shake(0.005);
        bullet.kill();
    }

    _resetOrAddToCurrentCombo(combo) {
        // if (this.alreadyCounted || _.isEqual(combo, GameState.Combos.FAILED)) {
        //     this.counter = 0;
        //     this.currentCombo = GameState.Combos.FAILED;
        //     // this.game.camera.shake(0.01);
        // } else {
        this.alreadyCounted = true;

        this.currentCombo = combo;
        this.counter += this.currentCombo.multiplier;
        // }
    }

    _beat() {
        this.alreadyCounted = false;
    }

    _spawnEnnemy() {
        this.chance = (this.chance || 105) - 5;
        this.objectCounts++;
        if (this.objectCounts != 2 && (Math.chanceRoll(this.chance) || this.objectCounts == 1)) {
            const asset = `ennemy${Math.rnd(1, 3)}`;

            const health = Math.rnd(50, 70);
            const damage = Math.floor(1 + this.objectCounts);
            this.ennemy = new Ennemy('ennemy', this.game, 512, this.shipPosition, -1, asset, { health, damage: damage, maxHealth: health });
            this.ennemy.onReady.addOnce(() => this.nextAttack = this.game.time.now + this.ennemy.stats.attackSpeed);

        } else {
            this.chance = null;
            this.ennemy = new Crate('crate', this.game, 512, this.shipPosition, -1, 'box');
            this.nextAttack = null;
        }

        this.ennemy.onReady.add(this.metronome.enable, this.metronome);
        this.ennemy.create();

        this.game.physics.arcade.enable(this.ennemy.sprite);
        this.ennemy.sprite.body.allowGravity = false;
        this.ennemy.sprite.body.immovable = true;
    }

    _attack() {
        if (this.ennemy.ready && !this.ennemy.dead) {
            const p = new Phaser.Point(this.ennemy.sprite.x + 10, this.ennemy.sprite.y + (this.ennemy.sprite.height / 2));
            this.ennemyWeapon.fire(p, this.player.sprite.x, this.player.sprite.y + (this.player.sprite.height / 2));
            this.game.sound.play('laser', 0.2);
        }
    }
}

