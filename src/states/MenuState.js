import { config } from './StateConfig';
import { text } from '../helpers/Helpers';

export default class MenuState extends Phaser.State {
    
    preload() {
        this.game.load.audio('menu_audio', 'assets/hh1.ogg');
    }

    create() {
        this.audio = this.game.sound.play('menu_audio', 1, true);
        this.audio.play();
        
        this.gameTitle = text(this.game, 'space\nbeat', this.game.world.centerX, this.game.world.centerY - 200, { font: "60px Courier New", fill: "#FFBA00" });

        this.playButton = text(this.game, 'play', this.game.world.centerX, this.game.world.centerY, { fill: '#CCC' });
        this.playButton.inputEnabled = true;
        this.playButton.events.onInputUp.add(this.startGame, this);

        this.soundButton = text(this.game, 'sound: ', this.game.world.centerX, this.game.world.centerY + 70, { font: "24px Courier New", fill: "#8af" });
        this._setSoundText();
        this.soundButton.anchor.x = 0.5;
        this.soundButton.inputEnabled = true;
        this.soundButton.events.onInputUp.add(this.toggleSound, this);

        if (this.game.device.desktop) {
            this.fullscreenButton = text(this.game, 'fullscreen', this.game.world.centerX, this.game.world.centerY + 110, { font: "24px Courier New", fill: "#8af" });
            this.fullscreenButton.anchor.x = 0.5;
            this.fullscreenButton.inputEnabled = true;
            this.fullscreenButton.events.onInputUp.add(this.fullscreen, this);
        }
    }

    startGame() {
        this.audio.stop();
        if (!this.game.device.desktop) {
            this.fullscreen();
        }

        this.game.state.start('GameState');
    }

    toggleSound() {
        config.soundOn = !config.soundOn;
        this.audio.mute = !config.soundOn;
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
