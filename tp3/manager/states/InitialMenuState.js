import * as THREE from "three";
import { GameState } from "../GameState.js";
import { PickingManager } from "../PickingManager.js";
import { LettersComponent } from "../../hud/components/LettersComponent.js";
import { ButtonsComponent } from "../../hud/components/ButtonsComponent.js";

/**
 * This class contains methods of  the game
 */
class InitialMenuState extends GameState {

    constructor(contents, manager) {

        super(contents, manager);


        this.pickingManager = new PickingManager(
            this.contents,
            ["startButton"]
        );


        this.createHud();
    }

    update(delta) {
        console.log("update");
        this.input();
        
    }

    input() {
        console.log("input");
        const stringCompare = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    
        document.addEventListener('keydown', (event) => {
            const x = event.key; 

            if (stringCompare.includes(x)) {
                console.log(`input includes ${x}!`);
                this.hudTest = this.manager.hud.getComponent("playerInput");
                console.log("this.hudTest", this.hudTest);
                this.manager.hud.getComponent("playerInput").update(x);
            }
        });
    }
    

    onPointerClick(event) {

        const startPicked = this.pickingManager.getNearestObject(event)?.name;


        if (startPicked) {

            this.contents.switchScenes("playerPark");
        }
    }

    onPointerMove(event) {
        this.pickingManager.onPointerMove(event);
    }


    createHud(){
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

        this.manager.hud.addComponent(
            "playerName",
            new LettersComponent(
                new THREE.Vector2(0.3, 0.1),
                0.11,
                () => {},
                "Player Name:",
                5,
                0.06
            )

        );

        this.manager.hud.addComponent(
            "playerInput",
            new LettersComponent(
                new THREE.Vector2(0.3, 0),
                0.11,
                () => {},
                "",
                5,
                0.07
            )

        );

        
    }
}

export { InitialMenuState };

