//Game state using phaser plugins system so it persists between scene transitions
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

        this.coalPlants = new PowerPlant("Coal", 10, 2, 15);
        this.geothermalPlants = new PowerPlant("Geothermal", 15, 0.5, 40);
        this.solarPlants = new PowerPlant("Solar", 5, 0, 20);
        this.windPlants = new PowerPlant("Wind", 3, 0, 15);

        this.incinerator = new PollutionProcessor("Incinerator", 5, 3, 15);
        this.landfill = new PollutionProcessor("Landfill", 1, 4, 20);
        this.recycling = new PollutionProcessor("Recycling", 10, 5, 25);

        this.buildingDictionary = {};

        /**
         *
         * ADD NEW BUILDINGS TO THIS DICT FOR EASIER LOOKUP
         */
        this.buildingDictionary = {
            "coal": this.coalPlants,
            "geo": this.geothermalPlants,
            "solar": this.solarPlants,
            "wind": this.windPlants,

            "incinerator": this.incinerator,
            "landfill": this.landfill,
            "recycling": this.recycling
        }

        this.isInitialized = false;

        this.updateBuildingCount();
    }

    updateBuildingCount(){
        this.totalBuildingCount=0;
        this.totalBuildingCount+=this.coalPlants.getBuildingCount();
        this.totalBuildingCount+=this.geothermalPlants.getBuildingCount();
        this.totalBuildingCount+=this.solarPlants.getBuildingCount();
        this.totalBuildingCount+=this.windPlants.getBuildingCount();

        this.totalBuildingCount+=this.incinerator.getBuildingCount();
        this.totalBuildingCount+=this.landfill.getBuildingCount();
        this.totalBuildingCount+=this.recycling.getBuildingCount();
        //Add more types of buildings here
    }

    updateGlobalPollution(){
        //Update pollution here
        this.pollutionPerTick=0;
        this.pollutionPerTick+=this.coalPlants.getNetPollution();
        this.pollutionPerTick+=this.geothermalPlants.getNetPollution();
        this.pollutionPerTick+=this.solarPlants.getNetPollution();
        this.pollutionPerTick+=this.windPlants.getNetPollution();

        this.pollutionPerTick+=this.incinerator.getNetPollution();
        this.pollutionPerTick+=this.landfill.getNetPollution();
        this.pollutionPerTick+=this.recycling.getNetPollution();

        //Possibly add pollution due to population
        this.globalPollution+=this.getPollutionPerTick();
    }

    updateMoney(){
        this.moneyPerTick=Math.floor(Math.max(4, (this.globalHappiness/10)));
        this.balanceMoney+=this.moneyPerTick*this.moneyModifier;
    }

    calculateEnergy(){
        let res=0;
        res+=this.coalPlants.getNetEnergy();
        res+=this.geothermalPlants.getNetEnergy();
        res+=this.solarPlants.getNetEnergy();
        res+=this.windPlants.getNetEnergy();

        res+=this.incinerator.getNetEnergy();
        res+=this.landfill.getNetEnergy();
        res+=this.recycling.getNetEnergy();
        return res*this.powerModifier;
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
        let buildingObj = this.buildingDictionary[newBuilding.toLowerCase()];
        let cost = buildingObj.getBuildingCost();
        if(this.balanceMoney>=cost){
            buildingObj.createBuilding();
            this.balanceMoney-=cost;
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
        return this.buildingDictionary[name.toLowerCase()].getBuildingCount();
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

        this.updateTime = 2000; //1000 ms = 1 s

        this.isGameRunning = true;
        this.isGameFinished = false;

        this.moneyText = this.add.text(100, 100, "-1");
        this.moneyText.setScale(4);
        this.moneyText.setText("Money: "+this.gamestate.getBalanceMoney().toString());

        this.energyText = this.add.text(600, 100, "-1");
        this.energyText.setScale(4);
        this.energyText.setText("Power: "+Math.floor(this.gamestate.calculateEnergy()).toString());

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

        }else if(curHappiness<25){
            //Decrease population by 1, possibly make the decrease inversely proportional to happiness value
            this.gamestate.updateGlobalPop(-1);
            this.gamestate.resetPopUpdateCounter();
            this.popText.setText("Pop: "+this.gamestate.getTotalPop());
        }else{
            this.gamestate.resetPopUpdateCounter();
            this.popText.setText("Pop: "+this.gamestate.getTotalPop());
        }


    }

    updateHappiness(){
        //Base power required is half the total population
        let powerReq = this.gamestate.globalPop * this.gamestate.powerModifier;
        let powerGen = this.gamestate.calculateEnergy();

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
        let backButton = new ButtonBase(self, 100, 110, 'backBtn', 'backBtn', "", '#FFFFFF', 0.5, 0.5);
        backButton.setDownFunction(function(){
            self.scene.start('sceneA');
        });


        //Group for deciding policy
        this.policyGroup = new UiGroup();

        let addEnergyTaxButton = new ButtonBase(self, 300, 300, 'greenRectNormal', 'greenRectTapped', "Add Energy Tax", '#FFFFFF',  1.3, 1, 2);
        let addCleanEnergySubsidyButton = new ButtonBase(self, 300, 500, 'greenRectNormal', 'greenRectTapped', "Add Clean Energy Subsidy", '#FFFFFF', 1.3, 1, 2);
        let promoteElectricVehicle = new ButtonBase(self, 300, 700, 'greenRectNormal', 'greenRectTapped', "Subsidy Electric Vehicle", '#FFFFFF', 1.3, 1, 2)

        //self, energy modifier, pollution modifier (both in percents)
        addEnergyTaxButton.setDownFunction(this.addPolicy, self, -10, 0);
        addCleanEnergySubsidyButton.setDownFunction(this.addPolicy, self, 5, -10);
        promoteElectricVehicle.setDownFunction(this.addPolicy, self, 10, -10);
        this.policyGroup.add(addEnergyTaxButton);
        this.policyGroup.add(addCleanEnergySubsidyButton);
        this.policyGroup.add(promoteElectricVehicle);

        //Group for deciding building actions
        this.buildingGroup = new UiGroup();

        //Add ui elements
        //TODO Maybe group this into an object for easier creation
        let coalText = this.add.text(100, 200, "Coal Power Plant").setScale(3);
        let coalCountText = this.add.text(700, 325, "-1").setScale(3);
        coalCountText.setText(this.gamestate.getBuildingCount("coal"));
        let addCoalPlantButton = new ButtonBase(self, 200, 350, 'greenRectNormal', 'greenRectTapped', 'Build', '#FFFFFF' ,0.7, 0.8, 3);
        addCoalPlantButton.setDownFunction(this.addBuilding, self, coalCountText, "coal", addCoalPlantButton);
        let delCoalPlantButton = new ButtonBase(self, 500, 350, 'greenRectNormal', 'greenRectTapped', 'Destroy', '#FFFFFF' ,0.7, 0.8, 3);
        delCoalPlantButton.setDownFunction(this.delBuilding, self, coalCountText, "coal");

        let geoText = this.add.text(100, 450, "Geothermal Power Plant").setScale(3);
        let geoCountText = this.add.text(700, 575, "-1").setScale(3);
        geoCountText.setText(this.gamestate.getBuildingCount("geo"));
        let addGeoPlantButton = new ButtonBase(self, 200, 600, 'greenRectNormal', 'greenRectTapped', 'Build', '#FFFFFF' ,0.7, 0.8, 3);
        addGeoPlantButton.setDownFunction(this.addBuilding, self, geoCountText, "geo", addGeoPlantButton);
        let delGeoPlantButton = new ButtonBase(self, 500, 600, 'greenRectNormal', 'greenRectTapped', 'Destroy', '#FFFFFF' ,0.7, 0.8, 3);
        delGeoPlantButton.setDownFunction(this.delBuilding, self, geoCountText, "geo");

        let solarText = this.add.text(100, 700, "Solar Power Plant").setScale(3);
        let solarCountText = this.add.text(700, 825, "-1").setScale(3);
        solarCountText.setText(this.gamestate.getBuildingCount("solar"));
        let addSolarPlantButton = new ButtonBase(self, 200, 850, 'greenRectNormal', 'greenRectTapped', 'Build', '#FFFFFF' ,0.7, 0.8, 3);
        addSolarPlantButton.setDownFunction(this.addBuilding, self, solarCountText, "solar", addSolarPlantButton);
        let delSolarPlantButton = new ButtonBase(self, 500, 850, 'greenRectNormal', 'greenRectTapped', 'Destroy', '#FFFFFF' ,0.7, 0.8, 3);
        delSolarPlantButton.setDownFunction(this.delBuilding, self, solarCountText, "solar");

        // let windText = this.add.text(100, 950, "Wind Power Plant").setScale(3);
        // let windCountText = this.add.text(700, 1075, "-1").setScale(3);
        // windCountText.setText(this.gamestate.getBuildingCount("wind"));
        // let addWindPlantButton = new ButtonBase(self, 200, 1100, 'greenRectNormal', 'greenRectTapped', 'Build', '#FFFFFF' ,0.7, 0.8, 3);
        // addWindPlantButton.setDownFunction(this.addBuilding, self, windCountText, "wind", addWindPlantButton);
        // let delWindPlantButton = new ButtonBase(self, 500, 1100, 'greenRectNormal', 'greenRectTapped', 'Destroy', '#FFFFFF' ,0.7, 0.8, 3);
        // delWindPlantButton.setDownFunction(this.delBuilding, self, windCountText, "wind");

        let incineratorText = this.add.text(100, 950, "Incinerator Processing Plant").setScale(3);
        let incineratorCountText = this.add.text(700, 1075, "-1").setScale(3);
        incineratorCountText.setText(this.gamestate.getBuildingCount("incinerator"));
        let addIncineratorPlantButton = new ButtonBase(self, 200, 1100, 'greenRectNormal', 'greenRectTapped', 'Build', '#FFFFFF' ,0.7, 0.8, 3);
        addIncineratorPlantButton.setDownFunction(this.addBuilding, self, incineratorCountText, "incinerator", addIncineratorPlantButton);
        let delIncineratorPlantButton = new ButtonBase(self, 500, 1100, 'greenRectNormal', 'greenRectTapped', 'Destroy', '#FFFFFF' ,0.7, 0.8, 3);
        delIncineratorPlantButton.setDownFunction(this.delBuilding, self, incineratorCountText, "incinerator");

        let recyclingText = this.add.text(100, 1200, "Recycling Plant").setScale(3);
        let recyclingCountText = this.add.text(700, 1325, "-1").setScale(3);
        recyclingCountText.setText(this.gamestate.getBuildingCount("recycling"));
        let addRecyclingPlantButton = new ButtonBase(self, 200, 1350, 'greenRectNormal', 'greenRectTapped', 'Build', '#FFFFFF' ,0.7, 0.8, 3);
        addRecyclingPlantButton.setDownFunction(this.addBuilding, self, recyclingCountText, "recycling", addRecyclingPlantButton);
        let delRecyclingPlantButton = new ButtonBase(self, 500, 1350, 'greenRectNormal', 'greenRectTapped', 'Destroy', '#FFFFFF' ,0.7, 0.8, 3);
        delRecyclingPlantButton.setDownFunction(this.delBuilding, self, recyclingCountText, "recycling");



        //Check if this is buildable, do this for all add button, inefficient solution
        this.checkIsBuildable("coal", addCoalPlantButton);
        this.checkIsBuildable("geo", addGeoPlantButton);
        this.checkIsBuildable("solar", addSolarPlantButton);
        this.checkIsBuildable("incinerator", addIncineratorPlantButton);
        this.checkIsBuildable("recycling", addRecyclingPlantButton);


        //Group them together
        this.buildingGroup.add(coalCountText);
        this.buildingGroup.add(coalText);
        this.buildingGroup.add(addCoalPlantButton);
        this.buildingGroup.add(delCoalPlantButton);

        this.buildingGroup.add(geoCountText);
        this.buildingGroup.add(geoText);
        this.buildingGroup.add(addGeoPlantButton);
        this.buildingGroup.add(delGeoPlantButton);

        this.buildingGroup.add(solarCountText);
        this.buildingGroup.add(solarText);
        this.buildingGroup.add(addSolarPlantButton);
        this.buildingGroup.add(delSolarPlantButton);

        this.buildingGroup.add(incineratorCountText);
        this.buildingGroup.add(incineratorText);
        this.buildingGroup.add(addIncineratorPlantButton);
        this.buildingGroup.add(delIncineratorPlantButton);

        this.buildingGroup.add(recyclingCountText);
        this.buildingGroup.add(recyclingText);
        this.buildingGroup.add(addRecyclingPlantButton);
        this.buildingGroup.add(delRecyclingPlantButton);
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

    addBuilding(args){
        let self = args[0];
        let countText = args[1];
        let type = args[2];
        let buttonObj = args[3];
        self.gamestate.addBuilding(type);
        countText.setText(self.gamestate.getBuildingCount(type));
        //TODO UPDATE ALL BUTTONS AT ONCE AND NOT JUST THE CLICKED ONE
        self.checkIsBuildable(type, buttonObj);
    }

    delBuilding(args){
        let self = args[0];
        let countText = args[1];
        let type = args[2];
        self.gamestate.removeBuilding(type);
        countText.setText(self.gamestate.getBuildingCount(type));
    }

    addPolicy(args){
        let self = args[0];
        let energyModifier = args[1];
        let pollutionModifier = args[2];

        self.gamestate.powerModifier+=energyModifier/100;
        self.gamestate.pollutionModifier+=pollutionModifier/100;
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
        let buildingObj = this.gamestate.buildingDictionary[name.toLowerCase()];
        if(this.gamestate.getBalanceMoney()<buildingObj.getBuildingCost() || this.gamestate.getTotalBuildingCount() >= this.gamestate.maxBuildingCount){
            buttonObj.setActive(false);
        }else{
            buttonObj.setActive(true);
        }
    }
}