import * as THREE from "three";
import { GameState } from "../GameState.js";
import { PickingManager } from "../PickingManager.js";
/**
 * This class contains methods of  the game
 */
class OpponentParkState extends GameState {
    constructor(contents, manager) {
        super(contents, manager);

        const pickableCars = Object.keys(this.manager.cars);

        for (let i = 0; i < pickableCars.length; i++) {
            const element = pickableCars[i];

            if (element == this.contents.manager.playerPickedCar) {
                pickableCars.splice(i, 1);
                break;
            }
        }

        this.pickingManager = new PickingManager(this.contents, pickableCars);

        this.addCarsToScene();
    }

    update(delta) {}

    /**
     * Called when a click event happens.
     * Defines which car was chosen by the player to be its opponent's and stores this information.
     * @param {*} event 
     */
    onPointerClick(event) {
        const carPicked = this.pickingManager.getNearestObject(event)?.name;

        if (carPicked) {
            this.manager.cpuPickedCar = carPicked;

            this.contents.switchScenes("race");
        }
    }

    /**
     * Called when a pointer move event happens
     * @param {*} event 
     */
    onPointerMove(event) {
        this.pickingManager.onPointerMove(event);
    }

    /**
     * Adds every available car to the scene
     */
    addCarsToScene() {
        const carNames = Object.keys(this.manager.cars);

        for (let i = 0; i < carNames.length; i++) {
            const car = this.manager.cars[carNames[i]];

            if(car.name != this.contents.manager.playerPickedCar){
                car.position.set(3 * (i - Math.floor(carNames.length / 2)), 0, 0);

                this.contents.app.scene.add(car);
            }
            
        }
    }
}

export { OpponentParkState };
