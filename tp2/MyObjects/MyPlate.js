import * as THREE from "three";
import { MyApp } from "../MyApp.js";

/**
 * This class contains a 3D plate representation
 */
class MyPlate extends THREE.Object3D {
    /**
     *
     * @param {MyApp} app the application object
     * @param {number} up_radius the radius of the upside of the plate
     * @param {number} down_radius the radius of the downside of the plate
     */
    constructor(app, up_radius, down_radius) {
        super();
        this.app = app;
        this.type = "Group";
        this.up_radius = up_radius || 0.3;
        this.down_radius = down_radius || 0.2;

        this.plateMaterial = new THREE.MeshPhongMaterial({
            color: "#FFFFFF",
            specular: "#6E260E",
            emissive: "#000000",
            shininess: 10,
        });

        let plate = new THREE.CylinderGeometry(
            this.up_radius,
            this.down_radius,
            0.05,
            40,
            2
        );
        this.plateMesh = new THREE.Mesh(plate, this.plateMaterial);

        this.plateMesh.position.y = 0.025

        this.plateGroup = new THREE.Group()

        this.plateGroup.add(this.plateMesh)


        this.add(this.plateGroup);
    }
}

MyPlate.prototype.isGroup = true;

export { MyPlate };
