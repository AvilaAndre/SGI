import * as THREE from "three";
import { GameState } from "../GameState.js";
/**
 * This class contains methods of  the game
 */
class PlayerParkState extends GameState {

    constructor(app, manager) {
        this.app = app;
        this.manager = manager;
    }

    update(delta) {
        //Pôr o addListener aqui

        this.pickingManager = this.app.pickingManager;

        console.log("this.pickingManager: ", this.pickingManager);

        console.log("this.state: ", this.state);
        document.addEventListener("pointermove", this.pickingManager.onPointerMove);
    }
}

export { PlayerParkState };
