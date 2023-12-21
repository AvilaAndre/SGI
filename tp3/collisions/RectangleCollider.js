import * as THREE from "three";
import { Collider } from "./Collider.js";

/**
 * This class represents a base collider
 */
class RectangleCollider extends Collider {
    /**
     *
     * @param {THREE.Object3D} parent the parent's position
     * @param {THREE.Vector2} center the collider position
     * @param {number} width
     * @param {number} height
     */
    constructor(parent, center, width, height) {
        super(parent, center);

        this.width = width;
        this.height = height;

        this.type = "rectangle";
    }

    getDebugObject() {
        if (this.debugObject) {
            return this.debugObject;
        }

        this.debugObject = new THREE.Object3D();

        this.debugObject.add(
            new THREE.Mesh(
                new THREE.BoxGeometry(this.width, 1, this.height),
                new THREE.MeshBasicMaterial({
                    color: new THREE.Color(0, 1, 0),
                    opacity: 0.6,
                    transparent: true,
                })
            )
        );

        this.debugObject.rotation.set(...this.parent.rotation);

        this.debugObject.position.set(
            ...this.parent.position
                .clone()
                .add(this.center)
                .add(new THREE.Vector3(0, 5, 0))
        );

        return this.debugObject;
    }

    updateDebugObject() {
        if (this.debugObject) {
            this.debugObject.rotation.set(...this.parent.rotation);

            this.debugObject.position.set(
                ...this.parent.position
                    .clone()
                    .add(this.center)
                    .add(new THREE.Vector3(0, 5, 0))
            );
        }
    }
}

export { RectangleCollider };
