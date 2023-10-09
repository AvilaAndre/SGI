import * as THREE from "three";
import { MyApp } from "../MyApp.js";

/**
 * This class contains a 3D sofa
 */
class MySofa extends THREE.Object3D {
    /**
     *
     * @param {MyApp} app the application object
     */
    constructor(app, width) {
        super();
        this.app = app;
        this.type = "Group";
        this.width = width || 3

        const height = 0.4

        const sofaTexture = new THREE.TextureLoader().load(
            "textures/leather-macro-shot.jpg"
        );

        const sofaMaterial = new THREE.MeshPhongMaterial({
            map: sofaTexture,
            specular: "#FFFFFF",
            emissive: "#000000",
            shininess: 2,
        });

        const mainPartGeometry = new THREE.BoxGeometry(this.width, height, 1);
        const backPartBottom = new THREE.BoxGeometry(this.width, height + 0.6, 0.5);
        const backPartTop = new THREE.CylinderGeometry(
            0.25,
            0.25,
            this.width,
            undefined,
            undefined,
            false,
            0,
            Math.PI
        );
        const armBottom = new THREE.BoxGeometry(0.4, height + 0.2, 1.6);
        const armTop = new THREE.CylinderGeometry(
            0.2,
            0.2,
            1.6,
            undefined,
            undefined,
            false,
            Math.PI / 2,
            Math.PI
        );

        const mainPartMesh = new THREE.Mesh(mainPartGeometry, sofaMaterial);
        mainPartMesh.position.set(0, 0.2, 0.05);
        const backPartBottomMesh = new THREE.Mesh(backPartBottom, sofaMaterial);
        backPartBottomMesh.position.set(0, .5, 0.8);
        const backPartTopMesh = new THREE.Mesh(backPartTop, sofaMaterial);
        backPartTopMesh.position.set(0, 1, 0.8);
        backPartTopMesh.rotation.z = Math.PI / 2;
        const leftArmBottomMesh = new THREE.Mesh(armBottom, sofaMaterial);
        leftArmBottomMesh.position.set(1.7, 0.3, 0.2);
        const leftArmTopMesh = new THREE.Mesh(armTop, sofaMaterial);
        leftArmTopMesh.position.set(1.7, .6, 0.2);
        leftArmTopMesh.rotation.x = Math.PI / 2;
        const rightArmBottomMesh = new THREE.Mesh(armBottom, sofaMaterial);
        rightArmBottomMesh.position.set(-1.7, 0.3, 0.2);
        const rightArmTopMesh = new THREE.Mesh(armTop, sofaMaterial);
        rightArmTopMesh.position.set(-1.7, .6, 0.2);
        rightArmTopMesh.rotation.x = Math.PI / 2;

        this.add(mainPartMesh);
        this.add(backPartBottomMesh);
        this.add(backPartTopMesh);
        this.add(leftArmBottomMesh);
        this.add(leftArmTopMesh);
        this.add(rightArmBottomMesh);
        this.add(rightArmTopMesh);
    }
}

MySofa.prototype.isGroup = true;

export { MySofa };
