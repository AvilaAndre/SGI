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
    constructor(app, width, height, depth) {
        super();
        this.app = app;
        this.type = "Group";
        this.journalWidth = width;
        this.journalHeight = height;
        this.journalDepth = depth || 0.2;

        this.journalTexture = new THREE.TextureLoader().load(
            "textures/newspapers.jpg"
        );

        this.journalMaterial = new THREE.MeshLambertMaterial({
            map: this.journalTexture,
        });



        const widthPoints = [];


        this.journalMesh3 = new THREE.Group();

            const controlPoints = [   // U = 0
            [ // V = 0..1;
                [ -1.5, -1.5, -0.7, 1 ],
                [ -1.5,  1.5, -0.7, 1 ]
            ],
            [
                [ -0.5, -1.5, 0.5, 1 ],
                [ -0.5,  1.5, 0.5, 1 ]
            ],

        // U = 1
            [ // V = 0..1
                [ 0, -1.5, -0.8, 5 ],
                [ 0,  1.5, -0.8, 5 ]
            ],
            [ // V = 0..1
                [ 0, -1.5, -0.8, 5 ],
                [ 0,  1.5, -0.8, 5 ]
            ],

            [
                [ 0.5, -1.5, 0.5, 1 ],
                [ 0.5,  1.5, 0.5, 1 ]
            ],
        // U = 2
            [ // V = 0..1
                [ 1.5, -1.5, -0.7, 1 ],
                [ 1.5,  1.5, -0.7, 1 ]
            ]
    ]
            
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
