import * as THREE from "three";
import { GameState } from "../GameState.js";
/**
 * This class contains methods of  the game
 */
class RaceState extends GameState {
    /**
     *
     * @param {MyContents} contents the contents object
     * @param {GameManager} manager the manager object
     */
    constructor(contents, manager) {
        super(contents, manager);

        if (!manager.checkpoints) {
            this.manager.currCheckpoint = 0;
            this.manager.lapClock = new THREE.Clock();
        }
    }

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

        if (this.manager.keyboard.isKeyJustDown("r")) {
            if (this.manager.lastCheckpoint) {
                this.manager.car.teleportTo(
                    this.manager.lastCheckpoint.x,
                    this.manager.lastCheckpoint.z,
                    this.manager.lastCheckpoint.rotation
                );

                console.error("Car teleported to the last checkpoint");
            }
        }

        this.manager.car.calculateNextMove(delta);
        this.manager.updateCollisions();

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

        // check for collision with checkpoint

        const currCheckpointObj =
            this.contents.track.checkpoints[
                this.manager.currCheckpoint % this.contents.track.numCheckpoints
            ];

        if (this.manager.car.collider.collide(currCheckpointObj.collider)) {
            // update lastCheckpoint
            this.manager.lastCheckpoint = {
                x: currCheckpointObj.position.x,
                z: currCheckpointObj.position.z,
                rotation: currCheckpointObj.rotation.y + Math.PI,
            };

            console.info(
                "CHECKPOINT",
                (this.manager.currCheckpoint %
                    this.contents.track.numCheckpoints) +
                    "/" +
                    this.contents.track.numCheckpoints,
                "lap:" +
                    Math.floor(
                        this.manager.currCheckpoint /
                            this.contents.track.numCheckpoints
                    )
            );

            if (
                Math.floor(
                    this.manager.currCheckpoint /
                        this.contents.track.numCheckpoints
                ) === 0
            ) {
                this.manager.lapClock.start();
            } else if (
                this.manager.currCheckpoint %
                    this.contents.track.numCheckpoints ==
                0
            ) {
                console.warn("lap time:" + this.manager.lapClock.getDelta());
                this.contents.track.checkpoints.forEach((checkpointObj) => {
                    checkpointObj.cones.forEach((element) => {
                        // traverse cones
                        element.traverse((elem) => {
                            if (elem.type === "Mesh") {
                                elem.material.color = new THREE.Color(0, 0, 1);
                            }
                        });
                    });
                });
            }

            const nextCheckpointObj =
                this.contents.track.checkpoints[
                    (this.manager.currCheckpoint + 1) %
                        this.contents.track.numCheckpoints
                ];

            // current checkpoint
            currCheckpointObj.cones.forEach((element) => {
                // traverse cones
                element.traverse((elem) => {
                    if (elem.type === "Mesh") {
                        elem.material.color = new THREE.Color(0, 1, 0);
                    }
                });
            });

            // next checkpoint
            nextCheckpointObj.cones.forEach((element) => {
                // traverse cones
                element.traverse((elem) => {
                    if (elem.type === "Mesh") {
                        elem.material.color = new THREE.Color(1, 0, 0);
                    }
                });
            });

            this.manager.currCheckpoint++;

            // this.contents.app.scene.add(
            //     this.contents.track.checkpoints[
            //         this.manager.currCheckpoint %
            //             this.contents.track.numCheckpoints
            //     ].collider.getDebugObject()
            // );
        }
    }
}

export { RaceState };
