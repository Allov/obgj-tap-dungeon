import GameState from 'states/GameState';
import MenuState from 'states/MenuState';
import EndState from 'states/EndState';

class Game extends Phaser.Game {

	constructor() {
		super(412, 732, Phaser.AUTO, 'content', null);
        this.state.add('MenuState', MenuState, false);
		this.state.add('GameState', GameState, false);
		this.state.add('EndState', EndState, false);
		this.state.start('MenuState');
	}
}

Math.rnd = (i, j) => {
    return Math.floor(Math.random() * j) + i;
}

Math.chanceRoll = (chance) => {
    if (chance === undefined) { chance = 50; }
    return chance > 0 && (Math.random() * 100 <= chance);
}

Number.prototype.pad = function (size, c) {
    let s = String(this);
    while (s.length < (size || 2)) { s = (c || ' ') + s; }
    return s;
}

new Game();
