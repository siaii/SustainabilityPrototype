class GameState extends Phaser.Plugins.BasePlugin{
    constructor(pluginManager) {
        super(pluginManager);
    }

    start(){
        super.start();

        //Placeholder values
        this.pollutionPerTick = 2;
        this.globalPollution = 40;

        this.globalHappiness = 50;
        this.globalPop = 20;

        this.balanceMoney = 60;
        this.moneyPerTick = 4;

        this.coalPlants = new PowerPlant("Coal", 10, 10);
    }


    getPollutionPerTick(){
        return this.pollutionPerTick;
    }

    getGlobalPollution(){
        return this.globalPollution;
    }

    /**
     * @param {String} newBuilding
     */
    addBuilding(newBuilding){
        switch(newBuilding.toLowerCase()){
            case "coal":
                this.coalPlants.createBuilding();
                break;
        }
    }

    /**
     * @param {String} toBeRemoved
     */
    removeBuilding(toBeRemoved){
        switch(toBeRemoved.toLowerCase()){
            case "coal":
                this.coalPlants.destroyBuilding();
                break;
        }
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
        this.actionButton = new buttonBase(self, 360, 1150, 'greenRectNormal', 'greenRectTapped',
            'Policies', '#FFFFFF', 1, 0.75, 2);

        this.pollutionBar = new progressBarBase(self, 100, 1000, 'cornerSquare', 0xa36643, 2);
        this.pollutionBar.setProgress(this.gamestate.globalPollution);
        this.happinessBar = new progressBarBase(self, 620, 1000, 'cornerSquare', 0x00ff00, 2);

        //Set the function to run when button is pressed, along with the args (using ...args)
        this.actionButton.setDownFunction(this.loadSceneB, self);

        let d = new Date();
        this.startTime = d.getTime();

        this.updateTime = 5000; //1000 ms = 1 s

        this.isGameRunning = true;
        this.isGameFinished = false;


        this.gamestate.addBuilding("coal");

        //Temp test button
        this.addPowerPlantButton = new buttonBase(self, 360, 1000, 'greenRectNormal', 'greenRectTapped',
            'Add Coal Plant', '#FFFFFF' ,1, 0.75, 1.5);
        this.addPowerPlantButton.setDownFunction(this.addPowerPlant, self);
        this.delPowerPlantButton = new buttonBase(self, 360, 800, 'greenRectNormal', 'greenRectTapped',
            'Del Coal Plant', '#FFFFFF' ,1, 0.75, 1.5);
        this.delPowerPlantButton.setDownFunction(this.delPowerPlant, self);


        this.energyText = this.add.text(360, 150, "");
        this.energyText.setScale(4);
        this.energyText.setText(this.calculateEnergy().toString());

    }

    update(){
        if(this.isGameRunning && !this.isGameFinished) {
            //Update stuff per this.updateTime second
            let d = new Date();
            let deltaTime = d.getTime() - this.startTime;
            //Do things when the game updates
            if (deltaTime > this.updateTime) {
                this.updatePollution();
                this.startTime = d.getTime();
            }

            if(this.gamestate.getGlobalPollution()>100){
                this.isGameRunning=false;
                this.gameFinished();
            }
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

    gameFinished() {
        //TODO show text and add button to play again
        this.isGameFinished=true;
        console.log("Game finished");
    }

    calculateEnergy(){
        let res=0;
        res+=this.gamestate.coalPlants.getNetEnergy();
        return res;
    }

    /**
     *
     * @param {Array} args
     */
    addPowerPlant(args){
        let self = args[0];
        self.gamestate.addBuilding("coal");
        self.energyText.setText(self.calculateEnergy().toString());
    }

    /**
     *
     * @param {Array} args
     */
    delPowerPlant(args){
        let self = args[0];
        self.gamestate.removeBuilding("coal");
        self.energyText.setText(self.calculateEnergy().toString());
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