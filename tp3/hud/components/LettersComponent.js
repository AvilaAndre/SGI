import * as THREE from 'three';
import { HudComponent } from '../HudComponent.js';

class LettersComponent extends HudComponent {
    #totalLetters = 1;
    #letterMeshes = [];

    constructor(position, scale, getValue, initialText, letterCount, spacing) {
        super(position, scale, getValue, initialText);

        this.spacing = spacing;

        this.spriteScale = scale; 


        this.letterTexture = new THREE.TextureLoader().load("scenes/scene1/textures/sprite_sheet_monospaced_white.png");
        const textureWidth = 1020;
        const textureHeight = 1020;
        const singleCharWidth = 102;
        const singleCharHeight = 102;

        this.colsInTexture = textureWidth / singleCharWidth;
        this.rowsInTexture = textureHeight / singleCharHeight;
        this.uSize = 1 / this.colsInTexture;
        this.vSize = 1 / this.rowsInTexture;
        this.letterTexture.repeat.set(this.uSize, this.vSize);

        this.totalText = initialText;

        if(initialText.length > 0){
            this.createText(initialText);
        }
    }


    /**
     * Calculate sthe UV coordinates of the desired letter in the texture
     * @param {*} char 
     * @returns 
     */
    calculateUVForChar(char) {
        const asciiValue = char.charCodeAt(0) - 32;
        const uCoord = (asciiValue % this.colsInTexture) * this.uSize;
        const vCoord = (this.rowsInTexture - 1 - Math.floor(asciiValue / this.colsInTexture)) * this.vSize;


        return [uCoord, vCoord];
    }

    /**
     * Creates the letters' mesh
     * @param {*} char 
     * @param {*} dimensions 
     * @returns 
     */
    createLetterMesh(char, dimensions) {
        const [u, v] = this.calculateUVForChar(char);
        const [letterWidth, letterHeight] = dimensions;

        const clonedTexture = this.letterTexture.clone();
        const letterGeometry = new THREE.PlaneGeometry(letterWidth, letterHeight);
        const letterMaterial = new THREE.MeshBasicMaterial({ map: clonedTexture, transparent: true });
        const letterMesh = new THREE.Mesh(letterGeometry, letterMaterial);

        letterMesh.material.map.offset.set(u, v);

        letterMesh.scale.set(
            this.spriteScale,
            this.spriteScale,
            this.spriteScale
        );


        return letterMesh;
    }

    /**
     * Creates the text that will be added to the HUD
     * @param {*} text 
     * @param {*} dimensions 
     * @returns 
     */
    createText(text, dimensions = [0.5, 0.8]) {

        const textGroup = new THREE.Group();
    
        const letterWidth = dimensions[0];
        const letterHeight = dimensions[1]; 
    
        for (let i = 0; i < text.length; i++) {
            const letterMesh = this.createLetterMesh(text[i], [letterWidth, letterHeight]);
            // Adjust the position to reduce the spacing between the letters
            letterMesh.position.x = (i * letterWidth * this.spacing) - (dimensions[0] * this.spacing / 2) + (letterWidth * this.spacing / 2);
            textGroup.add(letterMesh);
        }
    

        this.add(textGroup);
        return textGroup;
    }
    

    /**
     * When the text is updated, the old text is removed and the new text is created
     * This happens when the player is writing their name
     * @param {*} updatedText 
     */
    update(updatedText) {
        this.totalText += updatedText;
        //Text has to be string and cannot be undefined, otherwise it will raise an error
        if (typeof updatedText === 'string' && updatedText !== "") {
            this.createText(updatedText);
        }
    }
    
}

export { LettersComponent };
