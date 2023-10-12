import * as THREE from "three";
import { MyApp } from "../MyApp.js";

/**
 * This class contains a 3D chair representation
 */
class MyChair extends THREE.Object3D {
    /**
     *
     * @param {MyApp} app the application object
     * @param {number} width the width of the chair
     * @param {number} depth the depth of the chair
     * @param {number} backHeight the depth of the back of the chair
     * @param {number} backWidth the width of the back of the chair
     * @param {number} backDepth the depth of the back of the chair
     * @param {number} backBarNumber the number of bars on the back of the chair
     */
    constructor(
        app,
        width,
        depth,
        backHeight,
        backWidth,
        backDepth,
        backBarNumber
    ) {
        super();
        this.app = app;
        this.type = "Group";
        this.width = width || 0.6;
        this.depth = depth || 0.6;
        this.backHeight = backHeight || 0.6;
        this.backWidth = backWidth || 0.08;
        this.backDepth = backDepth || 0.05;
        this.backBarNumber = backBarNumber || 4;

        this.chairTexture = new THREE.TextureLoader().load(
            "textures/darkWood.jpg"
        );

        this.chairMaterial = new THREE.MeshPhongMaterial({
            map: this.chairTexture,
            specular: "#6E260E",
            emissive: "#000000",
            shininess: 10,
        });

        let chairTop = new THREE.BoxGeometry(this.width, 0.1, this.depth);
        this.chairTopMesh = new THREE.Mesh(chairTop, this.chairMaterial);
        this.chairTopMesh.position.y = 0.45;
        this.chairTopMesh.castShadow = true;
        this.chairTopMesh.receiveShadow = true;
        this.add(this.chairTopMesh);

        let legX = this.width / 2 - 0.1;
        let legY = this.depth / 2 - 0.1;

        let chairLeg = new THREE.CylinderGeometry(0.05, 0.05, 0.4, 10, 2);
        for (let i = 0; i < 4; i++) {
            let chairLegMesh = new THREE.Mesh(chairLeg, this.chairMaterial);
            chairLegMesh.position.copy(
                new THREE.Vector3(
                    (i > 1 ? 1 : -1) * legX,
                    0.2,
                    (i % 2 == 0 ? 1 : -1) * legY
                )
            );
            chairLegMesh.castShadow = true;
            chairLegMesh.receiveShadow = true;
            this.add(chairLegMesh);
        }

        let chairBackBar = new THREE.BoxGeometry(
            this.backDepth,
            this.backHeight,
            this.backWidth
        );
        for (let i = 0; i < this.backBarNumber; i++) {
            let chairBackBarMesh = new THREE.Mesh(
                chairBackBar,
                this.chairMaterial
            );
            let width = this.width - this.backWidth;

            chairBackBarMesh.position.set(
                this.depth / 2 - this.backDepth / 2,
                0.5 + this.backHeight / 2,
                -width / 2 + (width / (this.backBarNumber - 1)) * i
            );

            chairBackBarMesh.castShadow = true;
            chairBackBarMesh.receiveShadow = true;

            this.add(chairBackBarMesh);
        }

        let chairBackCrossBar = new THREE.BoxGeometry(
            this.backDepth,
            0.1,
            this.depth
        );
        let chairBackCrossBarMesh = new THREE.Mesh(
            chairBackCrossBar,
            this.chairMaterial
        );
        chairBackCrossBarMesh.position.set(
            this.depth / 2 - this.backDepth / 2,
            0.5 + this.backHeight + 0.05,
            0
        );

        chairBackCrossBarMesh.castShadow = true;
        chairBackCrossBarMesh.receiveShadow = true;
        this.add(chairBackCrossBarMesh);
    }
}

MyChair.prototype.isGroup = true;

export { MyChair };
