import { config } from './StateConfig';
import { text } from '../helpers/Helpers';

export default class EndState extends Phaser.State {
    create() {
        text(this.game, 'game\nover', this.game.world.centerX, this.game.world.centerY - 200, { font: "60px Courier New", fill: "#FF3333" });
        
        this.game.input.onTap.add(() => this.game.state.start('MenuState'), this);
    }
}