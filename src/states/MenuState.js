import { config } from './StateConfig';
import { text } from '../helpers/Helpers';

export default class MenuState extends Phaser.State {

    create() {
        this.gameTitle = text(this.game, 'space\nbeat', this.game.world.centerX, this.game.world.centerY - 200, { font: "60px Lucida Console", fill: "#FFBA00" });

        this.playButton = text(this.game, 'play', this.game.world.centerX, this.game.world.centerY, { fill: '#CCC' });
        this.playButton.inputEnabled = true;
        this.playButton.events.onInputUp.add(this.startGame, this);

        this.soundButton = text(this.game, 'sound: ', this.game.world.centerX, this.game.world.centerY + 70, { font: "24px Lucida Console", fill: "#8af" });
        this._setSoundText();
        this.soundButton.anchor.x = 0.5;
        this.soundButton.inputEnabled = true;
        this.soundButton.events.onInputUp.add(this.toggleSound, this);

        if (this.game.device.desktop) {
            this.fullscreenButton = text(this.game, 'fullscreen', this.game.world.centerX, this.game.world.centerY + 110, { font: "24px Lucida Console", fill: "#8af" });
            this.fullscreenButton.anchor.x = 0.5;
            this.fullscreenButton.inputEnabled = true;
            this.fullscreenButton.events.onInputUp.add(this.fullscreen, this);
        }
    }

    startGame() {
        if (!this.game.device.desktop) {
            this.fullscreen();
        }

        this.game.state.start('GameState');
    }

    toggleSound() {
        config.soundOn = !config.soundOn;
        this._setSoundText();
    }

    fullscreen() {
        if (this.game.scale.isFullScreen) {
            this.game.scale.stopFullScreen();
        } else {
            this.game.scale.startFullScreen(false);
        }
    }

    _setSoundText() {
        this.soundButton.text = `sound: ${config.soundOn ? 'on' : 'off' }`;
    }
}
