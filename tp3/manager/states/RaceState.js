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

        // toggle front lights
        if (this.manager.keyboard.isKeyJustDown("l")) {
            this.manager.car.toggleLights();
        }

        if (this.manager.keyboard.isKeyJustDown("j")) {
            this.contents.animationPlayer.playStart("spectator-cheer");
        }

        if (this.manager.keyboard.isKeyJustDown("h")) {
            this.contents.animationPlayer.playForwards(
                this.manager.car.carName + "-hello"
            );
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

        const collider = this.manager.collisionManager.checkCollisions(
            this.manager.car.collider
        );

        if (collider) {
            // Check if running into the collider
            if (
                this.manager.car.position
                    .clone()
                    .sub(collider.parent.position)
                    .normalize()
                    .angleTo(
                        this.manager.car.position
                            .clone()
                            .sub(this.manager.car.lastPosition)
                            .normalize()
                    ) >
                Math.PI / 2
            ) {
                this.manager.car.speed = 0;

                this.manager.car.position.set(...this.manager.car.lastPosition);
            }
        }

        this.manager.car.move(delta);
        this.manager.updateCollisions();
    }
}

export { RaceState };
