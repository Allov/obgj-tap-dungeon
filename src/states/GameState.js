import _ from 'lodash';

export default class GameState extends Phaser.State {

    static get MINUTE_IN_MS() { return 60000; }
    static get Combos() {
        return {
            GREAT: { text: 'Great', color: '255, 128, 0', multiplier: 1 },
            GOOD: { text: 'Good', color: '50, 200, 50', multiplier: 0.5 },
            WEAK: { text: 'Weak', color: '128, 128, 128', multiplier: 0.1 },
            FAILED: { text: 'FAILED!', color: '255, 0, 0', multiplier: 0 }
        };
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
	    
	    this.color = 0.0;
	    this.colorDecay = 0.01;
	    this.counter = 0;

        this.game.input.keyboard.addKeyCapture([Phaser.Keyboard.C]);
	    const key = this.game.input.keyboard.addKey(Phaser.Keyboard.C).onDown.add(this.check, this);

	    this.game.time.events.loop(this.quarterNote, this.beat, this);
	}
	
	check() {
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
            this.diameter = 100 + (leftTime / (1000/60)) * this.decay;
        } else {
            this.diameter = 100 - (leftTime / (1000/60)) * this.decay;
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
	        this.onTime = false;
	        this.decaying = true;
	        this.color -= this.colorDecay;
	        
	        if (this.color <= 0) {
	            this.counter = 0;
	            this.color = 0;
	            this.currentCombo = null;
	            this.decaying = false;
	        }
	    }
	}
}