class Building{
    /**
     *
     * @param {String} name
     * @param {int} energyChange
     * @param {int} pollutionChange
     */
    constructor(name, energyChange, pollutionChange, cost) {
        this.name = name;
        this.energy = energyChange;
        this.pollution = pollutionChange;
        this.buildingCost = cost;
        this.buildingCount = 0;


        this.energyModifier = 1;
        this.pollutionModifier = 1;

        //1 means it is producing, -1 means it is consuming
        this.energyMultiplier = 1;
        this.pollutionMultiplier = 1;

    }

    getNetEnergy(){
        return this.buildingCount*this.energy*this.energyModifier*this.energyMultiplier;
    }

    getNetPollution(){
        return this.buildingCount*this.pollution*this.pollutionModifier*this.pollutionMultiplier;
    }

    /**
     *
     * @param {int} val
     */
    addEnergyModifier(val){
        this.energyModifier+=val;
    }

    /**
     *
     * @param {int} val
     */
    addPollutionModifier(val){
        this.pollutionModifier+=val;
    }

    createBuilding(){
        this.buildingCount+=1;
        console.log(this.name+" count: "+this.buildingCount);
    }

    destroyBuilding(){
        this.buildingCount=Math.max(0,this.buildingCount-1);
        console.log(this.name+" count: "+this.buildingCount);
    }

}

class PowerPlant extends Building{
    constructor(name, energyChange, pollutionChange, cost = 100) {
        super(name, energyChange, pollutionChange, cost);

        this.energyMultiplier = 1;
        this.pollutionMultiplier = 1;
    }
}

class PollutionProcessor extends Building{
    constructor(name, energyChange, pollutionChange, cost = 100) {
        super(name, energyChange, pollutionChange, cost);

        this.energyMultiplier = -1;
        this.pollutionMultiplier = -1;
    }
}
