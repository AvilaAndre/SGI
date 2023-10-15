import * as THREE from "three";
import { MyApp } from "../MyApp.js";
import { MyCurtain } from "./MyCurtain.js";

/**
 * This class contains a 3D window representation
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

        this.landscapeTexture = new THREE.TextureLoader().load(
            "textures/" + landscape
        );

        this.landscapeMaterial = new THREE.MeshPhongMaterial({
            map: this.landscapeTexture,
            specular: "#6E260E",
            emissive: "#000000",
            shininess: 10,
        });

        this.glassMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x00bfff, // Set the glass color (light blue in this case)
            transparent: true, // Make the material transparent
            opacity: 0.2, // Set the opacity level (0.0 to 1.0)
            roughness: 0.2, // Adjust the roughness (0.0 for smooth, 1.0 for rough)
            metalness: 0.1, // Adjust the metalness (0.0 for non-metallic, 1.0 for metallic)
            transmission: 0.9,
        });

        let windowHorizontalBar = new THREE.BoxGeometry(
            this.width + this.barWidth * 2,
            this.barDepth,
            this.barWidth
        );

        let windowVerticalBar = new THREE.BoxGeometry(
            this.barWidth,
            this.height + this.barWidth / 2,
            this.barDepth
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

            windowHorizontalMesh.position.y =
                num * (this.height / 2 + this.barWidth / 2);

            windowVerticalMesh.position.x =
                num * (this.width / 2 + this.barWidth / 2);

            this.add(windowHorizontalMesh);
            windowHorizontalMesh.castShadow = true

            this.add(windowVerticalMesh);
            windowVerticalMesh.castShadow = true
        });

        let windowHorizontalSplitMesh = new THREE.Mesh(
            windowHorizontalBar,
            this.windowMaterial
        );

        let windowVerticalSplitMesh = new THREE.Mesh(
            windowVerticalBar,
            this.windowMaterial
        );

        windowHorizontalSplitMesh.position.y = this.barWidth / 2;
        windowVerticalSplitMesh.position.x = this.barWidth / 2;

        this.add(windowHorizontalSplitMesh);
        this.add(windowVerticalSplitMesh);

        let landscapeGeometry = new THREE.PlaneGeometry(
            this.width,
            this.height
        );

        let landscapeMesh = new THREE.Mesh(
            landscapeGeometry,
            this.glassMaterial
        );

        this.add(landscapeMesh);


        this.curtainWidth = this.width / 2 + 1;


        this.curtainMesh1 = new MyCurtain(
            this.app,
            this.curtainWidth,
            this.height + 1,
            10,
            0.1
        );
        this.curtainMesh2 = new MyCurtain(
            this.app,
            this.curtainWidth,
            this.height + 1,
            10,
            0.1
        );

        this.add(this.curtainMesh1, this.curtainMesh2);

        this.curtainMesh1.position.y = -0.2;
        this.curtainMesh2.position.y = -0.2;

        this.curtainMesh1.scale.x = 1;
        this.curtainMesh1.position.x = this.curtainWidth / 2 + 1;
        this.curtainMesh1.position.z = 0.1;
        this.curtainMesh2.scale.x = 1;
        this.curtainMesh2.position.x = -this.curtainWidth / 2 - 1;
        this.curtainMesh2.position.z = 0.1;
    }

    moveCurtains(value) {
        const open = 0.8 * value + 0.2;

        this.curtainMesh1.scale.x = open;
        this.curtainMesh1.position.x =
            (-this.curtainWidth / 2) * open + this.curtainWidth;
        this.curtainMesh2.scale.x = open;
        this.curtainMesh2.position.x =
            (this.curtainWidth / 2) * open - this.curtainWidth;
    }
}

MyWindow.prototype.isGroup = true;

export { MyWindow };
