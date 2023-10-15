import * as THREE from "three";
import { MyApp } from "../MyApp.js";
import { MyNurbsBuilder } from "./MyNurbsBuilder.js";

/**
 * This class contains a 3D cake representation
 */
class MyCurtain extends THREE.Object3D {
    /**
     *
     * @param {MyApp} app the application object
     */
    constructor(app, width, height, waves, depth) {
        super();
        this.app = app;
        this.type = "Group";
        this.curtainWidth = width || 1.2;
        this.curtainHeight = height || 1.6;
        this.curtWaves = waves || 5;
        this.curtainDepth = depth || 0.2;

        const curtainMaterial = new THREE.MeshPhongMaterial({
            color: "#FF0000",
            specular: "#000000",
            emissive: "#000000",
            shininess: 10,
            side: 2,
        });

        const widthPoints = [];

        for (let index = 0; index <= this.curtWaves; index++) {
            widthPoints.push((index / this.curtWaves) * this.curtainWidth);
        }

        this.curtainMesh3 = new THREE.Group();
        let side = 1.0;
        for (let i = 0; i < this.curtWaves; i++) {
            const controlPoints = [
                // U = 0
                [
                    // V = 0..1;
                    [widthPoints[i] - this.curtainWidth/2, -this.curtainHeight / 2, 0.0, 1],
                    [widthPoints[i] - this.curtainWidth/2, this.curtainHeight / 2, 0.0, 1],
                ],
                // U = 1
                [
                    // V = 0..1
                    [
                        (widthPoints[i] + widthPoints[i + 1]) / 2 - this.curtainWidth/2,
                        -this.curtainHeight / 2,
                        this.curtainDepth * side,
                        1,
                    ],
                    [
                        (widthPoints[i] + widthPoints[i + 1]) / 2 - this.curtainWidth/2,
                        this.curtainHeight / 2,
                        this.curtainDepth * side,
                        1,
                    ],
                ],
                // U = 1
                [
                    // V = 0..1
                    [widthPoints[i + 1] - this.curtainWidth/2, -this.curtainHeight / 2, 0.0, 1],
                    [widthPoints[i + 1] - this.curtainWidth/2, this.curtainHeight / 2, 0.0, 1],
                ],
            ];

            side = side * -1
            this.builder = new MyNurbsBuilder();

            const surfaceData = this.builder.build(
                controlPoints,
                2,
                1,
                80,
                8,
                curtainMaterial
            );

            const mesh = new THREE.Mesh(surfaceData, curtainMaterial);

            mesh.castShadow = true
            mesh.receiveShadow = true;

            this.add(mesh);
        }
    }
}

MyCurtain.prototype.isGroup = true;

export { MyCurtain };
