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
            "titleThird",
            new LettersComponent(
                new THREE.Vector2(-0.5, 0.4),
                0.2,
                () => {},
                "Third Gear",
                5,
                0.1
            )

        );


        this.manager.hud.addComponent(
            "André",
            new LettersComponent(
                new THREE.Vector2(-1, -0.4),
                0.15,
                () => {},
                "Andre",
                5,
                0.1
            )

        );

        this.manager.hud.addComponent(
            "I.",
            new LettersComponent(
                new THREE.Vector2(-0.75, -0.4),
                0.15,
                () => {},
                "I.",
                5,
                0.07
            )

        );

        this.manager.hud.addComponent(
            "Ferraz",
            new LettersComponent(
                new THREE.Vector2(-0.65, -0.4),
                0.15,
                () => {},
                "Ferraz",
                5,
                0.1
            )

        );

        this.manager.hud.addComponent(
            "Avila",
            new LettersComponent(
                new THREE.Vector2(-0.8, -0.5),
                0.15,
                () => {},
                "Avila",
                5,
                0.1
            )

        );

        this.manager.hud.addComponent(
            "Maria",
            new LettersComponent(
                new THREE.Vector2(0.4, -0.4),
                0.15,
                () => {},
                "Maria",
                5,
                0.1
            )

        );

        this.manager.hud.addComponent(
            "Sofia",
            new LettersComponent(
                new THREE.Vector2(0.7, -0.4),
                0.15,
                () => {},
                "Sofia",
                5,
                0.1
            )

        );

        this.manager.hud.addComponent(
            "Goncalves",
            new LettersComponent(
                new THREE.Vector2(0.41, -0.5),
                0.13,
                () => {},
                "Goncalves",
                5,
                0.07
            )

        );

        
    }
}

export { InitialMenuState };

