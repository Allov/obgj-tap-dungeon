function font(settings) {
    return Object.assign({}, { font: '45px Lucida Console', fill: '#fff', align: 'center' }, settings);
}
exports.font = font;

export function text(game, text, x, y, settings) {
    const t = game.add.text(x, y, text, font(settings));
    t.anchor.x = 0.5;
    return t;
}
