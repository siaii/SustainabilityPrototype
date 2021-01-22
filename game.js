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
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);


class buttonBase{
    buttonObject;
    constructor(self, xPos, yPos, textureUp, textureDown, text = '', scaleX = 1, scaleY = 1) {
        this.normalTexture = textureUp;
        this.downTexture = textureDown;
        this.buttonObject = self.add.image(xPos, yPos, textureUp);
        this.buttonText = self.add.text(xPos, yPos, text);
        this.buttonText.setPosition(xPos - this.buttonText.width/2, yPos - this.buttonText.height/2);
        this.buttonObject.setScale(scaleX, scaleY);
        this.buttonObject.setInteractive();
        this.buttonObject.on('pointerdown', this.onButtonDown);
        this.buttonObject.on('pointerup', this.onButtonUp);
    }

    onButtonDown(){
        this.buttonObject.setTexture(this.downTexture);
    }

    onButtonUp(){
        this.buttonObject.setTexture(this.normalTexture);
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
        if(val==0){
            val = Phaser.Math.EPSILON
        }else if(val<Phaser.Math.EPSILON || val>100){
            console.log("Invalid Value");
        }
        let finalScale = (val/100) * this.scaleAtMax;
        this.barObject.setScale(this.scaleX, finalScale);
    }
}

function preload(){
    //Load assets
    this.load.image('greenRectNormal', 'assets/greenRectNormal.png');
    this.load.image('greenRectTapped', 'assets/greenRectTapped.png');
    this.load.image('cornerSquare', 'assets/cornerSquare.png');
}

function create(){
    let self = this;
    let button = new buttonBase(self, 360, 640, 'greenRectNormal', 'greenRectTapped', 'Test Text');
    let bar = new progressBarBase(self, 100, 1000, 'cornerSquare', 0xff0000, 2);
    bar.setProgress(50);


}

function update(){

}

