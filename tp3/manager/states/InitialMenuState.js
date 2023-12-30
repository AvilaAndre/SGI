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

        this.nameChosen = false;
        this.difficultyChosen = false;


        this.originalButtonColors = {
            "easyButtonApp": new THREE.Color(), // Placeholder for the original color
            "mediumButtonApp": new THREE.Color(), // Placeholder for the original color
            "hardButtonApp": new THREE.Color() // Placeholder for the original color
        };

        console.log("this.originalButtonColors:", this.originalButtonColors);

        // Load the original colors from the materials
        for (let id in this.originalButtonColors) {
            if (contents.materials[id]) {
                this.originalButtonColors[id].copy(contents.materials[id].color);
            }
        }

        this.clickedButtonColor = new THREE.Color(0xffffff); // Highlight color for clicked button
        this.lastClickedButtonMaterialId = null; // To store the material ID of the last clicked button

        this.createHud();

        // Bind the input method to this instance
        this.boundInputHandler = this.input.bind(this);

        // Set up the event listener
        document.addEventListener('keydown', this.boundInputHandler);

        console.log("this.contents:", this.contents);
        

    }

    update(delta) {}

    onExit() {
        // Remove the event listener
        document.removeEventListener('keydown', this.boundInputHandler);
    }
    

    input() {
        console.log("this.manager.state:", this.manager.state)
        
        
        console.log("input");
    
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

        console.log("this.contents.materials:", this.contents.materials);


        if (["easyButton", "mediumButton", "hardButton"].includes(buttonPicked)) {
            this.handleButtonTextureChange(buttonPicked);
        }

        console.log("buttonPicked:", buttonPicked);

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
            console.log("startButton pressed and everything good");
            this.contents.switchScenes("playerPark");

        } else if (buttonPicked == "startButton" && this.difficultyChosen == false && this.nameChosen){
            console.log("startButton pressed and difficulty not chosen");
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
            console.log("startButton pressed and name not chosen");
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
        // Construct the texture IDs based on the buttonId
        const selectedTextureId = 'black' + buttonId.charAt(0).toUpperCase() + buttonId.slice(1) + 'Tex';
        const defaultTextureId = buttonId + 'Tex';
    
        // Construct the material ID based on the buttonId
        const materialId = buttonId + 'App';
        const materials = this.contents.materials;
    
        // Get the new texture for the clicked button
        const newTexture = this.contents.textures[selectedTextureId];
    
        // If another button was previously selected, revert its texture to its own default
        if (this.lastClickedButtonMaterialId && this.lastClickedButtonMaterialId !== materialId) {
            const lastButtonId = this.lastClickedButtonMaterialId.replace('App', '');
            const lastDefaultTextureId = lastButtonId + 'Tex';
            const lastDefaultTexture = this.contents.textures[lastDefaultTextureId];
            if (materials[this.lastClickedButtonMaterialId] && lastDefaultTexture) {
                materials[this.lastClickedButtonMaterialId].map = lastDefaultTexture;
                materials[this.lastClickedButtonMaterialId].needsUpdate = true;
            }
        }
    
        // Apply the new texture to the material of the currently clicked button
        if (materials[materialId] && newTexture) {
            materials[materialId].map = newTexture;
            materials[materialId].needsUpdate = true;
        }
    
        // Update the last clicked button material ID
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

