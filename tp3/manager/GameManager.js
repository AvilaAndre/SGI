import * as THREE from "three";
import { RaceState } from "./states/RaceState.js";
import { GameState } from "./GameState.js";
import { KeyboardManager } from "./KeyboardManager.js";
import { PlayerParkState } from "./states/PlayerParkState.js";
import { OpponentParkState } from "./states/OpponentParkState.js";
import { PickObstacleState } from "./states/PickObstacleState.js";
import { MyFirework } from "../MyFirework.js";
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
    constructor(contents, app) {
        this.contents = contents;
        this.state = new GameState(this.contents, this);
        this.keyboard = new KeyboardManager();
        this.collisionManager = new CollisionManager(this.contents);

        this.cars = {};
        this.obstacles = {};

        this.playerCar = null;

        this.playerPickedCar = null;
        this.cpuPickedCar = null;

        this.counter = 0;

        //fireworks
        this.app = app;
        this.fireworks = [];

        this.hud = null;

        //this.launchFireworks();
    }

    /**
     *
     * @param {GameState} state
     */
    setState(state) {
        this.oldState = this.state;
        switch (state) {
            case "race":
                this.state = new RaceState(this.contents, this);
                break;
            case "pickingPlayer":
                this.state = new PlayerParkState(this.contents, this);
                break;
            case "pickingOpponent":
                this.state = new OpponentParkState(this.contents, this);
                break;
            case "pickingObstacle":
                this.state = new PickObstacleState(this.contents, this);
                break;

            default:
                this.state = new GameState(this.contents, this);
                break;
        }
    }

    /**
     * Returns to the previously switched state
     */
    rollbackState() {
        if (this.oldState) this.state = this.oldState;
        this.state.restored();
    }

    setHud(newHud) {
        this.hud = newHud;
    }

    update(delta) {
        this.state.update(delta);
        this.keyboard.update();
        this.hud?.update();
    }

    updateCollisions(delta) {
        this.collisionManager.update(delta);
    }

    onPointerClick(event) {
        this.state.onPointerClick(event);
    }

    onPointerMove(event) {
        this.state.onPointerMove(event);
    }

    /**
     *
     * @param {MyCar} car
     */
    addCar(car) {
        this.cars[car.carName] = car;
    }

    selectPlayerCar(idx) {
        if (!Object.keys(this.cars).includes(idx)) return;
        this.playerCar = this.cars[idx];
        this.playerCar.activateLights();
        this.contents.app.scene.add(this.playerCar);

        this.collisionManager.addCollider(this.playerCar.collider);
    }

    selectOpponentCar(idx) {
        if (!Object.keys(this.cars).includes(idx)) return;
        this.opponentCar = this.cars[idx];
        this.contents.app.scene.add(this.opponentCar);

        this.collisionManager.addCollider(this.opponentCar.collider);
    }

    changeCarCamera() {
        let i;
        for (i = 0; i < this.playerCar.cameras.length; i++) {
            const camInfo = this.playerCar.cameras[i];

            if (this.contents.app.activeCameraName == camInfo.id) {
                break;
            }
        }

        if (i === this.playerCar.cameras.length) {
            i = 0;
        } else {
            i = ++i % this.playerCar.cameras.length;
        }

        this.contents.app.activeCameraName = this.playerCar.cameras[i].id;
    }

    //When there is a winner, go to a new state (something like WinnerState) and call this function to start the fireworks
    launchFireworks() {
        this.counter++;
        // add new fireworks every 5% of the calls
        if (Math.random() < 0.05) {
            this.fireworks.push(new MyFirework(this.app, this.contents));
            // console.log("firework added");
        }

        // for each fireworks
        for (let i = 0; i < this.fireworks.length; i++) {
            // is firework finished?
            if (this.fireworks[i].done) {
                // remove firework
                this.fireworks.splice(i, 1);
                // console.log("firework removed");
                continue;
            }
            // otherwise updates firework
            this.fireworks[i].update();
        }
    }

    /**
     * Resets GameManager properties that do not cross scenes
     */
    reset() {
        this.collisionManager = new CollisionManager(this.contents);
        this.obstacles = [];
    }
}

export { GameManager };
