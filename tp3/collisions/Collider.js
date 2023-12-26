import * as THREE from "three";

/**
 * This class represents a base collider
 */
class Collider {
    /**
     *
     * @param {THREE.Object3D} parent the parent object
     * @param {THREE.Vector3} center the collider position
     */
    constructor(parent, center) {
        this.parent = parent;
        this.center = center;

        this.debugObject = null;

        this.type = "default";
    }

    getType() {
        return this.type;
    }

    getPosition() {
        const parentWorldPosition = new THREE.Vector3();

        this.parent.getWorldPosition(parentWorldPosition);

        return parentWorldPosition.add(this.center);
    }

    /**
     * Checks if collides with another collider
     * @param {Collider} collider
     */
    collide(collider) {
        console.log("collide called in Generic Collider");
        return null;
    }

    getDebugObject() {
        console.log("Called DEBUG Object on collider");
        return null;
    }

    update() {}

    updateDebugObject() {
        if (this.debugObject) {
            this.debugObject.rotation.set(...this.parent.rotation);

            this.debugObject.position.set(
                ...this.parent.position
                    .clone()
                    .add(this.center)
                    .add(new THREE.Vector3(0, 2, 0))
            );
        }
    }
}

export { Collider };
