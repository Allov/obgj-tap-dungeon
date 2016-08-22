import { text } from '../helpers/Helpers.js';

export default class Metronome {
    static get MINUTE_IN_MILLISECONDS() {
        return 60000;
    }

    get quarterNote() {
        return Metronome.MINUTE_IN_MILLISECONDS / this.bpm;
    }

    constructor(name, game, audio, x, y, w, h, bpm, difficulties) {
        this.name = name;
        this.game = game;
        this.audio = audio;
        this.x = x - (w / 2);
        this.y = y - (h / 2);
        this.w = w;
        this.h = h;
        this.bpm = bpm;
        this.difficulties = difficulties;

        this.time = 0;
        this.nextBeat = this.quarterNote;
        this.nextBeatAverage = 0;

        this.beat = new Phaser.Signal();
    }

    preload() {

    }

    create() {
        const difficultiesMap = this.game.add.bitmapData(this.w - 10, this.h);

        // const grd = difficultiesMap.context.createLinearGradient(0, 5, this.w, this.h - 10);

        // grd.addColorStop(0, '#F80');
        // grd.addColorStop(0.05, '#F80');

        // grd.addColorStop(0.05, '#0F0');
        // grd.addColorStop(0.1, '#0F0');

        // grd.addColorStop(0.1, '#888');
        // grd.addColorStop(0.2, '#888');

        // grd.addColorStop(0.2, '#F00');
        // grd.addColorStop(0.7, '#F00');

        // grd.addColorStop(0.7, '#888');
        // grd.addColorStop(0.8, '#888');

        // grd.addColorStop(0.8, '#0F0');
        // grd.addColorStop(0.9, '#0F0');

        // grd.addColorStop(0.9, '#F80');
        // grd.addColorStop(0.95, '#F80');

        // difficultiesMap.context.fillStyle = grd;
        // difficultiesMap.context.fillRect(0, 5, this.w - 10, this.h - 10);

        // this.difficultiesMap = new Phaser.Graphics(0, 0);

        // const w = this.w - 10;

        // this.difficultiesMap.beginFill(0xFF8800);
        // this.difficultiesMap.drawRect(0, 5, w * 0.05, this.h - 10);
        // this.difficultiesMap.endFill();

        // this.difficultiesMap.beginFill(0x00FF00);
        // this.difficultiesMap.drawRect(w * 0.05, 5, w * 0.1, this.h - 10);
        // this.difficultiesMap.endFill();

        // this.difficultiesMap.beginFill(0x888888);
        // this.difficultiesMap.drawRect(w * 0.1, 5, w * 0.2, this.h - 10);
        // this.difficultiesMap.endFill();

        // this.difficultiesMap.beginFill(0xFF0000);
        // this.difficultiesMap.drawRect(w * 0.2, 5, w * 0.3, this.h - 10);
        // this.difficultiesMap.endFill();

        // this.difficultiesMap.beginFill(0x888888);
        // this.difficultiesMap.drawRect(w * 0.8, 5, w * 0.1, this.h - 10);
        // this.difficultiesMap.endFill();

        // this.difficultiesMap.beginFill(0x00FF00);
        // this.difficultiesMap.drawRect(w * 0.9, 5, w * 0.05, this.h - 10);
        // this.difficultiesMap.endFill();

        // this.difficultiesMap.beginFill(0xFF8800);
        // this.difficultiesMap.drawRect(w * 0.95, 5, w, this.h - 10);
        // this.difficultiesMap.endFill();

        this.group = this.game.add.group();
        this.difficultyMap = this.group.create(this.x + 10, this.y, this.difficultiesMap);

        const bar = new Phaser.Graphics(0, 0);
        bar.lineStyle(2, 0xFFFF00);
        //bar.drawRect(0, 0, this.w - 10, this.h - 10);
        bar.beginFill(0xAAAA00);
        bar.drawRect(0, 0, 28, this.h);
        bar.drawRect(this.w - 28, 0, 28, this.h);
        bar.endFill();

        this.bar = this.group.create(this.x-2, this.y-2, bar.generateTexture());

        const pendulum = new Phaser.Graphics(0, 0);
        pendulum.lineStyle(1, 0x8888FF);
        pendulum.beginFill(0x8888FF);
        pendulum.drawRect(0, 0, 20, this.h);
        pendulum.endFill();

        this.pendulum = this.group.create(this.x, this.y, pendulum.generateTexture());

        this.pendulumTargetRight = (this.x + this.w) - 10; // center of pendulum
        this.pendulumTargetLeft = this.x;
        this.pendulumTarget = this.pendulumTargetRight;

        this.time = 0;
        this.lastReported = this.time;

        if (this.audio.isPlaying) {
            this._play();
        } else {
            this.audio.onPlay.add(this._play, this);
        }

        this.group.alpha = 0;
    }

    render() {
        if (!this.audio.isPlaying) {
            return;
        }

        this.untilNextBeat = this.nextBeat - this.time;
        this.time += this.game.time.elapsed;

        this.pendulum.x += ((this.pendulumTarget - this.pendulum.x) / this.untilNextBeat) * this.game.time.elapsed;

        // this.game.debug.text(`x: ${this.bnb}`, 100, 300);

        if (this.pendulum.x >= this.pendulumTargetRight) {
            this.pendulum.x = this.pendulumTargetRight;
            this.pendulumTarget = this.pendulumTargetLeft;
        } else if (this.pendulum.x <= this.pendulumTargetLeft) {
            this.pendulum.x = this.pendulumTargetLeft;
            this.pendulumTarget = this.pendulumTargetRight;
        }

        // this.game.debug.text(`ct: ${this.audio.currentTime.toFixed(0)}, lr: ${this.lastReported.toFixed(0)}, d: ${(this.audio.currentTime - this.lastReported).toFixed()}`, 100, 300);

        // https://www.reddit.com/r/gamedev/comments/13y26t/how_do_rhythm_games_stay_in_sync_with_the_music/
        if (this.audio.currentTime != this.lastReported) {
            this.time = (this.audio.currentTime + this.time) / 2;
            this.lastReported = this.audio.currentTime;
        }

        if (this.time >= this.nextBeat) {
            const delta = this.time - this.nextBeat;
            this.beat.dispatch(this, delta);

            this.bnb = this.untilNextBeat;

            this.nextBeat = this.beats[Math.ceil(this.time / this.quarterNote)];
        }

    }

    disable() {
        //this.game.add.tween(this.group).to({ alpha: 0 }, 1000, null, true, 0, 0, false);
        this.game.add.tween(this.group).to({ alpha: 0 }, 1000, Phaser.Easing.Sinusoidal.Out, true, 0, 0, false)
    }

    enable() {
        this.game.add.tween(this.group).to({ alpha: 1 }, 1000, Phaser.Easing.Sinusoidal.Out, true, 0, 0, false)
    }

    _play() {
        this.beats = [];
        for(let i = 0; i < this.audio.durationMS; i = i + this.quarterNote) {
            this.beats.push(i);
        }

        this.time = this.audio.currentTime;
    }
}
