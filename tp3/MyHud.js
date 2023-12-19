import * as THREE from "three";
import { MyApp } from "./MyApp.js";
/**
 * This class contains a hud 
 */
class MyHud extends THREE.Object3D {
    /**
     *
     * @param {MyApp} app the application object
     * @param {Object} data the path of the hud
     */
    constructor(app, data) {
        super();
        this.app = app;
        this.type = "Group";
        this.path = data.path;
        this.timeElapsed = data.timeElapsed[0].timeFloat;
        this.laps = data.laps[0].value;
        this.speed = data.speedometer[0].value;
        this.timeLeftBenefit = data.timeLeftBenefit[0].timeFloat;
        this.timeLeftPenalty = data.timeLeftPenalty[0].timeFloat;
        this.states = data.states[0].stateValue;



        
                    
        /*// Load the texture
        const texture = new THREE.TextureLoader().load('scenes/scene1/textures/numbers.png');

        // Calculate the width of a single sprite on the spritesheet
        const spriteWidth = 1 / 11; // There are 11 sprites in the spritesheet

        // Create a loop to instantiate three sprites with different offsets
        for (let i = 0; i < 3; i++) {
            // Create a new sprite material for each sprite
            const material = new THREE.SpriteMaterial({ map: texture });

            // Calculate the offset for each sprite
            const offset = (1.7 / 11) % 1; // Adjust the offset based on your requirements

            // Set the horizontal repeat to the sprite's width (in proportion to the whole image)
            texture.repeat.set(spriteWidth, 1);

            // Use the offset to select a specific sprite
            texture.offset.x = offset;

            // Create the sprite
            const sprite = new THREE.Sprite(material);

            // Set the position of each sprite
            sprite.position.set(i * 0.95, 0, 0); // Adjust the position based on your requirements

            // Add the sprite to the scene
            this.add(sprite);
        }*/

    }

    updateHud(number){


        if(number <= 99){
            number = "0" + number;
        }

        this.numberDigits = this.getDigits(number);
            



        // Create a loop to instantiate three sprites with different offsets
        for (let i = 0; i < this.numberDigits.length; i++) {






            // Load the texture
            const texture = new THREE.TextureLoader().load('scenes/scene1/textures/numbers.png');

            // Calculate the width of a single sprite on the spritesheet
            const spriteWidth = 1 / 10; // There are 10 sprites in the spritesheet

            // Create a new sprite material for each sprite
            const material = new THREE.SpriteMaterial({ map: texture });

            // Calculate the offset for each sprite
            const offset = ((1 * this.numberDigits[i]) / 10) % 1; // Adjust the offset based on your requirements



            // Set the horizontal repeat to the sprite's width (in proportion to the whole image)
            texture.repeat.set(spriteWidth, 1);

            // Use the offset to select a specific sprite
            texture.offset.x = offset;

            // Create the sprite
            const sprite = new THREE.Sprite(material);

            // Set the position of each sprite
            sprite.position.set((-i * 1.2)-10, 10, 0); // Adjust the position based on your requirements



            let zindex = 10; // Set your desired zindex here

            sprite.renderOrder = zindex || 999
            sprite.material.depthTest = false 
            // UPDATED If you using some models with transparent materials
            sprite.material.transparent = true
            //sprite.onBeforeRender = function (renderer) { renderer.clearDepth(); };

            // Add the sprite to the scene
            this.add(sprite);
        }
    }

    getDigits(number) {
        const numberString = number.toString();

        // Convert the string to an array of digits
        const digitsArray = numberString.split('').map(digit => parseInt(digit) || 0);

        // Pad the array with leading zeros if needed
        while (digitsArray.length < 3) {
            digitsArray.unshift(0);
        }

        return digitsArray;
    }
      

    
}

MyHud.prototype.isGroup = true;

export { MyHud };
