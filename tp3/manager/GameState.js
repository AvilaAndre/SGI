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

        this.paused = false;
    }

    /**
     * Called when this state was not the active one but was assigned again
     */
    restored() {}

    /**
     *
     * @param {number} delta time passed between the previous frame
     */
    update(delta) {}

    /**
     * Paused the current state
     */
    pause() {
        this.paused = true;
    }

    /**
     * Resumes the current state
     */
    resume() {
        this.paused = false;
    }

    /**
     * Called when a click event happens
     */
    onPointerClick(event) {}

    /**
     * Called when a pointer move event happens
     */
    onPointerMove(event) {}

    /**
     * Called when this state is being replaced
     */
    onExit() {}
}

export { GameState };
