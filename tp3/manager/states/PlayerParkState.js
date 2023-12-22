import * as THREE from "three";
import { GameState } from "../GameState.js";
import { PickingManager } from "../PickingManager.js";
/**
 * This class contains methods of  the game
 */
class PlayerParkState extends GameState {

    constructor(contents, manager) {

        super(contents, manager);
        this.pickingManager = this.contents.pickingManager;
        
    }

    update(delta) {
        //Pôr o addListener aqui
        console.log("this.pickingManager: ", this.pickingManager);
        this.pickingManager.setState("pickingPlayer");
        console.log("this no update dentro do estado: ", this);
        document.addEventListener("pointermove", this.pickingManager.onPointerMove);
        this.manager.launchFireworks();
    }
}

export { PlayerParkState };
