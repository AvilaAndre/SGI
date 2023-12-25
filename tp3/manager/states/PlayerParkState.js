import * as THREE from "three";
import { GameState } from "../GameState.js";
import { PickingManager } from "../PickingManager.js";
/**
 * This class contains methods of  the game
 */
class PlayerParkState extends GameState {
    constructor(contents, manager) {
        super(contents, manager);

        this.pickingManager = new PickingManager(this.contents, [
            "hatchback-pop",
        ]);
    }

    update(delta) {}

    onPointerClick(event) {
        console.log("picked", this.pickingManager.getNearestObject(event));
    }

    onPointerMove(event) {
        this.pickingManager.onPointerMove(event);
    }
}

export { PlayerParkState };
