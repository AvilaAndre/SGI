import * as THREE from "three";
import { GameState } from "../GameState.js";
import { PickingManager } from "../PickingManager.js";
import { LettersComponent } from "../../hud/components/LettersComponent.js";

/**
 * This class contains methods of  the game
 */
class FinalMenuState extends GameState {
    constructor(contents, manager) {
        super(contents, manager);


        this.pickingManager = new PickingManager(
            this.contents,
            ["startButton","easyButton","mediumButton","hardButton"]
        );

       

    }

    update(delta) {}
    

    onPointerClick(event) {

        const buttonPicked = this.pickingManager.getNearestObject(event)?.name;       
        
    }

    onPointerMove(event) {
        this.pickingManager.onPointerMove(event);
    }


    createHud(){
        
    }
}

export { FinalMenuState };
