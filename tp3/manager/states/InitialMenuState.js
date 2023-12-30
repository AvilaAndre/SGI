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


        this.pickingManager = new PickingManager(
            this.contents,
            ["startButton","easyButton","mediumButton","hardButton"]
        );

        this.textToBeWritten = "";

        this.nameChosen = false;
        this.difficultyChosen = false;


        this.lastClickedButtonMaterialId = null; // To store the material ID of the last clicked button

        this.createHud();

        // Bind the input method to this instance
        this.boundInputHandler = this.input.bind(this);

        // Set up the event listener
        document.addEventListener('keydown', this.boundInputHandler);
        

    }

    update(delta) {}

    onExit() {
        // Remove the event listener
        document.removeEventListener('keydown', this.boundInputHandler);
    }
    

    input() {
    
        const letterRegex = /^[a-zA-Z ]$/;
    
        //document.addEventListener('keydown', (event) => {
            const x = event.key;
    
            if (letterRegex.test(x)) {
                this.nameChosen = true;
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
        //});
    }
    
    

    onPointerClick(event) {

        const buttonPicked = this.pickingManager.getNearestObject(event)?.name;


        if (["easyButton", "mediumButton", "hardButton"].includes(buttonPicked)) {
            this.handleButtonTextureChange(buttonPicked);
        }


        if (buttonPicked == "easyButton") {
            this.difficultyChosen = true;
            this.manager.difficulty = 1;

        } else if (buttonPicked == "mediumButton") {
            this.difficultyChosen = true;
            this.manager.difficulty = 2;

        } else if (buttonPicked == "hardButton") {
            this.difficultyChosen = true;
            this.manager.difficulty = 3;

        }



        if(this.manager.hud.getComponent("generalWarning")){
            this.manager.hud.removeComponent("generalWarning");
        } else if(this.manager.hud.getComponent("difficultyWarning")){ 
            this.manager.hud.removeComponent("difficultyWarning");
        } else if(this.manager.hud.getComponent("nameWarning")){
            this.manager.hud.removeComponent("nameWarning");
        }
        


        if (buttonPicked == "startButton" && this.difficultyChosen && this.nameChosen) {
            this.contents.switchScenes("playerPark");

        } else if (buttonPicked == "startButton" && this.difficultyChosen == false && this.nameChosen){

            this.manager.hud.addComponent(
                "difficultyWarning",
                new LettersComponent(
                    new THREE.Vector2(-0.67, 0.29),
                    0.11,
                    () => {},
                    "A difficulty needs to be defined to play.",
                    5,
                    0.07
                )
            );
        } else if (buttonPicked == "startButton" && this.difficultyChosen && this.nameChosen == false ){

            this.manager.hud.addComponent(
                "nameWarning",
                new LettersComponent(
                    new THREE.Vector2(-0.55, 0.29),
                    0.1,
                    () => {},
                    "A name needs to be defined to play.",
                    5,
                    0.07
                )
            );
        } else if (buttonPicked == "startButton" && this.difficultyChosen == false && this.nameChosen == false){
            this.manager.hud.addComponent(
                "generalWarning",
                new LettersComponent(
                    new THREE.Vector2(-0.8, 0.29),
                    0.1,
                    () => {},
                    "A difficulty and name need to be defined to play.",
                    5,
                    0.07
                )
            );
        }
        
        
    }

   
    handleButtonTextureChange(buttonId) {

        const selectedTextureId = 'black' + buttonId.charAt(0).toUpperCase() + buttonId.slice(1) + 'Tex';
        const defaultTextureId = buttonId + 'Tex';
    

        const materialId = buttonId + 'App';
        const materials = this.contents.materials;
    

        const newTexture = this.contents.textures[selectedTextureId];
    

        if (this.lastClickedButtonMaterialId && this.lastClickedButtonMaterialId !== materialId) {
            const lastButtonId = this.lastClickedButtonMaterialId.replace('App', '');
            const lastDefaultTextureId = lastButtonId + 'Tex';
            const lastDefaultTexture = this.contents.textures[lastDefaultTextureId];
            if (materials[this.lastClickedButtonMaterialId] && lastDefaultTexture) {
                materials[this.lastClickedButtonMaterialId].map = lastDefaultTexture;
                materials[this.lastClickedButtonMaterialId].needsUpdate = true;
            }
        }
    

        if (materials[materialId] && newTexture) {
            materials[materialId].map = newTexture;
            materials[materialId].needsUpdate = true;
        }
    

        this.lastClickedButtonMaterialId = materialId;
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
