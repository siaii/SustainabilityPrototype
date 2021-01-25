var config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'phaser-example',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 720,
        height: 1280,
    },
    backgroundColor: '#AAAAFF',
    scene: [SceneA, SceneB],
    plugins: {
        global: [{key: 'GameState', plugin: GameState, start: true, mapping: 'gamestate'}]
    }
};

var game = new Phaser.Game(config);






