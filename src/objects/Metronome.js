export default class Metronome {
    static get MINUTE_IN_MILLISECONDS() {
        return 60000;
    }

    constructor(name, game, x, y, w, h, bpm, difficulties) {
        this.name = name;
        this.game = game;
        this.x = x - (w / 2);
        this.y = y - (h / 2);
        this.w = w;
        this.h = h;
        this.bpm = bpm;
        this.difficulties = difficulties;
    }

    get quarterNote() {
        return Metronome.MINUTE_IN_MILLISECONDS / this.bpm;
    }

    preload() {

    }

    create() {
        const difficultiesMap = this.game.add.bitmapData(this.w - 10, this.h);

        const grd = difficultiesMap.context.createLinearGradient(0, 5, this.w, this.h - 10);
        grd.addColorStop(0, '#0F0');
        grd.addColorStop(0.15, '#F80');
        grd.addColorStop(0.35, '#F00');

        grd.addColorStop(0.65, '#F00');
        grd.addColorStop(0.85, '#F80');
        grd.addColorStop(1, '#0F0');

        difficultiesMap.context.fillStyle = grd;
        difficultiesMap.context.fillRect(0, 5, this.w, this.h - 10);

        this.difficultyMap = this.game.add.sprite(this.x + 10, this.y, difficultiesMap);

        this.bar = this.game.add.graphics(this.x, this.y);
        this.bar.lineStyle(2, 0xFFFFFF);
        this.bar.drawRect(10, 5, this.w - 10, this.h - 10);

        const pendulum = new Phaser.Graphics(0, 0);
        pendulum.lineStyle(1, 0xFFFFFF);
        pendulum.beginFill(0xFFFFFF);
        pendulum.drawRect(0, 0, 20, this.h);
        pendulum.endFill();

        this.pendulum = this.game.add.sprite(this.x, this.y, pendulum.generateTexture());

        this.pendulumTargetRight = (this.x + this.w) - 10; // center of pendulum
        this.pendulumTargetLeft = this.x;
        this.pendulumTarget = this.pendulumTargetRight;

        this._changeAlpha(0);
    }

    render() {
        // todo: will this.game.time.events.duration always be the same? What about other timers?
        this.pendulum.x += ((this.pendulumTarget - this.pendulum.x) / this.game.time.events.duration) * this.game.time.elapsed;

        if (this.pendulum.x >= this.pendulumTargetRight) {
            this.pendulum.x = this.pendulumTargetRight;
            this.pendulumTarget = this.pendulumTargetLeft;
        } else if (this.pendulum.x <= this.pendulumTargetLeft) {
            this.pendulum.x = this.pendulumTargetLeft;
            this.pendulumTarget = this.pendulumTargetRight;
        }
    }

    disable() {
        this._changeAlpha(0);
    }

    enable() {
        this._changeAlpha(1);
    }

    _changeAlpha(alpha) {
        //this.game.add.tween(this.bar).to({ alpha: alpha}, ;
        this.bar.alpha = alpha;
        this.difficultyMap.alpha = alpha;
        this.pendulum.alpha = alpha;
    }
}
