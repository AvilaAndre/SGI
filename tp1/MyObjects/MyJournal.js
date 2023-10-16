import * as THREE from "three";
import { MyApp } from "../MyApp.js";
import { MyNurbsBuilder } from "./MyNurbsBuilder.js";

/**
 * This class contains a 3D cake representation
 */
class MyJournal extends THREE.Object3D {
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

        this.journalTexture = new THREE.TextureLoader().load(
            "textures/newspapers.jpg"
        );

        this.journalMaterial = new THREE.MeshLambertMaterial({
            map: this.journalTexture,
        });



        const widthPoints = [];

        for (let index = 0; index <= this.curtWaves; index++) {
            widthPoints.push((index / this.curtWaves) * this.curtainWidth);
        }

        this.journalMesh3 = new THREE.Group();
        let side = 1.0;

            const controlPoints = [   // U = 0
            [ // V = 0..1;
                [ -1.5, -1.5, -0.2, 1 ],
                [ -1.5,  1.5, -0.2, 1 ]
            ],
            [
                [ -0.5, -1.5, 0.5, 1 ],
                [ -0.5,  1.5, 0.5, 1 ]
            ],

        // U = 1
            [ // V = 0..1
                [ 0, -1.5, -0.4, 5 ],
                [ 0,  1.5, -0.4, 5 ]
            ],
            [ // V = 0..1
                [ 0, -1.5, -0.4, 5 ],
                [ 0,  1.5, -0.4, 5 ]
            ],

            [
                [ 0.5, -1.5, 0.5, 1 ],
                [ 0.5,  1.5, 0.5, 1 ]
            ],
        // U = 2
            [ // V = 0..1
                [ 1.5, -1.5, -0.2, 1 ],
                [ 1.5,  1.5, -0.2, 1 ]
            ]
    ]
            

            side = side * -1
            this.builder = new MyNurbsBuilder();

            const surfaceData = this.builder.build(
                controlPoints,
                5,
                1,
                80,
                8,
                this.journalMaterial
            );

            const mesh = new THREE.Mesh(surfaceData, this.journalMaterial);

            mesh.castShadow = true
            mesh.receiveShadow = true;

            this.add(mesh);
        //}
    }
}

MyJournal.prototype.isGroup = true;

export { MyJournal };
