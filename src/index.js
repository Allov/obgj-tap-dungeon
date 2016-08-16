import GameState from 'states/GameState';

class Game extends Phaser.Game {

	constructor() {
		super(500, 500, Phaser.AUTO, 'content', null);
		this.state.add('GameState', GameState, false);
		this.state.start('GameState');
	}
}

Math.rnd = (i, j) => {
    return Math.floor(Math.random() * j) + i;
}

Math.chanceRoll = (chance) => {
    if (chance === undefined) { chance = 50; }
    return chance > 0 && (Math.random() * 100 <= chance);
}

new Game();
