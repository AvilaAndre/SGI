import * as THREE from "three";
import { MyApp } from "../MyApp.js";
import { GameManager } from "./GameManager.js";
/**
 * This class contains methods of  the game
 */
class GameState {
    /**
     *
     * @param {MyApp} app the application object
     * @param {GameManager} manager the manager object
     */
    constructor(app, manager) {
        this.app = app;
        this.manager = manager;
    }

    update(delta) {}
}

export { GameState };
