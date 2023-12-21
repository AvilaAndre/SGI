import * as THREE from "three";
import { GameState } from "../GameState.js";
/**
 * This class contains methods of  the game
 */
class RaceState extends GameState {
    update(delta) {
        if (this.manager.keyboard.isKeyJustDown("c")) {
            this.manager.changeCarCamera();
        }

        if (this.manager.keyboard.isKeyJustDown("j")) {
            this.app.animationPlayer.playStart("spectator-cheer");
        }

        if (this.manager.keyboard.isKeyDown("w")) {
            this.manager.car.accelerate(delta);
        } else if (this.manager.keyboard.isKeyDown("s")) {
            this.manager.car.brake(delta);
        } else if (this.manager.keyboard.isKeyJustUp("s")) {
            this.manager.car.brakeReleased();
        }

        if (this.manager.keyboard.isKeyDown("a")) {
            this.manager.car.turnTo(0.5);
        } else if (this.manager.keyboard.isKeyDown("d")) {
            this.manager.car.turnTo(-0.5);
        } else {
            this.manager.car.turnTo(0);
        }

        this.manager.car.calculateNextMove(delta);

        this.manager.car.move(delta);
    }
}

export { RaceState };
