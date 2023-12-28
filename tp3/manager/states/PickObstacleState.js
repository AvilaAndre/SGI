import * as THREE from "three";
import { GameState } from "../GameState.js";
import { PickingManager } from "../PickingManager.js";
/**
 * This class contains methods of  the game
 */
class PickObstacleState extends GameState {
    #cameraSpeed = 20;

    constructor(contents, manager) {
        super(contents, manager);

        this.pickingManager = new PickingManager(
            this.contents,
            Object.keys(this.manager.obstacles)
        );

        // save last camera
        this.lastCamera = this.contents.app.activeCameraName;

        this.contents.app.activeCameraName = this.manager.obstaclesCamera;

        this.obstacleCameraOriginalTargetPosition =
            this.contents.app.cameras[
                this.manager.obstaclesCamera
            ].targetCoords.clone();
        this.obstacleCameraOriginalPosition =
            this.contents.app.cameras[
                this.manager.obstaclesCamera
            ].position.clone();

        this.placingObstacle = false;
        this.obstacleSelected = null;
    }

    update(delta) {
        if (this.placingObstacle) {
            let changed = false;
            if (this.manager.keyboard.isKeyDown("w")) {
                this.contents.app.cameras[
                    this.manager.obstaclesCamera
                ].position.z += delta * this.#cameraSpeed;
                changed = true;
            }

            if (this.manager.keyboard.isKeyDown("s")) {
                this.contents.app.cameras[
                    this.manager.obstaclesCamera
                ].position.z -= delta * this.#cameraSpeed;
                changed = true;
            }

            if (this.manager.keyboard.isKeyDown("d")) {
                this.contents.app.cameras[
                    this.manager.obstaclesCamera
                ].position.x -= delta * this.#cameraSpeed;
                changed = true;
            }

            if (this.manager.keyboard.isKeyDown("a")) {
                this.contents.app.cameras[
                    this.manager.obstaclesCamera
                ].position.x += delta * this.#cameraSpeed;
                changed = true;
            }

            if (changed) {
                this.contents.app.cameras[
                    this.manager.obstaclesCamera
                ].targetCoords.set(
                    this.contents.app.cameras[this.manager.obstaclesCamera]
                        .position.x,
                    0,
                    this.contents.app.cameras[this.manager.obstaclesCamera]
                        .position.z + 10
                );

                this.obstacleSelected.position.set(
                    this.contents.app.cameras[this.manager.obstaclesCamera]
                        .position.x,
                    0,
                    this.contents.app.cameras[this.manager.obstaclesCamera]
                        .position.z + 10
                );

                // signal the app that the camera needs to be update due to targetCoords being changed
                this.contents.app.updateCameras = true;
            }

            if (this.manager.keyboard.isKeyJustDown(" ")) {
                this.contents.app.activeCameraName = this.lastCamera;
                this.manager.rollbackState();

                // signal the app that the camera needs to be update due to targetCoords being changed
                this.contents.app.updateCameras = true;

                this.contents.app.cameras[
                    this.manager.obstaclesCamera
                ].position.set(...this.obstacleCameraOriginalPosition);
                this.contents.app.cameras[
                    this.manager.obstaclesCamera
                ].targetCoords.set(
                    ...this.obstacleCameraOriginalTargetPosition
                );
            }
        }
    }

    onPointerClick(event) {
        if (!this.placingObstacle) {
            const obstaclePicked =
                this.pickingManager.getNearestObject(event)?.name;

            if (obstaclePicked) {
                this.contents.app.cameras[
                    this.manager.obstaclesCamera
                ].position.set(
                    ...this.manager.playerCar.position
                        .clone()
                        .add(new THREE.Vector3(0, 20, 0))
                );

                this.contents.app.cameras[
                    this.manager.obstaclesCamera
                ].targetCoords.set(
                    this.contents.app.cameras[this.manager.obstaclesCamera]
                        .position.x,
                    0,
                    this.contents.app.cameras[this.manager.obstaclesCamera]
                        .position.z + 10
                );

                // signal the app that the camera needs to be update due to targetCoords being changed
                this.contents.app.updateCameras = true;

                this.placingObstacle = true;
                this.obstacleSelected =
                    this.manager.obstacles[obstaclePicked].clone();

                this.contents.app.scene.add(this.obstacleSelected);

                this.obstacleSelected.position.set(
                    this.contents.app.cameras[this.manager.obstaclesCamera]
                        .position.x,
                    0,
                    this.contents.app.cameras[this.manager.obstaclesCamera]
                        .position.z + 10
                );
            }
        }
    }

    onPointerMove(event) {
        this.pickingManager.onPointerMove(event);
    }
}

export { PickObstacleState };
