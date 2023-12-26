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

        this.powerup = false;
        this.manager.powerupClock = new THREE.Clock();
        this.previousLap = 0;
        

        //this.manager.powerupClock.start();

        if (!manager.checkpoints) {
            this.manager.currCheckpoint = 0;
            this.manager.lapClock = new THREE.Clock();
            
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
            this.manager.opponentCar.startOpponentRun();
        }
    }

    update(delta) {


        

        if (this.powerup && this.manager.powerupClock.getElapsedTime() >= 4) {
            console.log('powerup deactivating!');
            console.log("this.manager.powerupClock.getElapsedTime():", this.manager.powerupClock.getElapsedTime());
            // Powerup duration is over
            this.manager.playerCar.maxSpeedPowerUPMultiplier = 1;
            this.powerup = false;
            console.log('4 seconds have passed.');
            
            // Optionally, reset the clock if needed elsewhere
            // this.manager.powerupClock.start();
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


        const currentLap = Math.floor(this.manager.currCheckpoint / this.contents.track.numCheckpoints);


        if (currentLap !== this.previousLap) {
            // Lap number has changed
            console.info('Lap changed to:', currentLap);

            // Call your other function here
            this.yourOtherFunction(currentLap);

            // Update previousLap for the next check
            this.previousLap = currentLap;
            collider.parent.caught = false;
        }

        if (collider) {
            // Check if running into the collider


            if(collider.parent.isPowerup) {
                if(collider.parent.caught == false){
                    console.log('powerup active!!!');


                    //TODO: set caught flag to false when lap is incremented

                    this.powerup = true;
                    
                    this.manager.playerCar.maxSpeedPowerUPMultiplier = 2;

                    collider.parent.visible = false;
                    collider.parent.caught = true;

                    this.manager.powerupClock.start();
                    this.startTime = this.manager.powerupClock.elapsedTime;
                    this.timerStarted = true;
                
                }
            }
            else if (
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
