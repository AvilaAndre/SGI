import * as THREE from "three";
import { GameState } from "../GameState.js";
/**
 * This class contains methods of  the game
 */
class RaceState extends GameState {
    update(delta) {
        if (this.manager.keyboard.isKeyDown("w")) {
            // move car
        }

        if (this.manager.keyboard.isKeyDown("a")) {
            this.manager.car.turnTo(0.5);
        } else if (this.manager.keyboard.isKeyDown("d")) {
            this.manager.car.turnTo(-0.5);
        } else {
            this.manager.car.turnTo(0);
        }
    }
}

export { RaceState };
