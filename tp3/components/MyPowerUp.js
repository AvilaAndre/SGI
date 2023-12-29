import * as THREE from "three";
import { instantiateNode } from "../GraphBuilder.js";
import { RectangleCollider } from "../collisions/RectangleCollider.js";
import { MyContents } from "../MyContents.js";

/**
 * This class contains a powerup
 */
class MyPowerUp extends THREE.Object3D {
    #active = false;
    #effects = {
        TOP_SPEED: 0,
        STOP_TIME: 1,
    };

    /**
     *
     * @param {MyContents} contents the contents object
     * @param {Object} data data about the scene
     * @param {THREE.Vector2} position the powerup's position
     */
    constructor(contents, data, position) {
        super();
        this.contents = contents;

        this.object = instantiateNode("powerupCube", data, this.contents);

        this.add(this.object);

        this.position.set(position.x, 0.5, position.y);

        this.contents.manager.collisionManager.addCollider(
            new RectangleCollider(this, new THREE.Vector2(0, 0), 1.25, 1.25),
            true
        );

        this.isPowerup = true;

        this.activate();
    }

    /**
     * Triggers the effect when this powerup is collided with
     */
    trigger() {
        if (!this.#active) return null;

        this.deactivate();

        return this.effect;
    }

    /**
     * Deactivates the powerup
     */
    deactivate() {
        this.visible = false;
        this.#active = false;
    }

    /**
     * Called to reactivate this powerup
     */
    activate() {
        this.effect = Math.floor(
            Math.random() * Object.keys(this.#effects).length
        );

        this.#active = true;
        this.visible = true;
    }
}

MyPowerUp.prototype.isGroup = true;

export { MyPowerUp };
