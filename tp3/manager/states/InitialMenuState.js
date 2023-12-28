import * as THREE from "three";
import { GameState } from "../GameState.js";
import { PickingManager } from "../PickingManager.js";
import { LettersComponent } from "../../hud/components/LettersComponent.js";
/**
 * This class contains methods of  the game
 */
class InitialMenuState extends GameState {

    constructor(contents, manager) {

        super(contents, manager);
        this.createHud();
    }

    update(delta) {
        
    }

    createHud(){
        console.log("creating hud!");
        this.manager.hud.addComponent(
            "title",
            new LettersComponent(
                new THREE.Vector2(0, 0),
                0.1,
                () => {},
                "Third Gear",
                10
            )

        );
    }
}

export { InitialMenuState };

