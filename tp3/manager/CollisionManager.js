import { MyContents } from "../MyContents.js";
import { Collider } from "../collisions/Collider.js";
import { ColliderPruningTree } from "../collisions/ColliderPrunningTree.js";

/**
 * This class contains and manages information about the keyboard
 */
class CollisionManager {
    /**
     *
     * @param {MyContents} contents
     */
    constructor(contents) {
        this.contents = contents;

        this.colliders = [];
        this.staticColliders = new ColliderPruningTree();
        this.dynamicColliders = [];
    }

    /**
     *
     * @param {Collider} collider
     * @param {boolean} isStatic signals if an object needs updating or not
     */
    addCollider(collider, isStatic = false) {
        if (isStatic) this.staticColliders.addCollider(collider);
        else this.dynamicColliders.push(collider);

        this.colliders.push(collider);

        // DEBUG
        this.contents.app.scene.add(collider.getDebugObject());
    }

    update(_delta) {
        this.dynamicColliders.forEach((element) => {
            element.update();
            element.updateDebugObject();
        });

        this.staticColliders.colliders.forEach((element) => {
            element.updateDebugObject();
        });
    }

    /**
     *
     * @param {Collider} collider
     * @returns {Collider} null if does not collide with another collider
     */
    checkCollisions(collider) {
        // Check for static collisions first
        const staticCollisionResult = this.staticColliders.collide(collider);
        if (staticCollisionResult) return staticCollisionResult;

        // check for dynamic collisions first
        for (let colIdx = 0; colIdx < this.dynamicColliders.length; colIdx++) {
            const otherCollider = this.dynamicColliders[colIdx];
            if (otherCollider == collider) continue;
            if (collider.collide(otherCollider)) return otherCollider;
        }

        return null;
    }
}

export { CollisionManager };
