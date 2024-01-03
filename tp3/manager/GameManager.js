import * as THREE from "three";
import { RaceState } from "./states/RaceState.js";
import { GameState } from "./GameState.js";
import { KeyboardManager } from "./KeyboardManager.js";
import { PlayerParkState } from "./states/PlayerParkState.js";
import { OpponentParkState } from "./states/OpponentParkState.js";
import { PickObstacleState } from "./states/PickObstacleState.js";
import { MyFirework } from "../components/MyFirework.js";
import { MyCar } from "../MyCar.js";
import { MyContents } from "../MyContents.js";
import { CollisionManager } from "./CollisionManager.js";
import { InitialMenuState } from "./states/InitialMenuState.js";
import { FinalMenuState } from "./states/FinalMenuState.js";

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

        this.startButton = null;

        // the car objects selected
        this.playerCar = null;
        this.opponentCar = null;

        // the car names selected
        this.playerPickedCar = null;
        this.cpuPickedCar = null;

        this.playerName = null;

        // number of laps around the track by the opponent
        this.opponentLapCount = 0;

        this.counter = 0;

        this.app = app;
        //fireworks
        this.fireworks = [];

        this.hud = null;

        this.totalTime = 0;
    }

    /**
     * Switches the current state
     * @param {GameState} state
     */
    setState(state) {
        if (this.state && this.state.onExit) {
            this.state.onExit();
        }

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

            case "initialMenu":
                this.state = new InitialMenuState(this.contents, this);
                break;

            case "finalMenu":
                this.state = new FinalMenuState(this.contents, this);
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

    /**
     * Sets the current hud as "newHud"
     * @param {MyHud} newHud
     */
    setHud(newHud) {
        this.hud = newHud;
    }

    /**
     * Updates every manager held by this manager with exception for the collisionManager
     * @param {number} delta
     */
    update(delta) {
        this.state.update(delta);
        this.keyboard.update();
        this.hud?.update();
    }

    /**
     * Update the collisions managed by the collision manager
     * @param {number} delta
     */
    updateCollisions(delta) {
        this.collisionManager.update(delta);
    }

    /**
     * Whenever there is a pointer click event
     */
    onPointerClick(event) {
        this.state.onPointerClick(event);
    }

    /**
     * Whenever there is a pointer move event
     */
    onPointerMove(event) {
        this.state.onPointerMove(event);
    }

    /**
     * adds a car to the possible cars in this game
     * @param {MyCar} car
     */
    addCar(car) {
        this.cars[car.carName] = car;
    }

    /**
     * Selects the given car as the player's car and adds it to the scene
     * @param {string} idx
     */
    selectPlayerCar(idx) {
        if (!Object.keys(this.cars).includes(idx)) return;
        this.playerCar = this.cars[idx];
        this.playerCar.activateLights();
        this.contents.app.scene.add(this.playerCar);

        this.collisionManager.addCollider(this.playerCar.collider);
    }

    /**
     * Selects the given car as the opponents car and adds it to the scene
     * @param {string} idx
     */
    selectOpponentCar(idx) {
        if (!Object.keys(this.cars).includes(idx)) return;
        this.opponentCar = this.cars[idx];
        this.contents.app.scene.add(this.opponentCar);

        this.collisionManager.addCollider(this.opponentCar.collider);
    }

    /**
     * Changes the camera the player if currently seeing the scene while following the car from
     */
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
    launchFireworks(delta) {
        this.counter++;
        // add new fireworks every 5% of the calls
        if (Math.random() < 0.05) {
            this.fireworks.push(new MyFirework(this.app, this.contents));
        }

        // for each fireworks
        for (let i = 0; i < this.fireworks.length; i++) {
            // is firework finished?
            if (this.fireworks[i].done) {
                // remove firework
                this.fireworks.splice(i, 1);
                continue;
            }
            // otherwise updates firework
            this.fireworks[i].update(delta);
        }
    }

    /**
     * Resets GameManager properties that do not cross scenes
     */
    reset() {
        this.collisionManager = new CollisionManager(this.contents);
        this.obstacles = [];
    }

    getState() {
        return this.state;
    }
}

export { GameManager };
