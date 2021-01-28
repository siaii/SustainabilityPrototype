class GameState extends Phaser.Plugins.BasePlugin{
    constructor(pluginManager) {
        super(pluginManager);
    }

    start(){
        super.start();

        //Placeholder values
        this.pollutionPerTick = 2;
        this.pollutionModifier = 1;
        this.globalPollution = 40;

        this.globalHappiness = 50;
        this.globalPop = 20;
        this.popUpdateCounter = 0;

        this.balanceMoney = 1000;
        this.moneyPerTick = 4;
        this.moneyModifier = 1;

        this.powerModifier = 1;

        this.totalBuildingCount = 0;
        this.maxBuildingCount = 10;
        /**
         * Buildings
         * TRIPLE CHECK EVERY SWITCH CASE WHEN ADDING NEW BUILDINGS TO AVOID DUMB MISTAKES
         */
        this.coalPlants = new PowerPlant("Coal", 10, 1);

        this.isInitialized = false;

        this.updateBuildingCount();
    }

    updateBuildingCount(){
        this.totalBuildingCount=this.coalPlants.buildingCount;
        //Add more types of buildings here
    }

    updateGlobalPollution(){
        this.pollutionPerTick=0;
        this.pollutionPerTick+=this.coalPlants.getNetPollution();
        this.globalPollution+=this.getPollutionPerTick();
    }

    updateMoney(){
        this.moneyPerTick=Math.floor(Math.max(4, (this.globalHappiness/10)));
        this.balanceMoney+=this.moneyPerTick*this.moneyModifier;
    }

    updateHappiness(byVal){
        this.globalHappiness+=byVal;
    }

    getPollutionPerTick(){
        return this.pollutionPerTick * this.pollutionModifier;
    }

    getGlobalPollution(){
        return this.globalPollution;
    }

    getHappiness(){
        return this.globalHappiness;
    }

    getTotalPop(){
        return this.globalPop;
    }

    getBalanceMoney(){
        return this.balanceMoney;
    }

    getPopUpdateCounter(){
        return this.popUpdateCounter;
    }

    resetPopUpdateCounter(){
        this.popUpdateCounter=0;
    }

    incPopUpdateCounter(){
        this.popUpdateCounter++;
    }

    updateGlobalPop(val){
        this.globalPop+=val;
    }

    /**
     * @param {String} newBuilding
     */
    addBuilding(newBuilding){
        switch(newBuilding.toLowerCase()){
            case "coal":
                if(this.balanceMoney>=this.coalPlants.getBuildingCost()){
                    this.coalPlants.createBuilding();
                    this.balanceMoney-=this.coalPlants.getBuildingCost();
                }

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

    getTotalBuildingCount(){
        return this.totalBuildingCount;
    }
}


/**
 *      #############################################
 *      #############################################
 *      DIVIDER FOR BETTER VISIBILITY BETWEEN CLASSES
 *      #############################################
 *      #############################################
 */

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
        this.pollutionBar.setProgress(this.gamestate.getGlobalPollution());
        this.happinessBar = new ProgressBarBase(self, 980, 1500, 'cornerSquare', 0x00ff00, 4);
        this.happinessBar.setProgress(this.gamestate.getHappiness());

        //Set the function to run when button is pressed, along with the args (using ...args)
        this.actionButton.setDownFunction(this.loadSceneB, self);

        if(!this.gamestate.isInitialized){
            this.gamestate.addBuilding("coal");
            //Add any additional starting buildings
            this.gamestate.balanceMoney=60;
            this.gamestate.isInitialized=true;
        }

        let d = new Date();
        this.startTime = d.getTime();

        this.updateTime = 5000; //1000 ms = 1 s

        this.isGameRunning = true;
        this.isGameFinished = false;

        this.moneyText = this.add.text(100, 100, "-1");
        this.moneyText.setScale(4);
        this.moneyText.setText("Money: "+this.gamestate.getBalanceMoney().toString());

        this.energyText = this.add.text(600, 100, "-1");
        this.energyText.setScale(4);
        this.energyText.setText("Power: "+this.calculateEnergy().toString());

        this.popText = this.add.text(100, 200, "-1");
        this.popText.setScale(4);
        this.popText.setText("Pop: "+this.gamestate.getTotalPop());
    }

    update(){
        if(this.isGameRunning && !this.isGameFinished) {
            //Update stuff per this.updateTime second
            let d = new Date();
            let deltaTime = d.getTime() - this.startTime;
            //Do things when the game updates
            if (deltaTime > this.updateTime) {
                this.gameLoop();
                //Reset counter
                this.startTime = d.getTime();
            }

            if(this.gamestate.getGlobalPollution()>100 || this.gamestate.getHappiness()<=0){
                this.isGameRunning=false;
                this.gameFinished();
            }
        }
    }

    gameLoop() {
        this.updatePollution();
        this.updateMoney();
        this.updateHappiness();
        this.updatePopulation();
    }

    updateBar(args){
        //need to match the args order when setting button's down function
        args[0].setProgress(args[1]);
    }

    loadSceneB(args){
        let self = args[0]
        self.scene.start('sceneB');
    }

    updatePopulation(){
        let curHappiness = this.gamestate.getHappiness();
        let turnPerPopUpdate = 3;
        //Update population every 3 game updates for now
        if (this.gamestate.getPopUpdateCounter() < turnPerPopUpdate) {
            this.gamestate.incPopUpdateCounter();
        }else if(curHappiness>=50){
            //Increase population by 1
            this.gamestate.updateGlobalPop(1);
            this.gamestate.resetPopUpdateCounter();
            this.popText.setText("Pop: "+this.gamestate.getTotalPop());

        }else{
            //Decrease population by 1, possibly make the decrease inversely proportional to happiness value
            this.gamestate.updateGlobalPop(-1);
            this.gamestate.resetPopUpdateCounter();
            this.popText.setText("Pop: "+this.gamestate.getTotalPop());
        }

    }

    updateHappiness(){
        //Base power required is half the total population
        let powerReq = this.gamestate.globalPop * this.gamestate.powerModifier;
        let powerGen = this.calculateEnergy();

        //Make the happiness inversely proportional to pollution value
        let curHappiness = this.gamestate.getHappiness();
        let maxHappiness = 100-this.gamestate.getGlobalPollution();

        //This will make the happiness decrease faster than when increasing
        let powerDivider = powerGen<powerReq ? 10 : 20;
        this.gamestate.updateHappiness(Math.floor(powerGen-powerReq)/10 + Math.min(0, Math.floor(maxHappiness-curHappiness)/5));
        this.happinessBar.setProgress(this.gamestate.getHappiness());
    }

    updatePollution(){
        this.gamestate.updateGlobalPollution();
        this.pollutionBar.setProgress(this.gamestate.getGlobalPollution());
    }

    updateMoney(){
        this.gamestate.updateMoney()
        this.moneyText.setText("Money: "+this.gamestate.balanceMoney.toString());
    }

    gameFinished() {
        //TODO show text and add button to play again
        this.isGameFinished=true;
        console.log("Game finished");
    }

    calculateEnergy(){
        let res=0;
        res+=this.gamestate.coalPlants.getNetEnergy();
        //Add other source of energy here
        return res;
    }

}



/**
 *      #############################################
 *      #############################################
 *      DIVIDER FOR BETTER VISIBILITY BETWEEN CLASSES
 *      #############################################
 *      #############################################
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

        //Add ui elements
        //TODO Maybe group this into an object for easier creation
        let coalText = this.add.text(100, 200, "Coal Power Plant").setScale(3);
        let coalCountText = this.add.text(700, 350, "-1").setScale(3);
        coalCountText.setText(this.gamestate.getBuildingCount("coal"));
        let addPowerPlantButton = new ButtonBase(self, 200, 400, 'greenRectNormal', 'greenRectTapped',
            'Build', '#FFFFFF' ,0.7, 1, 3);
        addPowerPlantButton.setDownFunction(this.addPowerPlant, self, coalCountText, "coal", addPowerPlantButton);
        let delPowerPlantButton = new ButtonBase(self, 500, 400, 'greenRectNormal', 'greenRectTapped',
            'Destroy', '#FFFFFF' ,0.7, 1, 3);
        delPowerPlantButton.setDownFunction(this.delPowerPlant, self, coalCountText, "coal");

        //Check if this is buildable, do this for all add button, inefficient solution
        this.checkIsBuildable("coal", addPowerPlantButton);

        //Make add buttons it's own group to disable them to check them separately from other ui
        let addButtons = new UiGroup();
        addButtons.add(addPowerPlantButton);

        //Group them together
        this.buildingGroup.add(coalCountText);
        this.buildingGroup.add(coalText);
        this.buildingGroup.add(addButtons);
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
        let buttonObj = args[3];
        self.gamestate.addBuilding(type);
        countText.setText(self.gamestate.getBuildingCount(type));
        self.checkIsBuildable(type, buttonObj);
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

    /**
     *
     * @param {string} name
     * @param {ButtonBase} buttonObj
     */
    checkIsBuildable(name, buttonObj){
        //Possibly use dictionary to avoid switch case and repeating code?
        switch(name.toLowerCase()){
            case "coal":
                if(this.gamestate.getBalanceMoney()<this.gamestate.coalPlants.getBuildingCost() || this.gamestate.getTotalBuildingCount() >= this.gamestate.maxBuildingCount){
                    buttonObj.setActive(false);
                }else{
                    buttonObj.setActive(true);
                }
                break;
            //Add other buildings
        }
    }
}