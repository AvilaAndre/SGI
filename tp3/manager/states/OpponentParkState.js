import * as THREE from "three";
import { GameState } from "../GameState.js";
import { PickingManager } from "../PickingManager.js";
/**
 * This class contains methods of  the game
 */
class OpponentParkState extends GameState {

    constructor(contents, manager) {

        super(contents, manager);
        this.pickingManager = this.contents.pickingManager;
        
    }

    update(delta) {
        //Pôr o addListener aqui
        this.pickingManager.setState("pickingPlayer");
        document.addEventListener("pointermove", this.pickingManager.onPointerMove);
        this.manager.launchFireworks();
    }
}

export { OpponentParkState };
