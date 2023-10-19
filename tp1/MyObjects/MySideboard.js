import * as THREE from "three";
import { MyApp } from "../MyApp.js";
import { MyNurbsBuilder } from "./MyNurbsBuilder.js";

/**
 * This class contains a 3D sideboard representation
 */
class MySideboard extends THREE.Object3D {
    /**
     *
     * @param {MyApp} app the application object
     */
    constructor(app) {
        super();
        this.app = app;
        this.type = "Group";

        const sideboardMaterial = new THREE.MeshPhongMaterial({
            color: "#FF0000",
            specular: "#000000",
            emissive: "#000000",
            shininess: 10,
            side: 2,
        });

        this.glassMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x00bfff, // Set the glass color (light blue in this case)
            transparent: true, // Make the material transparent
            opacity: 0.2, // Set the opacity level (0.0 to 1.0)
            roughness: 0.2, // Adjust the roughness (0.0 for smooth, 1.0 for rough)
            metalness: 0.1, // Adjust the metalness (0.0 for non-metallic, 1.0 for metallic)
            transmission: 0.9,
        });

        const controlPoints = [
            // U = 0
            [
                // V = 0..1;
                [-2, 1, 0, 1],
                [-2, 1, 1, 1],
            ],
            [
                // V = 0..1;
                [2, 1, 0, 1],
                [2, 1, 1, 1],
            ],
            [
                [2, -1, 0, 1],
                [2, -1, 1, 1],
            ],
            [
                [-2, -1, 0, 1],
                [-2, -1, 1, 1],
            ],
        ];

        const leftControlPoints = [
            // U = 0
            [
                // V = 0..1;
                [2, 1, 0, 1],
                [2, 1, 1, 1],
            ],
            [
                // V = 0..1;
                [-2, 1, 0, 1],
                [-2, 1, 1, 1],
            ],
            [
                [-2, -1, 0, 1],
                [-2, -1, 1, 1],
            ],
            [
                [2, -1, 0, 1],
                [2, -1, 1, 1],
            ],
        ];

        this.builder = new MyNurbsBuilder();

        const surfaceData = this.builder.build(
            controlPoints,
            3,
            1,
            80,
            8,
            sideboardMaterial
        );

        const leftSurface = this.builder.build(
            leftControlPoints,
            3,
            1,
            80,
            8,
            sideboardMaterial
        );

        const mesh = new THREE.Mesh(surfaceData, sideboardMaterial);
        const leftMesh = new THREE.Mesh(leftSurface, sideboardMaterial);

        mesh.castShadow = true;
        mesh.receiveShadow = true;

        leftMesh.castShadow = true;
        leftMesh.receiveShadow = true;

        let glassPartGeometry = new THREE.PlaneGeometry(1, 4);

        let glassPartMesh = new THREE.Mesh(
            glassPartGeometry,
            this.glassMaterial
        );

        glassPartMesh.rotation.set(-Math.PI / 2, 0, Math.PI / 2);
        glassPartMesh.position.set(0, 1.001, 0.5);

        this.add(mesh);
        this.add(leftMesh);
        this.add(glassPartMesh);

        //}
    }
}

MySideboard.prototype.isGroup = true;

export { MySideboard };
