import * as THREE from "three";
import { MyApp } from "../MyApp.js";

/**
 * This class contains a 3D cake representation
 */
class MyChandelier extends THREE.Object3D {
    /**
     *
     * @param {MyApp} app the application object
     * @param {radius} radius the radius of the chandelier
     * @param {stringLength} stringLength the length of the string supporting the chandelier
     */
    constructor(app, radius, stringLength) {
        super();
        this.app = app;
        this.type = "Group";
        this.radius = radius || 0.6;
        this.stringLength = stringLength || 1.4;

        const chandelierMaterial = new THREE.MeshPhongMaterial({
            color: "#FFFFFF",
            specular: "#6E260E",
            emissive: "#000000",
            shininess: 10,
            side: THREE.DoubleSide,
        });

        const lightbulbMaterial = new THREE.MeshPhongMaterial({
            color: "#FEDC56",
            specular: "#FFFFFF",
            emissive: "#000000",
            shininess: 10,
        });

        const chandelierCoverGeometry = new THREE.SphereGeometry(
            this.radius,
            undefined,
            undefined,
            undefined,
            undefined,
            0,
            Math.PI / 2
        );
        const lightbulbGeometry = new THREE.SphereGeometry(this.radius / 6);
        let stringPoints = [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, this.stringLength, 0),
        ];
        const stringGeometry = new THREE.BufferGeometry().setFromPoints(
            stringPoints
        );

        const chandelierCoverMesh = new THREE.Mesh(
            chandelierCoverGeometry,
            chandelierMaterial
        );
        const lightbulbMesh = new THREE.Mesh(
            lightbulbGeometry,
            lightbulbMaterial
        );
        lightbulbMesh.position.y = this.radius / 6;

        this.polyline = new THREE.Line(stringGeometry, chandelierMaterial);
        this.polyline.position.set(0, this.radius, 0);

        this.add(chandelierCoverMesh);
        this.add(lightbulbMesh);
        this.add(this.polyline);
    }
}

MyChandelier.prototype.isGroup = true;

export { MyChandelier };
