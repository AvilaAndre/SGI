import * as THREE from 'three';
import { HudComponent } from '../HudComponent.js';

class LettersComponent extends HudComponent {
    #totalLetters = 1;
    #letterMeshes = [];

    constructor(position, scale, getValue, initialText, letterCount, spacing) {
        super(position, scale, getValue, initialText);

        this.spacing = spacing;

        this.spriteScale = scale; // Assuming scale is the intended sprite scale


        this.letterTexture = new THREE.TextureLoader().load("scenes/scene1/textures/sprite_sheet_monospaced_black.png");
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

    calculateUVForChar(char) {
        const asciiValue = char.charCodeAt(0) - 32;
        const uCoord = (asciiValue % this.colsInTexture) * this.uSize;
        const vCoord = (this.rowsInTexture - 1 - Math.floor(asciiValue / this.colsInTexture)) * this.vSize;


        return [uCoord, vCoord];
    }

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

    createText(text, dimensions = [text.length/10, 0.8]) {

        const textGroup = new THREE.Group();
    
        const letterWidth = dimensions[0];
        const letterHeight = dimensions[1];
        //const spacingFactor = 0.7; 
    
        for (let i = 0; i < text.length; i++) {
            const letterMesh = this.createLetterMesh(text[i], [letterWidth, letterHeight]);
            // Adjust the position to reduce spacing
            letterMesh.position.x = (i * letterWidth * this.spacing) - (dimensions[0] * this.spacing / 2) + (letterWidth * this.spacing / 2);
            textGroup.add(letterMesh);
        }
    

        this.add(textGroup);
        return textGroup;
    }
    

    update(updatedText) {
        console.log("updatedText", updatedText);
        this.totalText += updatedText;
        // Check if updatedText is a non-empty string
        if (typeof updatedText === 'string' && updatedText !== "") {
            this.createText(updatedText);
        }
    }
    
}

export { LettersComponent };
