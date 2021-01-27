var config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'phaser-example',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1080,
        height: 1920,
    },
    backgroundColor: '#AAAAFF',
    scene: [SceneA, SceneB],
    plugins: {
        global: [{key: 'GameState', plugin: GameState, start: true, mapping: 'gamestate'}]
    }
};

//Add disable and enable method for phaser's builtin text gameobject
Phaser.GameObjects.Text.prototype.disable = function(){
    this.setActive(false)
    this.setVisible(false);
}

Phaser.GameObjects.Text.prototype.enable = function(){
    this.setActive(true)
    this.setVisible(true);
}
var game = new Phaser.Game(config);






