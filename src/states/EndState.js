import { config } from './StateConfig';
import { text } from '../helpers/Helpers';
import ColoredText from '../objects/ColoredText';

export default class EndState extends Phaser.State {
    create() {
        text(this.game, 'game\nover', this.game.world.centerX, this.game.world.centerY - 200, { font: "60px Courier New", fill: "#FF3333" });

        const great = (config.great || 0) * 20;
        const good = (config.good || 0) * 5;
        const weak = (config.weak || 0) * 1;
        const fail = (config.fail || 0) * -2;

        const total = great + good + weak + fail;

        const scores = `greats...${(config.great || 0).pad(4, '.')} [{#f80}${(great).pad(7)}{#ccc}]\n` +
            `goods....${(config.good || 0).pad(4, '.')} [{#0f0}${(good).pad(7)}{#ccc}]\n` +
            `weaks....${(config.weak || 0).pad(4, '.')} [{#888}${(weak).pad(7)}{#ccc}]\n` +
            `fails....${(config.fail || 0).pad(4, '.')} [{#f00}${(fail).pad(7)}{#ccc}]\n` +
            `\n` +
            `total........[{#f80}${(total).pad(8)}{#ccc}]\n` +
            ``;

        // text(this.game, scores, this.game.world.centerX, this.game.world.centerY, { font: "24px Courier New", fill: "#F80", align: 'left' });
        const scoresText = new ColoredText(this.game, this.game.world.centerX, this.game.world.centerY, scores, { font: '24px Courier New', fill: '#CCC', align: 'left' });
        scoresText.anchor.x = 0.5;

        this.game.input.onTap.add(() => {
            this.game.state.start('MenuState');
            scoresText.kill();
        }, this);
    }
}
