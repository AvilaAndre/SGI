import * as THREE from "three";
import { GameManager } from "./GameManager.js";
import { MyContents } from "../MyContents.js";
/**
 * This class contains methods of  the game
 */
class GameState {
    /**
     *
     * @param {MyContents} contents the contents object
     * @param {GameManager} manager the manager object
     */
    constructor(contents, manager) {
        this.contents = contents;
        this.manager = manager;
    }

    /**
     *
     * @param {number} delta time passed between the previous frame
     */
    update(delta) {}
}

export { GameState };
