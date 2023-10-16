import * as THREE from "three";
import { MyApp } from "../MyApp.js";
import { MyNurbsBuilder } from "./MyNurbsBuilder.js";

/**
 * This class contains a 3D cake representation
 */
class MyVase extends THREE.Object3D {
    /**
     *
     * @param {MyApp} app the application object
     * @param {radius} radius the radius of the chandelier
     * @param {stringLength} stringLength the length of the string supporting the chandelier
     */
    constructor(app, radius, height) {
        super();
        this.app = app;
        this.type = "Group";
        this.radius = radius || 0.3;
        this.height = height || 0.6;

        const vaseMaterial = new THREE.MeshPhongMaterial({
            color: "#0000ff",
            specular: "#0000aa",
            emissive: "#000000",
            shininess: 10,
            side: THREE.DoubleSide,
        });

        let h = (4 / 3) * this.radius;
        let side = 1.0;

        for (let index = 0; index < 2; index++) {
            side = side * -1;

            const controlPoints = [
                // U = 0
                [
                    // V = 0..1;
                    [-this.radius * 0.7, this.height * 1, 0, 1],
                    [-this.radius * 0.5, this.height * 0.8, 0, 1],
                    [-this.radius * 1.5, this.height * 0.6, 0, 1],
                    [-this.radius * 1.5, this.height * 0.3, 0, 1],
                    [-this.radius, 0, 0, 1],
                    [0, 0, 0, 1],
                ],
                // U = 1
                [
                    // V = 0..1;
                    [-this.radius * 0.7, this.height * 1, side * h * 0.7, 1],
                    [-this.radius * 0.5, this.height * 0.8, side * h * 0.5, 1],
                    [-this.radius * 1.5, this.height * 0.6, side * h * 1.5, 1],
                    [-this.radius * 1.5, this.height * 0.3, side * h * 1.5, 1],
                    [-this.radius, 0, side * h, 1],
                    [0, 0, 0, 1],
                ],
                // U = 2
                [
                    // V = 0..1;
                    [this.radius * 0.7, this.height * 1, side * h * 0.7, 1],
                    [this.radius * 0.5, this.height * 0.8, side * h * 0.5, 1],
                    [this.radius * 1.5, this.height * 0.6, side * h * 1.5, 1],
                    [this.radius * 1.5, this.height * 0.3, side * h * 1.5, 1],
                    [this.radius, 0, side * h, 1],
                    [0, 0, 0, 1],
                ],
                // U = 3
                [
                    // V = 0..1;
                    [this.radius * 0.7, this.height * 1, 0, 1],
                    [this.radius * 0.5, this.height * 0.8, 0, 1],
                    [this.radius * 1.5, this.height * 0.6, 0, 1],
                    [this.radius * 1.5, this.height * 0.3, 0, 1],
                    [this.radius, 0, 0, 1],
                    [0, 0, 0, 1],
                ],
            ];

            this.builder = new MyNurbsBuilder();

            const surfaceData = this.builder.build(
                controlPoints,
                3,
                5,
                20,
                8,
                vaseMaterial
            );

            const mesh = new THREE.Mesh(surfaceData, vaseMaterial);

            // mesh.castShadow = true;
            // mesh.receiveShadow = true;

            this.add(mesh);
        }
    }
}

MyVase.prototype.isGroup = true;

export { MyVase };
