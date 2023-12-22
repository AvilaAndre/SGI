import * as THREE from "three";
import { GameManager } from "./GameManager.js";
import { MyContents } from "../MyContents.js";
/**
 * This class represents a base collider
 */
class CircleCollider {
    /**
     *
     * @param {THREE.Object3D} parent the parent object
     * @param {THREE.Vector3} center the collider position
     */
    constructor(parent, center, radius) {
        super(parent, center);

        this.radius = radius;
    }
}

export { CircleCollider };
