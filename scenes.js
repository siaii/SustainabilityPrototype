class GameState extends Phaser.Plugins.BasePlugin{
    constructor(pluginManager) {
        super(pluginManager);
    }

    start(){
        super.start();
        this.pollutionPerTick = 0.05;
        this.globalPollution = 40;
    }

    getPollutionPerTick(){
        return this.pollutionPerTick;
    }

    getGlobalPollution(){
        return this.globalPollution;
    }

}

//Main scene
class SceneA extends Phaser.Scene {
    constructor() {
        super('sceneA');
    }

    preload(){
        //Load assets
        this.load.image('greenRectNormal', 'assets/greenRectNormal.png');
        this.load.image('greenRectTapped', 'assets/greenRectTapped.png');
        this.load.image('cornerSquare', 'assets/cornerSquare.png');
        this.load.image('backBtn', 'assets/backBtn.png');
    }

    create(){
        let self = this;
        //Create new instances of UI elements
        this.button = new buttonBase(self, 360, 1150, 'greenRectNormal', 'greenRectTapped',
            'Policies', '#FFFFFF', 1, 0.75, 2);
        this.pollutionBar = new progressBarBase(self, 100, 1000, 'cornerSquare', 0xa36643, 2);
        this.happinessBar = new progressBarBase(self, 620, 1000, 'cornerSquare', 0x00ff00, 2);
        //Set the function to run when button is pressed, along with the args (using ...args)
        this.button.setDownFunction(this.loadSceneB, self);


    }

    update(){
        if(this.gamestate.globalPollution<=100){
            this.updatePollution();
        }
    }

    updateBar(args){
        //need to match the args order when setting button's down function
        args[0].setProgress(args[1]);
    }

    loadSceneB(args){
        let self = args[0]
        self.scene.start('sceneB');
    }

    updatePollution(){
        this.gamestate.globalPollution+=(this.gamestate.pollutionPerTick);
        this.pollutionBar.setProgress(this.gamestate.globalPollution);
    }
}

class SceneB extends Phaser.Scene{
    constructor() {
        super('sceneB');
    }

    preload(){

    }

    create(){
        let self = this;
        let backButton = new buttonBase(self, 50, 50, 'backBtn', 'backBtn', "", '#FFFFFF', 0.25, 0.25);
        backButton.setDownFunction(function(){
            self.scene.start('sceneA');
        });

        let addEnergyTaxButton = new buttonBase(self, 200, 200, 'greenRectNormal',
            'greenRectTapped', "Add Energy Tax", '#FFFFFF',  0.9, 0.75, 1.2);
        let addCleanEnergySubsidyButton = new buttonBase(self, 200, 350,
            'greenRectNormal', 'greenRectTapped', "Add Clean Energy Subsidy", '#FFFFFF', 0.9, 0.75, 1.2);
        let promoteElectricVehicle = new buttonBase(self, 200, 500, 'greenRectNormal',
            'greenRectTapped', "Subsidy Electric Vehicle", '#FFFFFF', 0.9, 0.75, 1.2)
    }

    update(){

    }
}