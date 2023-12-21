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
    }

    /**
     *
     * @param {Collider} collider
     */
    addCollider(collider) {
        this.colliders.push(collider);

        // DEBUG
        this.contents.app.scene.add(collider.getDebugObject());
    }

    update(_delta) {
        this.colliders.forEach((element) => {
            element.updateDebugObject();
        });
    }
}

export { CollisionManager };
