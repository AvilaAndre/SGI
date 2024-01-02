import * as THREE from "three";
import { GameState } from "../GameState.js";
import { PickingManager } from "../PickingManager.js";
import { LettersComponent } from "../../hud/components/LettersComponent.js";
import { ButtonsComponent } from "../../hud/components/ButtonsComponent.js";

/**
 * This class contains methods of  the game
 */
class FinalMenuState extends GameState {
    constructor(contents, manager) {
        super(contents, manager);


        this.pickingManager = new PickingManager(
            this.contents,
            ["menuButton","replayButton"]
        );

        console.log("this.manager.totalTime:", this.manager.totalTime)

        this.createHud();


        this.addCarsToScene();

    }

    update(delta) {
        //this.manager.launchFireworks();
    }

    addCarsToScene() {
        const playerCarName = this.manager.playerCar;
        const cpuCarName = this.manager.opponentCar;

        cpuCarName.stopRunAnimation();

        console.log("playerCarName: ", playerCarName);
        console.log("cpuCarName: ", cpuCarName);

        playerCarName.scale.set(2, 2, 2);
        cpuCarName.scale.set(2, 2, 2);

        playerCarName.teleportTo(4, -4, 0);
        cpuCarName.teleportTo(-4, 4, 1.57);

        this.contents.app.scene.add(playerCarName, cpuCarName);
        return;
        
    }
    
    
    

    onPointerClick(event) {

        const buttonPicked = this.pickingManager.getNearestObject(event)?.name;       
        
    }

    onPointerMove(event) {
        this.pickingManager.onPointerMove(event);
    }


    createHud(){
        this.manager.hud.addComponent(
            "difficulty",
            new LettersComponent(
                new THREE.Vector2(-1.05, -0.45),
                0.07,
                () => {},
                "Difficulty: ",
                5,
                0.06
            )
        );

        this.manager.hud.addComponent(
            "difficultyLevel",
            new LettersComponent(
                new THREE.Vector2(-1.05, -0.5),
                0.07,
                () => {},
                this.manager.difficultyLevel,
                5,
                0.06
            )
        );

        this.manager.hud.addComponent(
            "playerTime",
            new LettersComponent(
                new THREE.Vector2(-0.15, -0.45),
                0.07,
                () => {},
                "Player time: ",
                5,
                0.06
            )
        );

        this.manager.hud.addComponent(
            "playerTimeNumber",
            new LettersComponent(
                new THREE.Vector2(-0.15, -0.5),
                0.07,
                () => {},
                this.manager.totalTime.toString() + " secs",
                5,
                0.06
            )
        );

        this.manager.hud.addComponent(
            "opponentTime",
            new LettersComponent(
                new THREE.Vector2(0.65, -0.45),
                0.07,
                () => {},
                "Opponent time: ",
                5,
                0.06
            )
        );

        this.manager.hud.addComponent(
            "opponentTimeNumber",
            new LettersComponent(
                new THREE.Vector2(0.65, -0.5),
                0.07,
                () => {},
                "(tempo)" + " secs",
                5,
                0.06
            )
        );

        this.manager.hud.addComponent(
            "winner",
            new LettersComponent(
                new THREE.Vector2(-0.15, -0.25),
                0.07,
                () => {},
                "(nome)" + "WON!",
                5,
                0.06
            )
        );

        this.manager.hud.addComponent(
            "loser",
            new LettersComponent(
                new THREE.Vector2(-0.15, -0.35),
                0.04,
                () => {},
                "nome" + " lost...",
                5,
                0.06
            )
        );

        this.manager.hud.addComponent(
            "menuButton",
            new ButtonsComponent(
                new THREE.Vector2(-0.25, -0.1),
                0.1,
                "menuButton.png"
            )
        );

        this.manager.hud.addComponent(
            "replayButton",
            new ButtonsComponent(
                new THREE.Vector2(0.25, -0.1),
                0.1,
                "replayButton.png"
            )
        );
    }
}

export { FinalMenuState };
