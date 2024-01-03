import * as THREE from "three";

/**
 * This class contains methods of  the game
 */
class HudComponent extends THREE.Object3D {
    /**
     * Is a part of the HUD displayed to the user
     * @param {THREE.Vector2} position position on screen
     * @param {number} spriteScale component spriteScale on screen
     * @param {function} valueGetter method that gets the value for this component
     * @param {any} initialValue
     */
    constructor(position, spriteScale, valueGetter, initialValue) {
        super();
        this.type = "Group";

        this.position.set(position.x, position.y, 0);
        this.spriteScale = spriteScale;
        this.valueGetter = valueGetter;
        this.value = initialValue;
    }

    /**
     * Updates this component
     */
    update() {
        if (this.valueGetter) {
            this.setValue(this.valueGetter());
        }
    }

    /**
     * Sets the component's value as the given
     * @param {*} newValue
     */
    setValue(newValue) {
        this.value = newValue;
    }

    /**
     * returns the value this hud component displays
     * @returns {*}
     */
    getValue() {
        return this.value;
    }
}

HudComponent.prototype.isGroup = true;

export { HudComponent };
