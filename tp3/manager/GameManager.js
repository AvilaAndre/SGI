import * as THREE from "three";
import { RaceState } from "./states/RaceState.js";
import { GameState } from "./GameState.js";
import { KeyboardManager } from "./KeyboardManager.js";
import { PlayerParkState } from "./states/PlayerParkState.js";
import { OpponentParkState } from "./states/OpponentParkState.js";
import { PickObstacleState } from "./states/PickObstacleState.js";
import { PickingManager } from "./PickingManager.js";
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
        this.state = new OpponentParkState(this.contents, this); 
        console.log("this.state no constructor:", this.state)
        this.keyboard = new KeyboardManager();
        this.collisionManager = new CollisionManager(this.contents);

        this.cars = [];

        this.car = null;

        //fireworks
        this.app = app;
        this.fireworks = [];

        this.launchFireworks();
        
    }

    /**
     *
     * @param {GameState} state
     */
    setState(state) {
        console.log("Setting state to " + state);
        console.log("contents: " + this.contents);
        switch (state) {
            case "race":
                this.contents.pickingManager.setState("notPicking");
                this.state = new RaceState(this.contents, this);
                break;
            case "pickingPlayer":
                this.contents.pickingManager.setState("pickingPlayer");
                this.state = new PlayerParkState(this.contents, this);
                break;
            case "pickingOpponent":
                this.contents.pickingManager.setState("pickingOpponent");
                this.state = new OpponentParkState(this.contents, this);
                break;
            case "pickingObstacle":
                this.contents.pickingManager.setState("pickingObstacle");
                this.state = new PickObstacleState(this.contents, this);
                break;

            default:
                this.contents.pickingManager.setState("notPicking");
                this.state = new GameState(this.contents, this);
                break;
        }
        this.state = state;
    }

    update(delta) {
        console.log("this.state: no update", this.state);
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

        this.contents.contents.activeCameraName = this.car.cameras[i].id;
    }

    //When there is a winner, go to a new state (something like WinnerState) and call this function to start the fireworks
    launchFireworks(){
        // add new fireworks every 5% of the calls
        if(Math.random()  < 0.05 ) {
            this.fireworks.push(new MyFirework(this.app, this.contents))
            console.log("firework added")
        }

        // for each fireworks 
        for( let i = 0; i < this.fireworks.length; i++ ) {
            // is firework finished?
            if (this.fireworks[i].done) {
                // remove firework 
                this.fireworks.splice(i,1) 
                console.log("firework removed")
                continue 
            }
            // otherwise upsdate  firework
            this.fireworks[i].update()
        }
    }
}

export { GameManager };
