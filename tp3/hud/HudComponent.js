import * as THREE from "three";

/**
 * This class contains methods of  the game
 */
class HudComponent extends THREE.Object3D {
    /**
     *
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

    setValue(newValue) {
        this.value = newValue;
    }

    getValue() {
        return this.value;
    }
}

HudComponent.prototype.isGroup = true;

export { HudComponent };
