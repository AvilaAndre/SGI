import * as THREE from 'three';
import { HudComponent } from '../HudComponent.js';

class LettersComponent extends HudComponent {
    #totalLetters = 1;
    #letterMeshes = [];

    constructor(position, scale, getValue, initialText, letterCount) {
        super(position, scale, getValue, initialText);

        this.letterTexture = new THREE.TextureLoader().load("scenes/scene1/textures/sprite_sheet_black.png");
        const textureWidth = 1020;
        const textureHeight = 1020;
        const singleCharWidth = 102;
        const singleCharHeight = 102;

        this.colsInTexture = textureWidth / singleCharWidth;
        this.rowsInTexture = textureHeight / singleCharHeight;
        this.uSize = 1 / this.colsInTexture;
        this.vSize = 1 / this.rowsInTexture;
        this.letterTexture.repeat.set(this.uSize, this.vSize);

        this.createText(initialText);
    }

    calculateUVForChar(char) {
        const asciiValue = char.charCodeAt(0) - 32;
        const uCoord = (asciiValue % this.colsInTexture) * this.uSize;
        const vCoord = (this.rowsInTexture - 1 - Math.floor(asciiValue / this.colsInTexture)) * this.vSize;

        return [uCoord, vCoord];
    }

    createLetterMesh(char, dimensions = [1, 1]) {
        const [u, v] = this.calculateUVForChar(char);
        const [letterWidth, letterHeight] = dimensions;

        const clonedTexture = this.letterTexture.clone();
        const letterGeometry = new THREE.PlaneGeometry(letterWidth, letterHeight);
        const letterMaterial = new THREE.MeshBasicMaterial({ map: clonedTexture, transparent: true });
        const letterMesh = new THREE.Mesh(letterGeometry, letterMaterial);

        letterMesh.material.map.offset.set(u, v);

        return letterMesh;
    }

    createText(text, dimensions = [1, 1]) {
        console.log("Creating text: ", text);
        const textGroup = new THREE.Group();

        const letterWidth = dimensions[0] / text.length;
        const letterHeight = dimensions[1];

        for (let i = 0; i < text.length; i++) {
            const letterMesh = this.createLetterMesh(text[i], [letterWidth, letterHeight]);
            letterMesh.position.x = i * letterWidth;
            textGroup.add(letterMesh);
        }

        console.log("Text group: ", textGroup);
        this.add(textGroup);
        return textGroup;
    }
}

export { LettersComponent };
