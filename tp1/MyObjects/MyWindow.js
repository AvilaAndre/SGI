import * as THREE from "three";
import { MyApp } from "../MyApp.js";

/**
 * This class contains a 3D chair representation
 */
class MyWindow extends THREE.Object3D {
    /**
     *
     * @param {MyApp} app the application object
     * @param {number} width the width of the window
     * @param {number} height the height of the window
     * @param {number} barWidth the depth of the window's bar
     * @param {number} barDepth the depth of the window's bar
     * @param {string} landscape the photo to display in the window
     */
    constructor(app, width, height, landscape, barWidth, barDepth) {
        super();
        this.app = app;
        this.type = "Group";
        this.width = width || 0.4;
        this.height = height || 0.6;
        this.barWidth = barWidth || 0.1;
        this.barDepth = barDepth || 0.06;

        this.windowMaterial = new THREE.MeshPhongMaterial({
            color: "#A1662F",
            specular: "#000000",
            emissive: "#000000",
            shininess: 10,
        });

        this.landscapeTexture = new THREE.TextureLoader().load('textures/' + landscape);

        this.landscapeMaterial = new THREE.MeshPhongMaterial({
            map: this.landscapeTexture,
            specular: "#6E260E",
            emissive: "#000000",
            shininess: 10,
        });

        let windowHorizontalBar = new THREE.BoxGeometry(
            this.width + this.barWidth*2,
            this.barDepth,
            this.barWidth,
        );


        let windowVerticalBar = new THREE.BoxGeometry(
            this.barWidth,
            this.height + this.barWidth/2,
            this.barDepth,
        );


        [-1, 1].forEach((num) => {
            let windowHorizontalMesh = new THREE.Mesh(
                windowHorizontalBar,
                this.windowMaterial
            );


            let windowVerticalMesh = new THREE.Mesh(
                windowVerticalBar,
                this.windowMaterial
            );




            windowHorizontalMesh.position.y = num * ((this.height / 2) + this.barWidth/2);

            windowVerticalMesh.position.x = num * ((this.width / 2) + this.barWidth/2);


            this.add(windowHorizontalMesh);

            this.add(windowVerticalMesh);

        });

        let windowHorizontalSplitMesh = new THREE.Mesh(
            windowHorizontalBar,
            this.windowMaterial
        );

        let windowVerticalSplitMesh = new THREE.Mesh(
            windowVerticalBar,
            this.windowMaterial
        );

        windowHorizontalSplitMesh.position.y = this.barWidth/2;
        windowVerticalSplitMesh.position.x = this.barWidth/2;

        this.add(windowHorizontalSplitMesh);
        this.add(windowVerticalSplitMesh);

        let landscapeGeometry = new THREE.PlaneGeometry(this.width, this.height);

        let landscapeMesh = new THREE.Mesh(
            landscapeGeometry,
            this.landscapeMaterial
        );
        

        this.add(landscapeMesh)

    }
}

MyWindow.prototype.isGroup = true;

export { MyWindow };