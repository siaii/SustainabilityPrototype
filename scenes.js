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

        this.totalBuildingCount=0;
        this.coalPlants = new PowerPlant("Coal", 10, 10);

        this.isInitialized = false;

        this.updateBuildingCount();
    }

    updateBuildingCount(){
        this.totalBuildingCount=this.coalPlants.buildingCount;
    }

    getPollutionPerTick(){
        return this.pollutionPerTick;
    }

    getGlobalPollution(){
        return this.globalPollution;
    }

    updateMoneyPerTick(){
        this.moneyPerTick=Math.max(4, this.globalHappiness/10);
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
        this.updateBuildingCount();
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
        this.updateBuildingCount();
    }

    getBuildingCount(name){
        switch(name.toLowerCase()){
            case "coal":
                return this.coalPlants.buildingCount;
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
        this.load.image('yellowRectNormal', 'assets/yellowRectNormal.png');
        this.load.image('yellowRectTapped', 'assets/yellowRectTapped.png');
        this.load.image('cornerSquare', 'assets/cornerSquare.png');
        this.load.image('backBtn', 'assets/backBtn.png');
    }

    create(){
        let self = this;

        //Create new instances of UI elements
        this.actionButton = new ButtonBase(self, 540, 1750, 'greenRectNormal', 'greenRectTapped',
            'Policies', '#FFFFFF', 1.5, 1.2, 3);

        this.pollutionBar = new ProgressBarBase(self, 100, 1500, 'cornerSquare', 0xa36643, 4);
        this.pollutionBar.setProgress(this.gamestate.globalPollution);
        this.happinessBar = new ProgressBarBase(self, 980, 1500, 'cornerSquare', 0x00ff00, 4);

        //Set the function to run when button is pressed, along with the args (using ...args)
        this.actionButton.setDownFunction(this.loadSceneB, self);

        let d = new Date();
        this.startTime = d.getTime();

        this.updateTime = 5000; //1000 ms = 1 s

        this.isGameRunning = true;
        this.isGameFinished = false;

        this.energyText = this.add.text(540, 150, "");
        this.energyText.setScale(4);
        this.energyText.setText(this.calculateEnergy().toString());

        if(!this.gamestate.isInitialized){
            this.gamestate.addBuilding("coal");
            this.gamestate.isInitialized=true;
        }

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


}



/**
 *      #############################
 *      #############################
 *      DIVIDER FOR BETTER VISIBILITY
 *      #############################
 *      #############################
 */




class SceneB extends Phaser.Scene{
    constructor() {
        super('sceneB');
    }

    preload(){

    }

    create(){
        let self = this;
        let backButton = new ButtonBase(self, 100, 120, 'backBtn', 'backBtn', "", '#FFFFFF', 0.5, 0.5);
        backButton.setDownFunction(function(){
            self.scene.start('sceneA');
        });


        //Group for deciding policy
        this.policyGroup = new UiGroup();

        let addEnergyTaxButton = new ButtonBase(self, 300, 300, 'greenRectNormal',
            'greenRectTapped', "Add Energy Tax", '#FFFFFF',  1.3, 1, 2);
        let addCleanEnergySubsidyButton = new ButtonBase(self, 300, 500,
            'greenRectNormal', 'greenRectTapped', "Add Clean Energy Subsidy", '#FFFFFF', 1.3, 1, 2);
        let promoteElectricVehicle = new ButtonBase(self, 300, 700, 'greenRectNormal',
            'greenRectTapped', "Subsidy Electric Vehicle", '#FFFFFF', 1.3, 1, 2)

        this.policyGroup.add(addEnergyTaxButton);
        this.policyGroup.add(addCleanEnergySubsidyButton);
        this.policyGroup.add(promoteElectricVehicle);

        //Group for deciding building actions
        this.buildingGroup = new UiGroup();

        //TODO Maybe group this into an object for easier creation
        let coalText = this.add.text(100, 200, "Coal Power Plant").setScale(3);
        let coalCountText = this.add.text(700, 350, "-1").setScale(3);
        coalCountText.setText(this.gamestate.getBuildingCount("coal"));
        let addPowerPlantButton = new ButtonBase(self, 200, 400, 'greenRectNormal', 'greenRectTapped',
            'Build', '#FFFFFF' ,0.7, 1, 3);
        addPowerPlantButton.setDownFunction(this.addPowerPlant, self, coalCountText, "coal");
        let delPowerPlantButton = new ButtonBase(self, 500, 400, 'greenRectNormal', 'greenRectTapped',
            'Destroy', '#FFFFFF' ,0.7, 1, 3);
        delPowerPlantButton.setDownFunction(this.delPowerPlant, self, coalCountText, "coal");

        this.buildingGroup.add(coalCountText);
        this.buildingGroup.add(coalText);
        this.buildingGroup.add(addPowerPlantButton);
        this.buildingGroup.add(delPowerPlantButton);
        this.buildingGroup.disable();


        //Buttons to choose build or policy
        this.policyButton = new ButtonBase(self, 270, 1750, 'yellowRectNormal',
            'yellowRectTapped', "Policies", '#FFFFFF', 1.3, 1, 3);
        this.policyButton.setDownFunction(this.enablePolicyGroup, self);

        this.buildingButton = new ButtonBase(self, 810, 1750, 'yellowRectNormal',
            'yellowRectTapped', "Buildings", '#FFFFFF', 1.3, 1, 3);
        this.buildingButton.setDownFunction(this.enableBuildingGroup, self);
    }

    update(){

    }

    addPowerPlant(args){
        let self = args[0];
        let countText = args[1];
        let type = args[2];
        self.gamestate.addBuilding(type);
        countText.setText(self.gamestate.getBuildingCount(type));
    }

    delPowerPlant(args){
        let self = args[0];
        let countText = args[1];
        let type = args[2];
        self.gamestate.removeBuilding("coal");
        countText.setText(self.gamestate.getBuildingCount(type));
    }

    enablePolicyGroup(args){
        let self = args[0];
        self.buildingGroup.disable();
        self.policyGroup.enable();
    }

    enableBuildingGroup(args){
        let self = args[0];
        self.policyGroup.disable();
        self.buildingGroup.enable();
    }
}