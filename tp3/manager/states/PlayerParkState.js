import * as THREE from "three";
import { GameState } from "../GameState.js";
import { PickingManager } from "../PickingManager.js";
/**
 * This class contains methods of  the game
 */
class PlayerParkState extends GameState {
    constructor(contents, manager) {
        super(contents, manager);

        this.pickingManager = new PickingManager(
            this.contents,
            Object.keys(this.manager.cars)
        );

        this.addCarsToScene();
    }

    update(delta) {}

    onPointerClick(event) {
        const carPicked = this.pickingManager.getNearestObject(event)?.name;

        if (carPicked) {
            this.manager.playerPickedCar = carPicked;

            this.contents.switchScenes("race");
        }
    }

    onPointerMove(event) {
        this.pickingManager.onPointerMove(event);
    }

    addCarsToScene() {
        console.log("Adding Cars");

        const carNames = Object.keys(this.manager.cars);

        const car = this.manager.cars[carNames[0]];

        car.position.set(10, 0, 0);

        this.contents.app.scene.add(car);
        this.contents.app.scene.add(this.manager.cars[carNames[1]]);

        for (let i = 0; i < carNames.length; i++) {
            const car = this.manager.cars[carNames[i]];

            car.position.set(4 * (i - Math.floor(carNames.length / 2)), 0, 0);

            this.contents.app.scene.add(car);
        }
    }
}

export { PlayerParkState };
