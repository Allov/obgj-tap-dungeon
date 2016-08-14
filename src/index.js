import GameState from 'states/GameState';

class Game extends Phaser.Game {

	constructor() {
		super(500, 500, Phaser.AUTO, 'content', null);
		this.state.add('GameState', GameState, false);
		this.state.start('GameState');
	}
}

Math.rnd = (i, j) => {
    return Math.floor(Math.random() *i) + j;
}

new Game();
