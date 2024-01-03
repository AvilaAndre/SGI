import * as THREE from "three";
import { AABB } from "./AABB.js";
import { Collider } from "./Collider.js";

/**
 * This class represents a base collider
 */
class PTNodeCollider extends Collider {
    /**
     * Creates a collider by combining two colliders into a single AABB collider that contains both
     * This means that colliderA and colliderB are intersected only if the result of their merge also is
     * @param {Collider} colliderA
     * @param {Collider} colliderB
     * @param {THREE.Vector3} position
     */
    constructor(colliderA, colliderB) {
        super(null, new THREE.Vector3(0, 0, 0));
        this.colliderA = colliderA;
        this.colliderB = colliderB;

        this.position = colliderA
            .getPosition()
            .clone()
            .add(
                colliderB
                    .getPosition()
                    .clone()
                    .sub(colliderA.getPosition())
                    .divideScalar(2)
            );

        this.aabb = new AABB(
            Math.min(colliderA.aabb.minX, colliderB.aabb.minX),
            Math.max(colliderA.aabb.maxX, colliderB.aabb.maxX),
            Math.min(colliderA.aabb.minY, colliderB.aabb.minY),
            Math.max(colliderA.aabb.maxY, colliderB.aabb.maxY)
        );

        this.type = "ptnode";
    }

    getPosition() {
        return this.position;
    }

    getType() {
        return this.type;
    }

    /**
     * Checks if collides with another collider
     * @param {Collider} collider
     */
    collide(otherCollider) {
        if (otherCollider == this) {
            console.error("Checking collisions for the same colliders");
            return null;
        }
        switch (otherCollider.type) {
            case "rectangle": {
                // Check AABB first
                if (this.aabb.intersect(otherCollider.aabb)) {
                    const collisionWithA =
                        this.colliderA.collide(otherCollider);
                    if (collisionWithA) {
                        return collisionWithA;
                    } else {
                        return this.colliderB.collide(otherCollider);
                    }
                }

                return null;
            }

            default: {
                console.warn(
                    "PruningTreeNodeCollider does not collide with",
                    otherCollider.type
                );
                return null;
            }
        }
    }
}

export { PTNodeCollider };
