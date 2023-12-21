import * as THREE from "three";
import { RaceState } from "./states/RaceState.js";
import { GameState } from "./GameState.js";
import { KeyboardManager } from "./KeyboardManager.js";
import { MyCar } from "../MyCar.js";
import { MyContents } from "../MyContents.js";
import { CollisionManager } from "./CollisionManager.js";
/**
 * This class contains and manages information about the game
 */
class GameManager {
    /**
     *
     * @param {MyContents} contents the contents object
     */
    constructor(contents) {
        this.contents = contents;
        this.state = new RaceState(this.contents, this); // FIXME: We do not start in race state
        this.keyboard = new KeyboardManager();
        this.collisionManager = new CollisionManager(this.contents);

        this.cars = [];

        this.car = null;
    }

    /**
     *
     * @param {GameState} state
     */
    setState(state) {
        switch (state) {
            case "race":
                this.state = new RaceState(this.contents, this);
                break;

            default:
                this.state = new GameState(this.contents, this);
                break;
        }
        this.state = state;
    }

    update(delta) {
        this.state.update(delta);
        this.keyboard.update();
    }

    /**
     *
     * @param {MyCar} car
     */

    addCar(car) {
        this.cars.push(car);

        this.car = car; // FIXME: Remove this when car selection is done
        this.car.activateLights();

        this.contents.app.scene.add(this.car);
    }

    changeCarCamera() {
        let i;
        for (i = 0; i < this.car.cameras.length; i++) {
            const camInfo = this.car.cameras[i];

            if (this.contents.app.activeCameraName == camInfo.id) {
                break;
            }
        }

        if (i === this.car.cameras.length) {
            i = 0;
        } else {
            i = ++i % this.car.cameras.length;
        }

        this.contents.app.activeCameraName = this.car.cameras[i].id;
    }
}

export { GameManager };
