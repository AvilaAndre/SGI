import { MyContents } from "../MyContents.js";
import { Collider } from "../collisions/Collider.js";

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
        this.staticColliders = [];
        this.dynamicColliders = [];
    }

    /**
     *
     * @param {Collider} collider
     * @param {boolean} isStatic signals if an object needs updating or not
     */
    addCollider(collider, isStatic = false) {
        if (isStatic) this.staticColliders.push(collider);
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

        this.staticColliders.forEach((element) => {
            element.updateDebugObject();
        });
    }

    /**
     *
     * @param {Collider} collider
     * @returns {Collider} null if does not collide with another collider
     */
    checkCollisions(collider) {
        for (let colIdx = 0; colIdx < this.colliders.length; colIdx++) {
            const otherCollider = this.colliders[colIdx];
            if (otherCollider == collider) continue;
            if (collider.collide(otherCollider)) return otherCollider;
        }

        return null;
    }
}

export { CollisionManager };
