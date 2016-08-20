import _ from 'lodash';
import Player from '../objects/Player';
import Ennemy from '../objects/Ennemy';
import Starfield from '../objects/Starfield';
import Planet from '../objects/Planet';
import Metronome from '../objects/Metronome';
import Crate from '../objects/Crate';
import { config } from './StateConfig';
import { text } from '../helpers/Helpers';

export default class GameState extends Phaser.State {

    static get MINUTE_IN_MS() {
        return 60000;
    }

    static get Combos() {
        return {
            GREAT: { text: 'Great', color: '255, 128, 0', multiplier: 1 },
            GOOD: { text: 'Good', color: '50, 200, 50', multiplier: 0.5 },
            WEAK: { text: 'Weak', color: '128, 128, 128', multiplier: 0.1 },
            FAILED: { text: 'FAILED!', color: '255, 0, 0', multiplier: 0 }
        };
    }

    constructor() {
        super();

        this.shoot = new Phaser.Signal();
    }

    preload() {
        this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL

        this.BPM = 175;
        this.shipPosition = 300;
        //this.BPM = 87.5;

        this.starfield = new Starfield('starfield', this.game, 300, this.game.scale.width, this.game.scale.height);
        this.starfield.preload();

        this.planet = new Planet('sun', this.game, 250, 200, 'assets/sun.svg');
        this.planet.preload();

        this.game.load.image('player', 'assets/player.svg');
        this.game.load.image('ennemy1', 'assets/ennemy1.svg');
        this.game.load.image('ennemy2', 'assets/ennemy2.svg');
        this.game.load.image('ennemy3', 'assets/ennemy3.svg');
        this.game.load.image('box', 'assets/box.svg');
        this.game.load.image('tech', 'assets/tech.svg');
        this.game.load.image('laser', 'assets/laser.png');
        this.game.load.audio('game_audio', 'assets/dnd3-3.ogg');
    }

    create() {
        this.audio = this.game.sound.play('game_audio');
        this.audio.mute = !config.soundOn;

        this.metronome = new Metronome('metronome', this.game, this.audio, 250, 700, 200, 30, this.BPM, { weak: 0.2, good: 0.1, great: 0.05 });
        this.metronome.beat.add(this._beat, this);

        this.thresholds = {
            great: this.metronome.quarterNote * 0.05, // +/- 5%, ex: BPM=60s, quarterNote=1000ms, great = press > 900 || press < 100
            good: this.metronome.quarterNote * 0.1,
            weak: this.metronome.quarterNote * 0.2
        };

        this.acceleration = 0;

        this.color = 0.0;
        this.colorDecay = 0.01;
        this.counter = 0;

        this.game.input.keyboard.addKeyCapture([Phaser.Keyboard.C, Phaser.Keyboard.A]);
        this.game.input.keyboard.addKey(Phaser.Keyboard.C).onDown.add(this._check, this);
        this.game.input.onTap.add(this._checkTap, this);
        this.accelerateKey = this.game.input.keyboard.addKey(Phaser.Keyboard.A);

        this.starfield.create();

        this.metronome.create();

        this._spawnEnnemy();

        this.player = new Player('player', this.game, -170, this.shipPosition, 1, 'player', { health: 20, damage: 1 });
        this.player.create();

        this.weapon = this.game.add.weapon(30, 'laser');
        this.weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
        this.weapon.bulletAngleOffset = 90;
        this.weapon.bulletSpeed = 400;
        this.weapon.fireRate = this.quarterNote;
        this.weapon.bulletRotateToVelocity = true;

        this.loading = text(this.game, 'loading...', this.game.world.centerX, this.game.world.centerY, { fill: '#FFF' });
    }

    render() {
        if (!this.audio.isDecoded) {
            this.starfield.render();
            return;
        } else {
            this.loading.visible = false;
        }

        // this.game.debug.text(`${this.player.stats.xp} xp`, 20, 40, '#0F0');
        // this.game.debug.text(`${this.player.stats.coins} coins`, 20, 60, '#0FF');
        // this.game.debug.text(`${this.player.stats.health} health`, 20, 80, '#F88');

        // if (this.nextAttack > this.game.time.now) {
        //     this.game.debug.text(`${this.nextAttack - this.game.time.now}ms`, 400, 250, '#FF0');
        // }

        if (this.currentCombo || this.decaying) {
            this.decaying = true;
            this.color -= this.colorDecay;

            if (this.color <= 0) {
                this.counter = 0;
                this.color = 0;
                this.currentCombo = null;
                this.decaying = false;
            }
        }

        if (this.nextAttack <= this.game.time.now) {
            this._attack();
            this.nextAttack = this.game.time.now + this.ennemy.stats.attackSpeed;
        }

        if (this.ennemy.dead && !this.accelerate) {
            this.accelerate = true;
            this.metronome.disable();
            this.nextAttack = null;
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
        } else if (timeLeft > (this.metronome.quarterNote - this.thresholds.good) || timeLeft < this.thresholds.good) {
            this._resetOrAddToCurrentCombo(GameState.Combos.GOOD);
        } else if (timeLeft > (this.metronome.quarterNote - this.thresholds.weak) || timeLeft < this.thresholds.weak) {
            this._resetOrAddToCurrentCombo(GameState.Combos.WEAK);
        } else {
            this._resetOrAddToCurrentCombo(GameState.Combos.FAILED);

            if (this.nextAttack) this.nextAttack -= 500;
        }

        const p = new Phaser.Point(this.player.sprite.x + 115, this.player.sprite.y + 41);
        this.weapon.fire(p, this.ennemy.sprite.x + 50, this.ennemy.sprite.y + 50);

        const t = text(this.game, `${this.currentCombo.text}!`, this.game.world.centerX, this.game.world.centerY + 200, { font: 'bold 45px Lucida Console', fill: `rgba(${this.currentCombo.color}, 1)` });
        this.game.add.tween(t).to({ y: t.y - 50, alpha: 0 }, 1000, Phaser.Easing.Sinusoidal.Out, true, 0, 0, false)
            .onComplete.add(() => t.kill());

        this.game.add.tween(t.scale).to({ x: 1 + this.currentCombo.multiplier, y: 1 + this.currentCombo.multiplier }, 1000, Phaser.Easing.Sinusoidal.Out, true, 0, 0, false)

        this.shoot.dispatch({
            combo: this.currentCombo,
            counter: this.counter,
            shooter: this.player
        });
    }

    _resetOrAddToCurrentCombo(combo) {
        this.color = 1.0;

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
        if (Math.chanceRoll(80)) {
            const asset = `ennemy${Math.rnd(1, 3)}`;

            const health = Math.rnd(5, 10);
            this.ennemy = new Ennemy('ennemy', this.game, 500, this.shipPosition, -1, asset, { health, damage: 1 });

            this.nextAttack = this.game.time.now + this.ennemy.stats.attackSpeed;
        } else {
            this.ennemy = new Crate('crate', this.game, 500, this.shipPosition, -1, 'box');
        }

        this.ennemy.onReady.add(this.metronome.enable, this.metronome);
        this.ennemy.create();
    }

    _attack() {
        if (this.ennemy.ready && !this.ennemy.dead) {
            this.player.hit(this.ennemy.stats.damage);
            this.game.camera.shake(0.001 * (this.player.stats.maxHealth - this.player.stats.health));
        }
    }
}

