import * as THREE from "three";
import { GameState } from "../GameState.js";
import { MyClock } from "../../utils/MyClock.js";
import { NumbersComponent } from "../../hud/components/NumbersComponent.js";
import { MinimapComponent } from "../../hud/components/MinimapComponent.js";
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
        // Clock that keeps track of every lap's time
        this.manager.lapClock = new MyClock();
        this.manager.lapClock.stop();

        // Clock that keeps track of every opponent lap's time
        this.manager.opponentTotalTime = new MyClock();
        this.manager.opponentTotalTime.stop();

        this.manager.playerTotalTime = new MyClock();
        this.manager.playerTotalTime.stop();

        // Stores the ammount of laps done
        this.manager.lapCount = 0;
        // Stores the ammount of laps done by the opponent
        this.manager.opponentLapCount = 0;

        this.manager.winner = null;
        this.manager.loser = null;

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

        // PowerUps
        this.speedPowerUp = {
            active: false,
            clock: new MyClock(),
            time: 4000,
            stopEffect: () => {
                this.manager.playerCar.maxSpeedPowerUPMultiplier = 1;
            },
        };
        this.clockPowerUp = {
            active: false,
            clock: new MyClock(),
            time: 3000,
            stopEffect: () => {
                if (this.manager.opponentCar)
                    this.manager.opponentCar.resumeRunAnimation();
            },
        };

        // Obstacles
        this.drunkObstacle = {
            active: false,
            clock: new MyClock(),
            time: 6000,
        };
        this.clockObstacle = {
            active: false,
            clock: new MyClock(),
            time: 3000,
            stopEffect: () => {
                if (this.manager.opponentCar)
                    this.manager.opponentCar.setRunAnimationTimeScale(1);
            },
        };
        this.snailObstacle = {
            active: false,
            clock: new MyClock(),
            time: 6000,
            stopEffect: () => {
                this.manager.playerCar.maxSpeedObstacleMultiplier = 1;
            },
        };

        // array with all power ups and obstacles
        this.modifiers = [
            this.speedPowerUp,
            this.clockPowerUp,
            this.drunkObstacle,
            this.clockObstacle,
            this.snailObstacle,
        ];

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

    restored() {
        this.resume();
    }

    update(delta) {
        if (this.manager.keyboard.isKeyJustDown("p")) {
            this.paused ? this.resume() : this.pause();
        }

        if (this.paused) return;

        // update powerup visuals
        this.contents.track.powerUpObjects.forEach((powerUpObj) => {
            powerUpObj.update(delta);
        });
        this.contents.track.obstacleObjects.forEach((obstacleObj) => {
            obstacleObj.meshes.forEach((mesh) => {
                mesh.material.uniforms.time.value += delta;
                mesh.material.uniforms.obsActive.value = obstacleObj.active;
            });
        });

        // modifiers
        this.modifiers.forEach((mod) => {
            if (mod.active && mod.clock.getElapsedTime() >= mod.time) {
                // deactivate effect
                mod.active = false;
                mod.clock.stop();

                // if this modifier needs an extra speed to deactivate
                if (mod.stopEffect) mod.stopEffect();
            }
        });

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
            this.manager.playerCar.turnTo(
                0.5 * (this.drunkObstacle.active ? -1 : 1)
            );
        } else if (this.manager.keyboard.isKeyDown("d")) {
            this.manager.playerCar.turnTo(
                -0.5 * (this.drunkObstacle.active ? -1 : 1)
            );
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
                switch (collider.parent.trigger()) {
                    case 0:
                        this.speedPowerUp.active = true;
                        this.speedPowerUp.clock.start();

                        this.manager.playerCar.maxSpeedPowerUPMultiplier = 2;

                        this.pickObstacle();
                        break;
                    case 1:
                        this.clockPowerUp.active = true;
                        this.clockPowerUp.clock.start();
                        if (this.manager.opponentCar)
                            this.manager.opponentCar.pauseRunAnimation();

                        this.pickObstacle();
                        break;

                    default:
                        break;
                }
            } else if (collider.parent.isObstacle) {
                if (collider.parent.active) {
                    collider.parent.active = false;

                    switch (collider.parent.effect) {
                        case 0:
                            this.drunkObstacle.active = true;
                            this.drunkObstacle.clock.start();
                            break;
                        case 1:
                            this.clockObstacle.active = true;
                            this.clockObstacle.clock.start();

                            if (this.manager.opponentCar)
                                this.manager.opponentCar.setRunAnimationTimeScale(
                                    1.5
                                );
                            break;
                        case 2:
                            this.snailObstacle.active = true;
                            this.snailObstacle.clock.start();

                            this.manager.playerCar.maxSpeedObstacleMultiplier = 0.7;
                            break;
                    }
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

        if (this.manager.opponentLapCount == 4) {
            this.manager.opponentTotalTime.stop();
        }

        if (this.manager.lapCount == 4 && this.manager.opponentLapCount < 4) {
            this.manager.winner = this.manager.playerName;
            this.manager.loser = "Opponent";
        } else {
            this.manager.winner = "Opponent";
            this.manager.loser = this.manager.playerName;
        }

        if (this.manager.lapCount == 4) {
            this.manager.playerTotalTime.stop();
            this.contents.switchScenes("finalMenu");
        }

        this.countAllTime(delta);
    }

    /**
     * Called whenever a new lap is started
     */
    onNewLap() {
        if (this.manager.lapCount == 0 && this.manager.opponentCar) {
            this.manager.opponentCar.startRunAnimation();
            this.manager.totalTime = 0;
            // start timer
            this.manager.opponentTotalTime.start();
            this.manager.playerTotalTime.start();
        }

        this.manager.opponentCar.runAnimationOnFinished(
            this.opponentLapFinished.bind(this)
        );

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

        this.contents.track.powerUpObjects.forEach((powerUpObj) => {
            powerUpObj.activate();
        });
        this.contents.track.obstacleObjects.forEach((obstacleObj) => {
            obstacleObj.active = true;
        });
        this.manager.lapClock.start();
    }

    countAllTime(delta) {
        this.manager.totalTime += delta;
    }

    pause() {
        this.paused = true;
        this.manager.lapClock.stop();
        this.manager.opponentTotalTime.stop();
        this.manager.playerTotalTime.stop();

        // stop clocks
        this.modifiers.forEach((mod) => {
            mod.clock.stop();
        });

        // pause opponent car run animation
        if (this.manager.opponentCar && !this.clockPowerUp.active)
            this.manager.opponentCar.pauseRunAnimation();
    }

    resume() {
        this.paused = false;
        this.manager.lapClock.resume();
        this.manager.opponentTotalTime.resume();
        this.manager.playerTotalTime.resume();

        // resume clocks
        this.modifiers.forEach((mod) => {
            mod.clock.resume();
        });

        // resume opponent car run animation
        if (this.manager.opponentCar && !this.clockPowerUp.active)
            this.manager.opponentCar.resumeRunAnimation();
    }

    pickObstacle() {
        this.pause();
        this.manager.setState("pickingObstacle");
    }

    /**
     * Called when the opponent finishes one lap around the track
     */
    opponentLapFinished() {
        this.manager.opponentLapCount++;
    }
}

export { RaceState };
