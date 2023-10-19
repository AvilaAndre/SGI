import * as THREE from "three";
import { MyApp } from "../MyApp.js";

/**
 * This class contains a 3D wall lamp representation
 */
class MyWallLamp extends THREE.Object3D {
    /**
     *
     * @param {MyApp} app the application object
     * @param {number} intensity the light's intensity
     * @param {string} color the light's color
     */
    constructor(app, intensity, color) {
        super();
        this.app = app;
        this.type = "Group";
        this.intensity = intensity || 1;
        this.color = color || "#FFFFFF";

        const lampMaterial = new THREE.MeshPhongMaterial({
            color: "#808080",
            specular: "#808080",
            emissive: "#000000",
            shininess: 10,
        });

        const lampGeometry = new THREE.CylinderGeometry(
            0.3,
            0.4,
            0.3,
            10,
            3,
            false,
            0,
            Math.PI
        );

        const lampMesh = new THREE.Mesh(lampGeometry, lampMaterial);

        this.add(lampMesh);
    }
}

MyWallLamp.prototype.isGroup = true;

export { MyWallLamp };
