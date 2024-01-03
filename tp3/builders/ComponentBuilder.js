import * as THREE from "three";
import { MyApp } from "../MyApp.js";

/**
 *
 * @param {CameraData} camera
 * @param {MyApp} app
 * creates a camera based on the data received and adds to the cameras array
 */
const addCamera = (camera, app, targetFollow = null) => {
    let newCamera = undefined;

    if (camera.type == "perspective") {
        newCamera = new THREE.PerspectiveCamera(
            camera.angle,
            undefined,
            camera.near,
            camera.far
        );

        newCamera.targetCoords = new THREE.Vector3(
            camera.target[0],
            camera.target[1],
            camera.target[2]
        );

        newCamera.targetFollow = targetFollow;
    } else if (camera.type == "orthogonal") {
        newCamera = new THREE.OrthographicCamera(
            camera.left,
            camera.right,
            camera.top,
            camera.bottom,
            camera.near,
            camera.far
        );

        newCamera.targetCoords = new THREE.Vector3(
            camera.target[0],
            camera.target[1],
            camera.target[2]
        );

        newCamera.targetFollow = targetFollow;
    } else return;

    newCamera.position.set(
        camera.location[0],
        camera.location[1],
        camera.location[2]
    );

    const target = new THREE.Object3D();
    target.position.set(camera.target[0], camera.target[1], camera.target[2]);

    newCamera.target = target;

    app.cameras[camera.id] = newCamera;

    return newCamera;
};

export { addCamera };
