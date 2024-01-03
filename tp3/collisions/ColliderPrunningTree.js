import * as THREE from "three";
import { PTNodeCollider } from "./PruningTreeNodeCollider.js";
import { Collider } from "./Collider.js";

/**
 * This class represents a base collider
 */
class ColliderPruningTree extends Collider {
    /**
     *
     * @param {THREE.Object3D} parent the parent object
     * @param {THREE.Vector2} center the collider position
     */
    constructor() {
        super(null, new THREE.Vector3());
        this.debugObject = null;

        this.type = "pttree";

        this.colliders = [];
        this.collider = null;
    }

    /**
     * Adds collider
     * @param {THREE.Vector3} collider
     */
    addCollider(collider) {
        this.colliders.push(collider);
        this.update();
    }

    /**
     * Returns the collider's type
     * @returns 
     */
    getType() {
        return this.type;
    }

    /**
     * Checks if collides with another collider
     * @param {Collider} collider
     */
    collide(collider) {
        if (this.collider == null) return null;

        return this.collider.collide(collider);
    }

    /**
     * Gets a debug object
     * @returns {THREE.Object3D} the debug object
     */
    getDebugObject() {
        console.log("Called DEBUG Object on collider");
        return null;
    }

    /**
     * Updates the collider
     */
    update() {
        let colliders = this.colliders;

        while (colliders.length > 1) {
            const pairs = this.intoPairs(colliders);

            // merge pairs
            colliders = [];
            for (let j = pairs.length - 1; j >= 0; j--) {
                const elementA = pairs[j];
                if (!elementA.second) {
                    colliders.push(elementA.first);
                } else {
                    const newCollider = new PTNodeCollider(
                        elementA.first,
                        elementA.second
                    );

                    colliders.push(newCollider);
                }
            }
        }

        if (colliders.length) {
            this.collider = colliders[0];
        } else {
            this.colliders = null;
        }
    }

    /**
     * 
     * @param {*} colliders 
     * @returns 
     */
    intoPairs(colliders) {
        const pairs = [];

        const indexesLeft = [];

        for (let i = 0; i < colliders.length; i++) {
            indexesLeft.push(i);
        }

        while (indexesLeft.length > 1) {
            const first = indexesLeft[0];

            // find closest element next to the first element
            const outElement = colliders[first];

            let smallestIndexLeft = first;
            let smallestFromArray = 0;
            let smallestDistance = Infinity;
            for (let j = 0; j < indexesLeft.length; j++) {
                const indexLeft = indexesLeft[j];
                if (first == indexLeft) continue;
                const inElement = colliders[indexLeft];

                if (
                    outElement
                        .getPosition()
                        .distanceTo(inElement.getPosition()) < smallestDistance
                ) {
                    smallestDistance = outElement
                        .getPosition()
                        .distanceTo(inElement.getPosition());
                    smallestIndexLeft = indexLeft;
                    smallestFromArray = j;
                }
            }

            indexesLeft.splice(smallestFromArray, 1);
            indexesLeft.splice(0, 1);

            pairs.push({
                first: colliders[first],
                second: colliders[smallestIndexLeft],
            });
        }

        if (indexesLeft.length > 0)
            pairs.push({ first: colliders[indexesLeft[0]] });

        return pairs;
    }

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

export { ColliderPruningTree };
