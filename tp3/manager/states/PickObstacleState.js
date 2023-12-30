import * as THREE from "three";
import { GameState } from "../GameState.js";
import { PickingManager } from "../PickingManager.js";
import { RectangleCollider } from "../../collisions/RectangleCollider.js";
/**
 * This class contains methods of  the game
 */
class PickObstacleState extends GameState {
    #cameraSpeed = 30;
    #cameraRotation = 2;

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

        this.contents.app.cameras[
            this.manager.obstaclesCamera
        ].targetFollow = false;

        this.contents.app.cameras[this.manager.obstaclesCamera].parent =
            this.contents.app.scene;

        this.placingObstacle = false;
        this.obstacleSelected = null;

        // signal the app that the camera needs to be update due to targetCoords being changed
        this.contents.app.updateCameras = true;
    }

    update(delta) {
        if (this.placingObstacle) {
            const camDirection = new THREE.Vector3();

            this.contents.app.cameras[
                this.manager.obstaclesCamera
            ].getWorldDirection(camDirection);

            camDirection.y = 0;

            if (this.manager.keyboard.isKeyDown("w")) {
                this.obstacleSelected.position.add(
                    camDirection.multiplyScalar(delta * this.#cameraSpeed)
                );
            }

            if (this.manager.keyboard.isKeyDown("s")) {
                this.obstacleSelected.position.add(
                    camDirection.multiplyScalar(-delta * this.#cameraSpeed)
                );
            }

            if (this.manager.keyboard.isKeyDown("d")) {
                this.obstacleSelected.rotation.y -=
                    delta * this.#cameraRotation;
            }

            if (this.manager.keyboard.isKeyDown("a")) {
                this.obstacleSelected.rotation.y +=
                    delta * this.#cameraRotation;
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

                // add collider to new obstacle
                this.contents.manager.collisionManager.addCollider(
                    new RectangleCollider(
                        this.obstacleSelected,
                        new THREE.Vector2(0, 0),
                        1.25,
                        1.25
                    ),
                    true
                );
                this.obstacleSelected.isObstacle = true;
                this.contents.track.obstacleObjects.push(this.obstacleSelected);

                switch (this.obstacleSelected.name) {
                    case "wine-bottle":
                        this.obstacleSelected.effect = 0;
                        break;
                    case "snail":
                        this.obstacleSelected.effect = 1;
                        break;
                    case "banana":
                        this.obstacleSelected.effect = 2;
                        break;
                }
            }
        }
    }

    onPointerClick(event) {
        if (!this.placingObstacle) {
            const obstaclePicked =
                this.pickingManager.getNearestObject(event)?.name;

            if (obstaclePicked) {
                this.placingObstacle = true;
                this.obstacleSelected =
                    this.manager.obstacles[obstaclePicked].clone();

                // add chosen obstacle to track
                this.contents.app.scene.add(this.obstacleSelected);

                //move obstacle to player
                this.obstacleSelected.position.set(
                    ...this.manager.playerCar.position.clone()
                );

                // configure camera
                this.contents.app.cameras[
                    this.manager.obstaclesCamera
                ].position.set(...new THREE.Vector3(10, 5, 0));
                this.contents.app.cameras[
                    this.manager.obstaclesCamera
                ].targetFollow = true;
                this.contents.app.cameras[
                    this.manager.obstaclesCamera
                ].camTarget = this.obstacleSelected;

                this.contents.app.cameras[this.manager.obstaclesCamera].parent =
                    this.obstacleSelected;

                // signal the app that the camera needs to be update due to targetCoords being changed
                this.contents.app.updateCameras = true;
            }
        }
    }

    onPointerMove(event) {
        this.pickingManager.onPointerMove(event);
    }
}

export { PickObstacleState };
