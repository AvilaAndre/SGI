import * as THREE from "three";
import { MyApp } from "../MyApp.js";

/**
 * This class contains a 3D frame representation
 */
class MyFrame extends THREE.Object3D {
    /**
     *
     * @param {MyApp} app the application object
     * @param {number} width the width of the frame
     * @param {number} height the height of the frame
     * @param {number} barWidth the depth of the frame's bar
     * @param {string} photo the photo to display in the frame
     */
    constructor(app, width, height, photo, barWidth) {
        super();
        this.app = app;
        this.type = "Group";
        this.width = width || 0.4;
        this.height = height || 0.6;
        this.barWidth = barWidth || 0.1;

        this.frameMaterial = new THREE.MeshPhongMaterial({
            color: "#E3BC9A",
            specular: "#000000",
            emissive: "#000000",
            shininess: 10,
        });

        this.photoTexture = new THREE.TextureLoader().load("textures/" + photo);

        this.photoMaterial = new THREE.MeshPhongMaterial({
            map: this.photoTexture,
            specular: "#000000",
            emissive: "#000000",
            shininess: 50,
        });

        let frameHorizontalBar = new THREE.BoxGeometry(
            this.width + this.barWidth * 2,
            this.barWidth,
            this.barWidth
        );
        let frameVerticalBar = new THREE.BoxGeometry(
            this.barWidth,
            this.height + this.barWidth / 2,
            this.barWidth
        );

        [-1, 1].forEach((num) => {
            let frameHorizontalMesh = new THREE.Mesh(
                frameHorizontalBar,
                this.frameMaterial
            );
            let frameVerticalMesh = new THREE.Mesh(
                frameVerticalBar,
                this.frameMaterial
            );

            frameHorizontalMesh.position.y =
                num * (this.height / 2 + this.barWidth / 2);
            frameVerticalMesh.position.x =
                num * (this.width / 2 + this.barWidth / 2);

            this.add(frameHorizontalMesh);
            this.add(frameVerticalMesh);
        });

        let photoGeometry = new THREE.PlaneGeometry(this.width, this.height);

        let photoMesh = new THREE.Mesh(photoGeometry, this.photoMaterial);

        this.add(photoMesh);
    }
}

MyFrame.prototype.isGroup = true;

export { MyFrame };
