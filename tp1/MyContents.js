import * as THREE from "three";
import { MyAxis } from "./MyAxis.js";

/**
 *  This class contains the contents of out application
 */
class MyContents {
    /**
       constructs the object
       @param {MyApp} app The application object
    */
    constructor(app) {
        this.app = app;
        this.axis = null;

        // box related attributes
        this.boxMesh = null;
        this.boxMeshSize = 1.0;
        this.boxEnabled = true;
        this.lastBoxEnabled = null;
        this.boxDisplacement = new THREE.Vector3(0, 2, 0);

        // plane related attributes
        this.diffusePlaneColor = "#00ffff";
        this.specularPlaneColor = "#777777";
        this.planeShininess = 30;
        this.planeMaterial = new THREE.MeshPhongMaterial({
            color: this.diffusePlaneColor,
            specular: this.diffusePlaneColor,
            emissive: "#000000",
            shininess: this.planeShininess,
        });

        this.tableMaterial = new THREE.MeshPhongMaterial({
            color: "#964B00",
            specular: "#6E260E",
            emissive: "#000000",
            shininess: 10,
        });

        this.plateMaterial = new THREE.MeshPhongMaterial({
            collor: "#FFFFFF",
            specular: "#6E260E",
            emissive: "#000000",
            shininess: 10,
        });
    }

    /**
     * builds the box mesh with material assigned
     */
    buildBox() {
        let boxMaterial = new THREE.MeshPhongMaterial({
            color: "#ffff77",
            specular: "#000000",
            emissive: "#000000",
            shininess: 90,
        });

        // Create a Cube Mesh with basic material
        let box = new THREE.BoxGeometry(
            this.boxMeshSize,
            this.boxMeshSize,
            this.boxMeshSize
        );
        this.boxMesh = new THREE.Mesh(box, boxMaterial);
        this.boxMesh.rotation.x = 0;
        this.boxMesh.position.y = 2;
        this.boxMesh.scale.z = 2;
    }

    /**
     * initializes the contents
     */
    init() {
        // create once
        if (this.axis === null) {
            // create and attach the axis to the scene
            this.axis = new MyAxis(this);
            this.app.scene.add(this.axis);
        }

        // add a point light on top of the model
        const pointLight = new THREE.PointLight(0xffffff, 500, 0);
        pointLight.position.set(0, 20, 0);
        this.app.scene.add(pointLight);

        // add a point light helper for the previous point light
        const sphereSize = 0.5;
        const pointLightHelper = new THREE.PointLightHelper(
            pointLight,
            sphereSize
        );
        this.app.scene.add(pointLightHelper);

        // add an ambient light
        const ambientLight = new THREE.AmbientLight(0x555555);
        this.app.scene.add(ambientLight);

        this.buildBox();

        // Create a Plane Mesh with basic material

        let plane = new THREE.PlaneGeometry(10, 10);
        this.planeMesh = new THREE.Mesh(plane, this.planeMaterial);
        this.planeMesh.rotation.x = -Math.PI / 2;
        this.planeMesh.position.y = -0;
        this.app.scene.add(this.planeMesh);

        let rightWall = new THREE.PlaneGeometry(10, 10);
        this.rightWallMesh = new THREE.Mesh(rightWall, this.planeMaterial);
        this.rightWallMesh.rotation.x = Math.PI / 2;
        this.rightWallMesh.position.x = 5;
        this.app.scene.add(this.rightWallMesh);

        /** TABLE **/
        let tableTop = new THREE.BoxGeometry(3, 0.2, 2);
        this.tableTopMesh = new THREE.Mesh(tableTop, this.tableMaterial);
        this.tableTopMesh.position.y = 0.9;
        this.app.scene.add(this.tableTopMesh);

        let tableLeg = new THREE.CylinderGeometry(0.1, 0.1, 0.8, 10, 2, true);
        this.tableLegMesh1 = new THREE.Mesh(tableLeg, this.tableMaterial);
        this.tableLegMesh1.position.x = 1.3;
        this.tableLegMesh1.position.y = 0.4;
        this.tableLegMesh1.position.z = 0.8;
        this.tableLegMesh2 = new THREE.Mesh(tableLeg, this.tableMaterial);
        this.tableLegMesh2.position.x = -1.3;
        this.tableLegMesh2.position.y = 0.4;
        this.tableLegMesh2.position.z = 0.8;
        this.tableLegMesh3 = new THREE.Mesh(tableLeg, this.tableMaterial);
        this.tableLegMesh3.position.x = 1.3;
        this.tableLegMesh3.position.y = 0.4;
        this.tableLegMesh3.position.z = -0.8;
        this.tableLegMesh4 = new THREE.Mesh(tableLeg, this.tableMaterial);
        this.tableLegMesh4.position.x = -1.3;
        this.tableLegMesh4.position.y = 0.4;
        this.tableLegMesh4.position.z = -0.8;
        this.app.scene.add(this.tableLegMesh1);
        this.app.scene.add(this.tableLegMesh2);
        this.app.scene.add(this.tableLegMesh3);
        this.app.scene.add(this.tableLegMesh4);

        /** PLATE **/
        let plate = new THREE.CylinderGeometry(0.4, 0.3, 0.1, 40, 2);
        this.plateMesh = new THREE.Mesh(plate, this.plateMaterial);
        this.plateMesh.position.y = 1

        this.app.scene.add(this.plateMesh);
    }

    /**
     * updates the diffuse plane color and the material
     * @param {THREE.Color} value
     */
    updateDiffusePlaneColor(value) {
        this.diffusePlaneColor = value;
        this.planeMaterial.color.set(this.diffusePlaneColor);
    }
    /**
     * updates the specular plane color and the material
     * @param {THREE.Color} value
     */
    updateSpecularPlaneColor(value) {
        this.specularPlaneColor = value;
        this.planeMaterial.specular.set(this.specularPlaneColor);
    }
    /**
     * updates the plane shininess and the material
     * @param {number} value
     */
    updatePlaneShininess(value) {
        this.planeShininess = value;
        this.planeMaterial.shininess = this.planeShininess;
    }

    /**
     * rebuilds the box mesh if required
     * this method is called from the gui interface
     */
    rebuildBox() {
        // remove boxMesh if exists
        if (this.boxMesh !== undefined && this.boxMesh !== null) {
            this.app.scene.remove(this.boxMesh);
        }
        this.buildBox();
        this.lastBoxEnabled = null;
    }

    /**
     * updates the box mesh if required
     * this method is called from the render method of the app
     * updates are trigered by boxEnabled property changes
     */
    updateBoxIfRequired() {
        if (this.boxEnabled !== this.lastBoxEnabled) {
            this.lastBoxEnabled = this.boxEnabled;
            if (this.boxEnabled) {
                this.app.scene.add(this.boxMesh);
            } else {
                this.app.scene.remove(this.boxMesh);
            }
        }
    }

    /**
     * updates the contents
     * this method is called from the render method of the app
     *
     */
    update() {
        // check if box mesh needs to be updated
        this.updateBoxIfRequired();

        // sets the box mesh position based on the displacement vector
        this.boxMesh.position.x = this.boxDisplacement.x;
        this.boxMesh.position.y = this.boxDisplacement.y;
        this.boxMesh.position.z = this.boxDisplacement.z;
    }
}

export { MyContents };
