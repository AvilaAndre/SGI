import * as THREE from "three";
import { GameState } from "../GameState.js";
/**
 * This class contains methods of  the game
 */
class PickObstacleState extends GameState {
    update(delta) {
        console.log("this.state: ", this.state);
    }
}

export { PickObstacleState };
