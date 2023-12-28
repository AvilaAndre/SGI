import * as THREE from "three";
import { GameState } from "../GameState.js";
import { MyClock } from "../../utils/MyClock.js";
import { NumbersComponent } from "../../hud/components/NumbersComponent.js";
import { MinimapComponent } from "../../hud/components/MinimapComponent.js";
import { LettersComponent } from "../../hud/components/LettersComponent.js";
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

        this.powerup = false;
        // Clock that keeps track of time since a powerup was picked up
        this.manager.powerupClock = new MyClock();
        // Clock that keeps track of every lap's time
        this.manager.lapClock = new MyClock();
        this.manager.lapClock.stop();

        // Stores the ammount of laps done
        this.manager.lapCount = 0;

        if (!manager.checkpoints) {
            this.manager.currCheckpoint = 0;
        }

        this.manager.selectPlayerCar(this.manager.playerPickedCar);
        this.manager.selectOpponentCar(this.manager.cpuPickedCar);

        if (this.manager.playerCar) {
            this.manager.playerCar.teleportTo(
                this.contents.track.startingPoint.x,
                this.contents.track.startingPoint.z,
                this.contents.track.startingPoint.rotation
            );

            this.manager.changeCarCamera();

            this.onTrackRaycaster = new THREE.Raycaster(
                this.manager.playerCar.position,
                new THREE.Vector3(0, -1, 0),
                0,
                1
            );
        }

        if (this.manager.opponentCar) {
            this.manager.opponentCar.startRunAnimation();
            this.manager.opponentCar.pauseRunAnimation();
        }

        this.createHud();
    }

    createHud() {
        this.manager.hud.addComponent(
            "lapTimer",
            new NumbersComponent(
                new THREE.Vector2(0, 0.5),
                0.1,
                () =>
                    this.manager.lapClock
                        ? this.manager.lapClock.getElapsedTime() / 1000
                        : 0,
                0,
                4
            )
        );

        this.manager.hud.addComponent(
            "speedometer",
            new NumbersComponent(
                new THREE.Vector2(0.75, -0.5),
                0.1,
                () =>
                    this.manager.playerCar ? this.manager.playerCar.speed : 0,
                0,
                3
            )
        );

        this.manager.hud.addComponent(
            "lapCounter",
            new NumbersComponent(
                new THREE.Vector2(0.75, 0.5),
                0.1,
                () => this.manager.lapCount,
                0,
                1
            )
        );

        /*this.manager.hud.addComponent(
            "title",
            new LettersComponent(
                new THREE.Vector2(0, 0),
                0.1,
                () => {},
                "Third Gear",
                10
            )

        );*/

        this.manager.hud.addComponent(
            "minimap",
            new MinimapComponent(
                new THREE.Vector2(-0.75, 0.35),
                0.08,
                () => {
                    return {
                        playerCar: this.manager.playerCar,
                        opponentCar: this.manager.opponentCar,
                    };
                },
                {
                    playerCar: this.manager.playerCar,
                    opponentCar: this.manager.opponentCar,
                },
                this.contents.track
            )
        );
    }

    update(delta) {
        if (this.manager.keyboard.isKeyJustDown("p")) {
            this.paused ? this.resume() : this.pause();
        }

        if (this.paused) return;

        if (
            this.powerup &&
            this.manager.powerupClock.getElapsedTime() >= 4000
        ) {
            // Powerup duration is over
            this.manager.playerCar.maxSpeedPowerUPMultiplier = 1;
            this.powerup = false;

            // Optionally, reset the clock if needed elsewhere
            this.manager.powerupClock.stop();
        }

        if (this.manager.keyboard.isKeyJustDown("c")) {
            this.manager.changeCarCamera();
        }

        if (!this.manager.playerCar) {
            console.error("No car instantiated");
            return;
        }

        // toggle front lights
        if (this.manager.keyboard.isKeyJustDown("l")) {
            this.manager.playerCar.toggleLights();
        }

        if (this.manager.keyboard.isKeyJustDown("j")) {
            this.contents.animationPlayer.playFromStart("spectator-cheer");
        }

        if (this.manager.keyboard.isKeyJustDown("h")) {
            this.contents.animationPlayer.playForwards(
                this.manager.playerCar.carName + "-hello"
            );
        }

        if (this.manager.keyboard.isKeyDown("w")) {
            this.manager.playerCar.accelerate(delta);
        } else if (this.manager.keyboard.isKeyDown("s")) {
            this.manager.playerCar.brake(delta);
        } else if (this.manager.keyboard.isKeyJustUp("s")) {
            this.manager.playerCar.brakeReleased();
        }

        if (this.manager.keyboard.isKeyDown("a")) {
            this.manager.playerCar.turnTo(0.5);
        } else if (this.manager.keyboard.isKeyDown("d")) {
            this.manager.playerCar.turnTo(-0.5);
        } else {
            this.manager.playerCar.turnTo(0);
        }

        if (this.manager.keyboard.isKeyJustDown("r")) {
            if (this.manager.lastCheckpoint) {
                this.manager.playerCar.teleportTo(
                    this.manager.lastCheckpoint.x,
                    this.manager.lastCheckpoint.z,
                    this.manager.lastCheckpoint.rotation
                );

                console.error("Car teleported to the last checkpoint");
            }
        }

        this.manager.playerCar.calculateNextMove(delta);
        this.manager.updateCollisions();

        const collider = this.manager.collisionManager.checkCollisions(
            this.manager.playerCar.collider
        );

        this.manager.playerCar.isCollidingWithCar = false;
        if (collider) {
            // Check if running into the collider

            if (collider.parent.isPowerup) {
                if (collider.parent.caught == false) {
                    this.powerup = true;
                    this.manager.playerCar.maxSpeedPowerUPMultiplier = 2;

                    collider.parent.visible = false;
                    collider.parent.caught = true;

                    this.manager.powerupClock.start();
                }
            } else if (collider.parent.isCar) {
                this.manager.playerCar.isCollidingWithCar = true;
            } else if (
                this.manager.playerCar.position
                    .clone()
                    .sub(collider.parent.position)
                    .normalize()
                    .angleTo(
                        this.manager.playerCar.position
                            .clone()
                            .sub(this.manager.playerCar.lastPosition)
                            .normalize()
                    ) >
                Math.PI / 2
            ) {
                this.manager.playerCar.speed = 0;

                this.manager.playerCar.position.set(
                    ...this.manager.playerCar.lastPosition
                );
            }
        }

        this.manager.playerCar.isOnTrack =
            this.onTrackRaycaster.intersectObject(this.contents.track.trackMesh)
                .length > 0;

        this.manager.playerCar.move(delta);

        // check for collision with checkpoint

        const currCheckpointObj =
            this.contents.track.checkpoints[
                this.manager.currCheckpoint % this.contents.track.numCheckpoints
            ];

        if (
            this.manager.playerCar.collider.collide(currCheckpointObj.collider)
        ) {
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
                "lap:" + this.manager.lapCount,
                "lapTime:" + this.manager.lapClock.getElapsedTime()
            );

            if (
                this.manager.currCheckpoint %
                    this.contents.track.numCheckpoints ==
                0
            ) {
                this.onNewLap();
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
        }
    }

    /**
     * Called whenever a new lap is started
     */
    onNewLap() {
        if (this.manager.lapCount == 0 && this.manager.opponentCar)
            this.manager.opponentCar.startRunAnimation();

        this.manager.lapCount =
            Math.floor(
                this.manager.currCheckpoint / this.contents.track.numCheckpoints
            ) + 1;

        console.warn("lap time:" + this.manager.lapClock.getElapsedTime());
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

        this.contents.track.powerupObjects.forEach((powerupObj) => {
            powerupObj.visible = true;
            powerupObj.caught = false;
        });
        this.manager.lapClock.start();
    }

    pause() {
        this.paused = true;

        // stop clocks
        this.manager.lapClock.stop();
        this.manager.powerupClock.stop();

        // pause opponent car run animation
        if (this.manager.opponentCar)
            this.manager.opponentCar.pauseRunAnimation();
    }

    resume() {
        this.paused = false;

        // resume clocks
        this.manager.lapClock.resume();
        this.manager.powerupClock.resume();

        // resume opponent car run animation
        if (this.manager.opponentCar)
            this.manager.opponentCar.resumeRunAnimation();
    }
}

export { RaceState };
