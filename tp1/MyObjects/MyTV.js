import * as THREE from "three";
import { MyApp } from "../MyApp.js";

/**
 * This class contains a 3D tv representation
 */
class MyTV extends THREE.Object3D {
    /**
     *
     * @param {MyApp} app the application object
     * @param {number} width the width of the tv
     * @param {number} height the height of the tv
     * @param {number} barWidth the width of the tv's bar
     * @param {number} barDepth the depth of the tv's bar
     */
    constructor(app, width, height, barWidth, barDepth) {
        super();
        this.app = app;
        this.type = "Group";
        this.width = width || 0.4;
        this.height = height || 0.6;
        this.barWidth = barWidth || 0.1;
        this.barDepth = barDepth || 0.06;

        // Define video and video texture
        let video = document.getElementById("video");
        video.muted = true;
        let texture = new THREE.VideoTexture(video);

        const material = new THREE.MeshBasicMaterial({ map: texture });

        this.tvTexture = new THREE.TextureLoader().load("textures/steel.jpg");

        this.tvMaterial = new THREE.MeshPhongMaterial({
            map: this.tvTexture,
            shininess: 10,
        });

        let tvHorizontalBar = new THREE.BoxGeometry(
            this.width + this.barWidth * 2,
            this.barDepth,
            this.barWidth
        );
        let tvVerticalBar = new THREE.BoxGeometry(
            this.barWidth,
            this.height + this.barWidth / 2,
            this.barDepth
        );

        [-1, 1].forEach((num) => {
            let tvHorizontalMesh = new THREE.Mesh(
                tvHorizontalBar,
                this.tvMaterial
            );
            let tvVerticalMesh = new THREE.Mesh(tvVerticalBar, this.tvMaterial);

            tvHorizontalMesh.position.y =
                num * (this.height / 2 + this.barWidth / 2);
            tvVerticalMesh.position.x =
                num * (this.width / 2 + this.barWidth / 2);

            this.add(tvHorizontalMesh);
            this.add(tvVerticalMesh);
        });

        let photoGeometry = new THREE.PlaneGeometry(this.width, this.height);

        let photoMesh = new THREE.Mesh(photoGeometry, material);

        this.add(photoMesh);
    }
}

MyTV.prototype.isGroup = true;

export { MyTV };
