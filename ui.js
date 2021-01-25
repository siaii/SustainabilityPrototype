
class buttonBase{
    downFunction = function(){
        console.log("down");
    };

    upFunction = function(){
        console.log("up");
    };
    downFunctionArgs;
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
    }

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
        this.buttonObject.setAlpha(0);
        this.buttonText.setAlpha(0);
        this.buttonObject.setInteractive(false);
    }
}

//General progress bar for progress/loading, scaling pivot at bottom
class progressBarBase{
    scaleX = 0.15;
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

    //Set value of the bar, from 0-100
    setProgress(val){
        // if(val==0){
        //     val = Phaser.Math.EPSILON
        // }else
        if(val<0 || val>100){
            console.log("Invalid Value");
        }else{
            let finalScale = (val/100) * this.scaleAtMax;
            this.barObject.setScale(this.scaleX, finalScale);
        }

    }
}

