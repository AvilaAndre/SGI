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
     * @param {string} flavor
     */
    constructor(app, flavor) {
        super();
        this.app = app;
        this.type = "Group";
        this.up_radius = 0.25;
        this.down_radius = 0.25;
        this.flavor = flavor;

        this.planeCakeMaterial = new THREE.MeshPhongMaterial({
            color: "#FFCC80",
            specular: "#6E260E",
            emissive: "#000000",
            shininess: 10,
        });

        if (this.flavor === "strawberry") {
            this.cakeMaterial = new THREE.MeshPhongMaterial({
                color: "#FEC5E5",
                specular: "#6E260E",
                emissive: "#000000",
                shininess: 10,
            });
        } else if (this.flavor === "vanilla") {
            this.cakeMaterial = new THREE.MeshPhongMaterial({
                color: "#FFF6DF",
                specular: "#6E260E",
                emissive: "#000000",
                shininess: 10,
            });
        } else if (this.flavor === "chocolate") {
            this.cakeMaterial = new THREE.MeshPhongMaterial({
                color: "#805A46",
                specular: "#6E260E",
                emissive: "#000000",
                shininess: 10,
            });
        }

        let cake = new THREE.CylinderGeometry(
            //Raio  do círculo superior
            this.up_radius,
            //Raio do círculo inferior
            this.down_radius,
            //Altura
            0.1,
            //Segmentos radiais
            40,
            //Segmentos de altura
            3,
            false,
            0,
            (14 * Math.PI) / 8
        );

        this.cakeGroup = new THREE.Group();

        ["#805A46", "#FFF6DF", "#FEC5E5"].forEach((color, index) => {
            let cakeMaterial = new THREE.MeshPhongMaterial({
                color,
                specular: "#6E260E",
                emissive: "#000000",
                shininess: 10,
            });

            this.cakeMesh = new THREE.Mesh(cake, cakeMaterial);

            this.cakeMesh.position.y = 0.24 + 0.1 * index;

            this.cakeMesh.castShadow = true;

            this.cakeGroup.add(this.cakeMesh);
        });

        let planeCake = new THREE.PlaneGeometry(0.22, 0.3);

        this.planeLeftCakeMesh = new THREE.Mesh(
            planeCake,
            this.planeCakeMaterial
        );
        this.planeLeftCakeMesh.position.y = 0.34;
        this.planeLeftCakeMesh.position.x = -0.1;
        this.planeLeftCakeMesh.position.z = 0.1;
        this.planeLeftCakeMesh.rotation.y = Math.PI / 4;

        this.planeRightCakeMesh = new THREE.Mesh(
            planeCake,
            this.planeCakeMaterial
        );
        this.planeRightCakeMesh.position.y = 0.34;
        this.planeRightCakeMesh.position.z = 0.14;
        this.planeRightCakeMesh.rotation.y = (-2 * Math.PI) / 4;

        this.planeLeftCakeMesh.castShadow = true;
        this.planeLeftCakeMesh.receiveShadow = true;
        this.planeRightCakeMesh.castShadow = true;
        this.planeRightCakeMesh.receiveShadow = true;

        this.cakeGroup.add(this.planeLeftCakeMesh);
        this.cakeGroup.add(this.planeRightCakeMesh);

        this.add(this.cakeGroup);
    }
}

MyCake.prototype.isGroup = true;

export { MyCake };
