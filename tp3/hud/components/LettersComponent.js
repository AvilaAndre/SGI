import * as THREE from "three";
import { HudComponent } from "../HudComponent.js";

/**
 * This class contains methods of  the game
 */
class LettersComponent extends HudComponent {
    #nLetters = 1;
    #sprites = [];

    /**
     *
     * @param {THREE.Vector2} position
     * @param {number} spriteScale
     * @param {function} valueGetter gets the value for this component
     * @param {number} initialValue
     * @param {number} nLetters the ammount of Letters
     */
    constructor(position, spriteScale, valueGetter, initialValue, nLetters) {
        super(position, spriteScale, valueGetter, initialValue);

        this.#nLetters = nLetters;
        this.setValue(this.value);

        // Load the texture
        const lettersTexture = new THREE.TextureLoader().load(
            "scenes/scene1/textures/letters.png"
        );

        // Calculate the width of a single sprite on the spritesheet
        const spriteWidth = 1 / 24; // There are 10 sprites in the spritesheet

        // Create a loop to instantiate three sprites with different offsets
        for (let i = 0; i < nLetters; i++) {
            const texture = lettersTexture.clone();
            // Create a new sprite material for each sprite
            const material = new THREE.SpriteMaterial({ map: texture });

            // Calculate the offset for each sprite
            const offset = 1 / 24;

            // Set the horizontal repeat to the sprite's width (in proportion to the whole image)
            texture.repeat.set(spriteWidth, 1);

            // Use the offset to select a specific sprite
            texture.offset.x = offset;

            // Create the sprite
            const sprite = new THREE.Sprite(material);
            sprite.scale.set(
                this.spriteScale,
                this.spriteScale,
                this.spriteScale
            );

            // Set the position of each sprite
            sprite.position.set(
                (i - Math.floor(nLetters / 2)) * this.spriteScale -
                    (this.nLetters % 2 == 1 ? this.spriteScale / 2 : 0),
                0,
                0
            ); // Adjust the position based on your requirements

            // store in an array to manipulate later
            this.#sprites.push(sprite);

            // Add the sprite to the scene
            this.add(sprite);
        }
    }

    /**
     * Updates this component
     */
    update() {
        if (this.valueGetter) {
            this.setValue(this.valueGetter());
        }

        for (let i = 0; i < this.#sprites.length; i++) {
            const sprite = this.#sprites[i];

            const spriteNumber = parseInt(this.value[i]);

            sprite.material.map.offset.x = spriteNumber / 10;
        }
    }

    setValue(newValue) {
        this.value = Math.floor(newValue)
            .toString()
            .padStart(this.#nLetters, "0") // guarantees at least nLetters letters
            .slice(-this.#nLetters); // has a maximum of 3 elements
    }

    getValue() {
        return this.value;
    }
}

export { LettersComponent };
