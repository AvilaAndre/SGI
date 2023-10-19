import * as THREE from "three";
import { MyApp } from "../MyApp.js";

/**
 * This class contains a 3D candle representation
 */
class MyCandle extends THREE.Object3D {
    /**
     *
     * @param {MyApp} app the application object
     */
    constructor(app) {
        super();
        this.app = app;
        this.type = "Group";
        this.up_radius = 0.009;
        this.down_radius = 0.009;

        this.candleBaseMaterial = new THREE.MeshPhongMaterial({
            color: "#fff2cc",
            specular: "#6E260E",
            emissive: "#fff2cc",
            shininess: 10,
        });

        /*this.candleFlameInteriorMaterial = new THREE.MeshPhongMaterial({
            color: "#000000",
            specular: "#6E260E",
            emissive: "#000000",
            shininess: 10,
        });*/

        this.candleFlameExteriorMaterial = new THREE.MeshPhongMaterial({
            color: "#f6b26b",
            specular: "#6E260E",
            emissive: "#f6b26b",
            shininess: 10,
        });

        let candleBase = new THREE.CylinderGeometry(
            //Raio  do círculo superior
            this.up_radius,
            //Raio do círculo inferior
            this.down_radius,
            //Altura
            0.08,
            //Segmentos radiais
            40,
            //Segmentos de altura
            3,
            false,
            0,
            2 * Math.PI
        );

        let candleFlameInterior = new THREE.ConeGeometry(
            //Radius of the cone base
            0.004,
            //Height of the cone
            0.035,
            //Number of segmented faces around the circumference of the cone
            8,
            // Number of rows of faces along the height of the cone
            1,
            // A Boolean indicating whether the base of the cone is open or capped
            false,
            //Start angle for first segment
            0,
            //The central angle, often called theta, of the circular sector. Expects a Float
            6.28
        );

        let candleFlameExterior = new THREE.ConeGeometry(
            //Radius of the cone base
            0.008,
            //Height of the cone
            0.055,
            //Number of segmented faces around the circumference of the cone
            8,
            // Number of rows of faces along the height of the cone
            1,
            // A Boolean indicating whether the base of the cone is open or capped
            false,
            //Start angle for first segment
            0,
            //The central angle, often called theta, of the circular sector. Expects a Float
            6.28
        );

        this.candleBaseMesh = new THREE.Mesh(
            candleBase,
            this.candleBaseMaterial
        );
        //this.candleFlameInteriorMesh = new THREE.Mesh(candleFlameInterior, this.candleFlameInteriorMaterial);
        this.candleFlameExteriorMesh = new THREE.Mesh(
            candleFlameExterior,
            this.candleFlameExteriorMaterial
        );

        //this.candleFlameInteriorMesh.position.y += 0.8;
        this.candleFlameExteriorMesh.position.y += 0.075;

        this.candleGroup = new THREE.Group();
        
        this.candleBaseMesh.castShadow = true;
        this.candleBaseMesh.receiveShadow = true;

        this.candleGroup.add(this.candleBaseMesh);
        //this.candleGroup.add(this.candleFlameInteriorMesh);
        this.candleGroup.add(this.candleFlameExteriorMesh);

        this.add(this.candleGroup);
    }
}

MyCandle.prototype.isGroup = true;

export { MyCandle };
