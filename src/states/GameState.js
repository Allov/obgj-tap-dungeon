import _ from 'lodash';
import Ship from '../objects/Ship';
import Starfield from '../objects/Starfield';
import Planet from '../objects/Planet';

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

    preload() {
        this.ennemy = new Ship('ennemy', this.game, 500, 100, -1, 'assets/ennemy.svg');
        this.ennemy.preload();

        this.player = new Ship('player', this.game, -170, 100, 1, 'assets/player.svg');
        this.player.preload();

        this.starfield = new Starfield('starfield', this.game, 300, 500, 500);
        this.starfield.preload();

        this.planet = new Planet('sun', this.game, 250, 200, 'assets/sun.svg');
        this.planet.preload();
    }

    create() {
        this.lastTime = Date.now();
        this.BPM = 60;
        this.quarterNote = GameState.MINUTE_IN_MS / this.BPM;

        this.thresholds = {
            great: this.quarterNote * 0.05, // +/- 5%, ex: BPM=60s, quarterNote=1000ms, great = press > 900 || press < 100
            good: this.quarterNote * 0.1,
            weak: this.quarterNote * 0.2
        };

        this.circle = this.game.add.graphics(0, 0);
        this.diameter = 100;
        this.decay = 1;

        this.acceleration = 0;

        this.color = 0.0;
        this.colorDecay = 0.01;
        this.counter = 0;

        this.game.input.keyboard.addKeyCapture([Phaser.Keyboard.C, Phaser.Keyboard.A]);
        this.game.input.keyboard.addKey(Phaser.Keyboard.C).onDown.add(this.check, this);
        this.accelerateKey = this.game.input.keyboard.addKey(Phaser.Keyboard.A);

        this.game.time.events.loop(this.quarterNote, this.beat, this);

        this.starfield.create();
        this.ennemy.create();
        this.player.create();
        // this.planet.create();
    }

    check() {
        if (!this.ennemy.ready || this.ennemy.dead) return;

        const timeLeft = this.game.time.events.duration.toFixed(0);
        if (timeLeft > (this.quarterNote - this.thresholds.great) || timeLeft < this.thresholds.great) {
            this.resetOrAddToCurrentCombo(GameState.Combos.GREAT);
        } else if (timeLeft > (this.quarterNote - this.thresholds.good) || timeLeft < this.thresholds.good) {
            this.resetOrAddToCurrentCombo(GameState.Combos.GOOD);
        } else if (timeLeft > (this.quarterNote - this.thresholds.weak) || timeLeft < this.thresholds.weak) {
            this.resetOrAddToCurrentCombo(GameState.Combos.WEAK);
        } else {
            this.resetOrAddToCurrentCombo(GameState.Combos.FAILED);
        }

        this.ennemy.hit(1 * this.counter);
    }

    resetOrAddToCurrentCombo(combo) {
        this.color = 1.0;

        if (this.alreadyCounted || _.isEqual(combo, GameState.Combos.FAILED)) {
            this.counter = 0;
            this.currentCombo = GameState.Combos.FAILED;
        } else {
            this.alreadyCounted = true;

            this.currentCombo = combo;
            this.counter += this.currentCombo.multiplier;
        }
    }

    beat() {
        this.alreadyCounted = false;
        const time = Date.now();
        const elapsed = time - this.lastTime;
        this.lastTime = time;

        const leftTime = this.quarterNote - elapsed;

        if (leftTime > 0) {
            this.diameter = 100 + (leftTime / (1000 / 60)) * this.decay;
        } else {
            this.diameter = 100 - (leftTime / (1000 / 60)) * this.decay;
        }
    }

    render() {
        const timeLeft = this.game.time.events.duration.toFixed(0);
        this.game.debug.text(`Clicked: ${this.input.activePointer.leftButton.isDown}`, 20, 20);
        this.game.debug.text(`Time until next beat: ${timeLeft}`, 20, 40);
        this.circle.clear();
        this.circle.beginFill(0xFF0000, 1);
        this.diameter -= this.decay;
        this.circle.drawCircle(250, 250, this.diameter);

        if (this.currentCombo || this.decaying) {
            this.game.debug.text(`${this.currentCombo.text}! ${this.counter}x`, 200, 200, `rgba(${this.currentCombo.color}, ${this.color})`);
            this.decaying = true;
            this.color -= this.colorDecay;

            if (this.color <= 0) {
                this.counter = 0;
                this.color = 0;
                this.currentCombo = null;
                this.decaying = false;
            }
        }

        if (this.ennemy.dead && !this.accelerate) {
            this.accelerate = true;
            this.game.add.tween(this).to({ acceleration: 0.3 }, 3000, null, true, 0, 0)
                .onComplete.add(() => {
                    this.accelerate = false;
                    this.ennemy = new Ship('ennemy', this.game, 500, 100, -1, 'assets/ennemy.svg');
                    this.ennemy.preload();
                    this.ennemy.create();
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
    }
}

