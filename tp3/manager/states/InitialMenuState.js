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
            ["startButton","easyButton","mediumButton","hardButton"]
        );

        this.textToBeWritten = "";

        this.createHud();
        this.input();
    }

    update(delta) {}

    input() {
        console.log("this.manager.state:", this.manager.state)
        
        
        console.log("input");
    
        const letterRegex = /^[a-zA-Z ]$/;
    
        document.addEventListener('keydown', (event) => {
            const x = event.key;
    
            if (letterRegex.test(x)) {
                this.textToBeWritten += x;
            } else if (x === 'Backspace') {
                this.textToBeWritten = this.textToBeWritten.slice(0, -1);
            } else {
                return;
            }

            if(this.textToBeWritten.length > 17){
                return;
            }

            this.contents.playerName = this.textToBeWritten;
    
    
            this.manager.hud.removeComponent("playerInput");
            this.manager.hud.addComponent(
                "playerInput",
                new LettersComponent(
                    new THREE.Vector2(0.3, 0),
                    0.15,
                    () => {},
                    this.textToBeWritten,
                    5,
                    0.1
                )
            );
        });
    }
    
    

    onPointerClick(event) {

        const buttonPicked = this.pickingManager.getNearestObject(event)?.name;


        if (buttonPicked == "startButton") {
            this.contents.switchScenes("playerPark");

        } else if (buttonPicked == "easyButton") {
            this.manager.difficulty = 1;

        } else if (buttonPicked == "mediumButton") {
            this.manager.difficulty = 2;

        } else if (buttonPicked == "hardButton") {
            this.manager.difficulty = 3;

        }
    }

    onPointerMove(event) {
        this.pickingManager.onPointerMove(event);
    }


    createHud(){
        this.manager.hud.addComponent(
            "titleThird",
            new LettersComponent(
                new THREE.Vector2(-0.2, 0.4),
                0.2,
                () => {},
                "Third Gear",
                5,
                0.1
            )

        );

        this.manager.hud.addComponent(
            "Difficulty",
            new LettersComponent(
                new THREE.Vector2(-0.99, 0.2),
                0.11,
                () => {},
                "Choose difficulty:",
                5,
                0.06
            )

        );


        this.manager.hud.addComponent(
            "AndreIFerraz",
            new LettersComponent(
                new THREE.Vector2(-1, -0.4),
                0.15,
                () => {},
                "Andre I. Ferraz",
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
            "MariaSofia",
            new LettersComponent(
                new THREE.Vector2(0.4, -0.4),
                0.15,
                () => {},
                "Maria Sofia",
                5,
                0.1
            )

        );

        this.manager.hud.addComponent(
            "Goncalves",
            new LettersComponent(
                new THREE.Vector2(0.45, -0.5),
                0.15,
                () => {},
                "Goncalves",
                5,
                0.1
            )

        );

        this.manager.hud.addComponent(
            "playerName",
            new LettersComponent(
                new THREE.Vector2(0.27, 0.1),
                0.11,
                () => {},
                "Player Name (type anywhere):",
                5,
                0.06
            )

        );

        this.manager.hud.addComponent(
            "playerInput",
            new LettersComponent(
                new THREE.Vector2(0.3, 0),
                0.15,
                () => {},
                "",
                5,
                0.1
            )

        );

        
    }
}

export { InitialMenuState };

