import * as THREE from "three";
import { MyApp } from "../MyApp.js";

/**
 * This class contains a 3D cake representation
 */
class MyCake extends THREE.Object3D {
    /**
     *
     * @param {MyApp} app the application object
     * @param {number} up_radius the radius of the upside of the cake
     * @param {number} down_radius the radius of the downside of the cake
     */
    constructor(app, up_radius, down_radius) {
        super();
        this.app = app;
        this.type = "Group";
        this.up_radius = 0.25;
        this.down_radius = 0.25;

        this.cakeMaterial = new THREE.MeshPhongMaterial({
            color: "#FEC5E5",
            specular: "#6E260E",
            emissive: "#000000",
            shininess: 10,
        });

        let cake = new THREE.CylinderGeometry(
            //Raio  do círculo superior
            this.up_radius,
            //Raio do círculo inferior
            this.down_radius,
            //Altura
            0.4,
            //Segmentos radiais
            40,
            //Segmentos de altura
            3,
            false,
            0,
            (14*Math.PI)/8
        );
        this.cakeMesh = new THREE.Mesh(cake, this.cakeMaterial);

        this.cakeMesh.position.y = 0.24;

        this.cakeGroup = new THREE.Group()

        this.cakeGroup.add(this.cakeMesh)


        this.add(this.cakeGroup);
    }
}

MyCake.prototype.isGroup = true;

export { MyCake };
