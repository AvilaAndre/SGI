import * as THREE from "three";
import { MyApp } from "../MyApp.js";

/**
 * This class contains a 3D chair representation
 */
class MyFrame extends THREE.Object3D {
    /**
     *
     * @param {MyApp} app the application object
     * @param {number} width the width of the frame
     * @param {number} height the height of the frame
     * @param {number} barWidth the depth of the frame's bar
     * @param {number} barDepth the depth of the frame's bar
     */
    constructor(app, width, height, barWidth, barDepth) {
        super();
        this.app = app;
        this.type = "Group";
        this.width = width || 0.4;
        this.height = height || 0.6;
        this.barWidth = barWidth || 0.06;
        this.barDepth = barDepth || 0.06;

        this.frameMaterial = new THREE.MeshPhongMaterial({
            color: "#000000",
            specular: "#000000",
            emissive: "#000000",
            shininess: 10,
        });

        this.photoMaterial = new THREE.MeshPhongMaterial({
            color: "#0000FF",
            specular: "#6E260E",
            emissive: "#000000",
            shininess: 10,
        });

        let frameHorizontalBar = new THREE.BoxGeometry(
            this.width + this.barWidth*2,
            this.barDepth,
            this.barWidth,
        );
        let frameVerticalBar = new THREE.BoxGeometry(
            this.barWidth,
            this.height,
            this.barDepth,
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

            frameHorizontalMesh.position.y = num * ((this.height / 2) + this.barWidth/2)
            frameVerticalMesh.position.x = num * ((this.width / 2) + this.barWidth/2);

            this.add(frameHorizontalMesh);
            this.add(frameVerticalMesh);
        });

        let photo = new THREE.PlaneGeometry(this.width, this.height);

        let photoMesh = new THREE.Mesh(
            photo,
            this.photoMaterial
        );

        this.add(photoMesh)

    }
}

MyFrame.prototype.isGroup = true;

export { MyFrame };