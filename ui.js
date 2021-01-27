
class ButtonBase {
    downFunction = function(){
        console.log("down");
    };

    upFunction = function(){
        console.log("up");
    };
    downFunctionArgs;

    /**
     *
     * @param {Phaser.Scene}self
     * @param {int} xPos
     * @param {int} yPos
     * @param {string} textureUp
     * @param {string} textureDown
     * @param {string} text
     * @param {string} textColor
     * @param {number} scaleX
     * @param {number} scaleY
     * @param {number} textScale
     */
    constructor(self, xPos, yPos, textureUp, textureDown, text = '', textColor='#FFFFFF', scaleX = 1, scaleY = 1, textScale = 1) {
        this.normalTexture = textureUp;
        this.downTexture = textureDown;
        this.buttonObject = self.add.image(xPos, yPos, textureUp);
       //Setup text
        this.buttonText = self.add.text(xPos, yPos, text);
        this.buttonText.setScale(textScale);
        this.buttonText.setColor(textColor);
        this.buttonText.setPosition(xPos - this.buttonText.width*(textScale/2), yPos - this.buttonText.height*(textScale/2));
        this.buttonObject.setScale(scaleX, scaleY);
        this.buttonObject.setInteractive();
        //Setup pointer (both mouse and touch) events
        this.buttonObject.on('pointerdown', this.onButtonDown, this);
        this.buttonObject.on('pointerup', this.onButtonUp, this);
        this.buttonObject.on('pointerout', this.onButtonUp, this);
    }

    /**
     *
     * @param {function} func
     * @param arg
     */
    setDownFunction(func, ...arg){
        this.downFunction = func;
        this.downFunctionArgs = arg;
    }

    onButtonDown(){

        this.buttonObject.setTexture(this.downTexture);
        this.downFunction(this.downFunctionArgs);
    }

    onButtonUp(){
        this.buttonObject.setTexture(this.normalTexture);
    }

    disable(){
        this.buttonObject.setActive(false).setVisible(false);
        this.buttonText.setActive(false).setVisible(false);
    }

    enable(){
        this.buttonObject.setActive(true).setVisible(true);
        this.buttonText.setActive(true).setVisible(true);
    }
}

//General progress bar for progress/loading, scaling pivot at bottom
class ProgressBarBase {
    scaleX = 0.25;

    /**
     *
     * @param {Phaser.Scene} self
     * @param {number} xPos
     * @param {number} yPos
     * @param {string} texture
     * @param {string} color
     * @param {number} maxScale
     * @param {boolean} isVertical
     */
    constructor(self, xPos, yPos, texture, color, maxScale, isVertical = true) {
        this.barBackground = self.add.image(xPos, yPos, texture);
        this.barObject = self.add.image(xPos, yPos, texture);
        this.barBackground.setTint(0x777777);
        this.barBackground.setAlpha(0.35);
        this.barObject.setTint(color);
        //Pivot at bottom center
        this.barObject.setOrigin(0.5,1);
        this.barBackground.setOrigin(0.5,1);
        //Make background thin and tall, as tall as the max can be
        this.barBackground.setScale(this.scaleX, maxScale);
        //Make the bar thin
        this.barObject.setScale(this.scaleX);

        this.scaleAtMax = maxScale;
        if(!isVertical){
            this.barObject.setRotation(-90);
        }
    }

    /**
     *
     * @param {number} val
     */
    //Set value of the bar, from 0-100
    setProgress(val){
        if(val<0 || val>100){
            console.log("Invalid Value");
        }else{
            let finalScale = (val/100) * this.scaleAtMax;
            this.barObject.setScale(this.scaleX, finalScale);
        }

    }

    disable(){
        this.barBackground.setActive(false).setVisible(false);
        this.barObject.setActive(false).setVisible(false);
    }

    enable(){
        this.barBackground.setActive(true).setVisible(true);
        this.barObject.setActive(true).setVisible(true);
    }
}

class UiGroup{
    constructor() {
        this.members=[];
    }

    add(newObject){
        this.members.push(newObject);
    }

    remove(toBeRemoved){
        let i;
        let temp=[]
        for(i=0;i<this.members.length; i++){
            if(this.members[0]!=toBeRemoved){
                temp.push(this.members[0]);
                this.members.shift();
            }else{
                let tempObj = this.members[0];
                this.members.shift();
                tempObj.disable();
            }
        }
        for(i=0; i<temp.length; i++){
            this.members.push(temp[i]);
        }
    }

    getMembers(){
        return this.members;
    }

    disable(){
        let i;
        for(i=0; i<this.members.length; i++){
            this.members[i].disable();
        }
    }

    enable(){
        let i;
        for(i=0; i<this.members.length; i++){
            this.members[i].enable();
        }
    }

}

