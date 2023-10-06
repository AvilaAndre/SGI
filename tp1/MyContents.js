import * as THREE from "three";
import { MyAxis } from "./MyAxis.js";
import { MyTable } from "./MyObjects/MyTable.js";
import { MyChair } from "./MyObjects/MyChair.js";
import { MyPlate } from "./MyObjects/MyPlate.js";
import { MyCake } from "./MyObjects/MyCake.js";
import { MyCandle } from "./MyObjects/MyCandle.js";
import { MyFrame } from "./MyObjects/MyFrame.js";
import { MyWindow } from "./MyObjects/MyWindow.js";
import { MyCakeSlice } from "./MyObjects/MyCakeSlice.js";
import { MyWallLamp } from "./MyObjects/MyWallLamp.js";
import { MyBeetle } from "./MyObjects/MyBeetle.js";

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
        this.table = null;
        this.plate = null;
        this.cake = null;
        this.chair = null;
        this.candle = null;
        this.mainSpotLight = null;
        this.frame1 = null;
        this.frame2 = null;
        this.window = null;
        this.cakeSlice = null;
        this.wallLamps = null;
        this.wallLampsColor = "#FFFFFF";
        this.wallLampsIntensity = 10;
        this.beetle = null;

        // box related attributes
        this.boxMesh = null;
        this.boxMeshSize = 1.0;
        this.boxEnabled = false;
        this.lastBoxEnabled = null;
        this.boxDisplacement = new THREE.Vector3(0, 2, 0);

        //box texture
        this.boxTexture = new THREE.TextureLoader().load(
            "textures/feup_entry.jpg"
        );
        this.boxTexture.wrapS = THREE.RepeatWrapping;
        this.boxTexture.wrapT = THREE.RepeatWrapping;
        this.boxMaterial = new THREE.MeshLambertMaterial({
            map: this.boxTexture,
        });

        // plane related attributes
        //texture
        this.floorTexture = new THREE.TextureLoader().load(
            "textures/floor.jpg"
        );
        this.planeTexture = new THREE.TextureLoader().load(
            "textures/symmetricalWallpaper.jpg"
        );
        this.planeTexture.wrapS = THREE.RepeatWrapping;
        this.planeTexture.wrapT = THREE.RepeatWrapping;
        // material
        this.diffusePlaneColor = "rgb(128,0,0)";
        this.specularPlaneColor = "rgb(0,0,0)";
        this.planeShininess = 0;
        // relating texture and material:
        // two alternatives with different results
        // alternative 1
        /*this.planeMaterial = new THREE.MeshPhongMaterial({
                color: this.diffusePlaneColor,
                specular: this.specularPlaneColor,
                emissive: "#000000", shininess: this.planeShininess,
                map: this.planeTexture })*/
        // end of alternative 1
        // alternative 2

        this.planeMaterial = new THREE.MeshLambertMaterial({
            map: this.planeTexture,
        });
        this.floorMaterial = new THREE.MeshLambertMaterial({
            map: this.floorTexture,
        });
        // end of alternative 2
        let plane = new THREE.PlaneGeometry(10, 10);

        //wrapping mode U
        this.wrappingModeU = null;
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

        this.boxMesh = new THREE.Mesh(box, this.boxMaterial);
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

        if (this.mainSpotLight == null) {
            this.mainSpotLight = new THREE.SpotLight(
                "#FFFFFF",
                20,
                9,
                Math.PI / 12,
                0,
                0.5
            );
            this.mainSpotLight.position.set(0, 8, 0);

            let defaultSpotLightTarget = new THREE.Object3D();
            defaultSpotLightTarget.position.set(0, 0, 0);

            this.mainSpotLight.target = defaultSpotLightTarget;

            this.mainSpotLightHelper = new THREE.SpotLightHelper(
                this.mainSpotLight,
                "#FFFFFF"
            );

            this.app.scene.add(
                this.mainSpotLight
                //defaultSpotLightTarget,
                //this.mainSpotLightHelper
            );
        }

        // add an ambient light
        const ambientLight = new THREE.AmbientLight(0x555555, 0.1);
        this.app.scene.add(ambientLight);

        this.buildBox();

        // Create a Plane Mesh with basic material
        let planeSizeU = 10;
        let planeSizeV = 10;
        let planeUVRate = planeSizeV / planeSizeU;
        let planeTextureUVRate = 3354 / 2385; // image dimensions
        let planeTextureRepeatU = 1;
        let planeTextureRepeatV =
            planeTextureRepeatU * planeUVRate * planeTextureUVRate;
        this.planeTexture.repeat.set(planeTextureRepeatU, planeTextureRepeatV);
        this.planeTexture.rotation = (30 * Math.PI) / 180;
        this.planeTexture.offset = new THREE.Vector2(0, 0);
        var plane = new THREE.PlaneGeometry(planeSizeU, planeSizeV);
        this.planeMesh = new THREE.Mesh(plane, this.floorMaterial);
        this.planeMesh.rotation.x = -Math.PI / 2;
        this.planeMesh.position.y = 0;
        this.app.scene.add(this.planeMesh);

        this.wallWithFramesGroup = new THREE.Group();

        //Floor
        /*let plane = new THREE.PlaneGeometry(10, 10);
        this.planeMesh = new THREE.Mesh(plane, this.planeMaterial);
        this.planeMesh.rotation.x = -Math.PI / 2;
        this.planeMesh.position.y = -0;
        this.app.scene.add(this.planeMesh);*/

        let rightWall = new THREE.PlaneGeometry(10, 10);
        this.rightWallMesh = new THREE.Mesh(rightWall, this.planeMaterial);
        this.rightWallMesh.rotation.x = -Math.PI / 2;
        this.rightWallMesh.rotation.y = -Math.PI / 2;
        this.rightWallMesh.position.x = 5;
        this.rightWallMesh.position.y = 5;
        this.app.scene.add(this.rightWallMesh);

        //Walls
        let leftWall = new THREE.PlaneGeometry(10, 10);
        this.leftWallMesh = new THREE.Mesh(leftWall, this.planeMaterial);
        this.leftWallMesh.rotation.x = Math.PI / 2;
        this.leftWallMesh.rotation.y = Math.PI / 2;
        this.leftWallMesh.position.x = -5;
        this.leftWallMesh.position.y = 5;
        this.wallWithFramesGroup.add(this.leftWallMesh);
        this.app.scene.add(this.leftWallMesh);

        let backWall = new THREE.PlaneGeometry(10, 10);
        this.backWallMesh = new THREE.Mesh(backWall, this.planeMaterial);
        this.backWallMesh.position.copy(new THREE.Vector3(0, 5, -5));
        this.app.scene.add(this.backWallMesh);

        let frontWall = new THREE.PlaneGeometry(10, 10);
        this.frontWallMesh = new THREE.Mesh(frontWall, this.planeMaterial);
        this.frontWallMesh.position.copy(new THREE.Vector3(0, 5, 5));
        this.frontWallMesh.rotation.y = Math.PI;
        this.app.scene.add(this.frontWallMesh);

        /** TABLE **/

        this.tableGroup = new THREE.Group();

        if (this.table === null) {
            this.table = new MyTable(this);
            this.table.position.y += 0.001;
            this.tableGroup.add(this.table);
        }

        /** PLATE **/
        if (this.plate === null) {
            this.plate = new MyPlate(this);
            this.plate.position.y = 1;
            this.plate.position.y += 0.001;
            this.tableGroup.add(this.plate);
        }

        //Cake

        if (this.cake === null) {
            this.cake = new MyCake(this, "chocolate");
            this.cake.position.y = 0.86;
            this.tableGroup.add(this.cake);

            this.mainSpotLight.target = this.cake;
        }

        this.app.scene.add(this.cake);
        this.app.scene.add(this.tableGroup);

        // Cake slice

        if (this.cakeSlice === null) {
            this.cakeSlice = new MyCakeSlice(this);
            this.app.scene.add(this.cakeSlice);
        }

        // Candle

        if (this.candle === null) {
            this.candle = new MyCandle(this);
            this.candle.position.y = 1.4;
            this.candle.position.x = 0.1;

            const candleLight = new THREE.PointLight(0xffffff, 1, 0.2, 0.01);
            candleLight.position.set(0.1, 1.475, 0);
            this.app.scene.add(candleLight);

            const sphereSize = 0.05;
            const pointLightHelper = new THREE.PointLightHelper(
                candleLight,
                sphereSize
            );
            this.app.scene.add(pointLightHelper);
            this.app.scene.add(this.candle);
        }

        // Frame1 - Ávila

        if (this.frame1 === null) {
            this.frame1 = new MyFrame(this, 2, 2, "ávila.jpg");
            this.frame1.position.y = 4;
            this.frame1.position.x = -4.9;
            this.frame1.position.z = 2;
            this.frame1.rotation.y = Math.PI / 2;
            this.wallWithFramesGroup.add(this.frame1);
            this.app.scene.add(this.frame1);
        }

        // Frame2 - Sofia

        if (this.frame2 === null) {
            this.frame2 = new MyFrame(this, 2, 2.5, "sofia.jpg");
            this.frame2.position.y = 3;
            this.frame2.position.x = -4.9;
            this.frame2.position.z = -2;
            this.frame2.rotation.y = Math.PI / 2;
            this.wallWithFramesGroup.add(this.frame2);
            this.app.scene.add(this.frame2);
        }

        //Window

        if (this.window === null) {
            this.window = new MyWindow(this, 5, 3, "arouca.jpg");
            this.window.position.copy(new THREE.Vector3(0, 4, -4.9));
            this.app.scene.add(this.window);
        }

        /** Chair **/

        if (this.chair === null) {
            this.chair = new MyChair(this);
            this.chair.position.y += 0.001;
            this.chair.position.z = -2.5;
            this.chair.rotation.z = -Math.PI / 3;
            this.chair.rotation.x = Math.PI / 2;
            this.chair.position.y = 0.3;
            this.app.scene.add(this.chair);
        }

        this.app.scene.add(this.wallWithFramesGroup);

        if (this.wallLamps == null) {
            this.wallLamps = new THREE.Group();

            const positions = [
                { position: new THREE.Vector3(-5, 6, 0), rotation: 0 },
                { position: new THREE.Vector3(5, 6, 0), rotation: Math.PI },
                { position: new THREE.Vector3(0, 6, 5), rotation: Math.PI / 2 },
            ];

            for (let index = 0; index < positions.length; index++) {
                const element = positions[index];
                const position = element.position;
                const rotation = element.rotation;

                // Lamp
                let wallLamp = new MyWallLamp(this);

                wallLamp.position.set(...position);
                wallLamp.rotation.y = rotation;

                // Light

                let spotLight = new THREE.SpotLight(
                    this.wallLampsColor,
                    this.wallLampsIntensity,
                    0,
                    Math.PI / 4,
                    0.5,
                    2
                );

                let defaultSpotLightTarget = new THREE.Object3D();
                defaultSpotLightTarget.position.set(position.x, 0, position.z);
                spotLight.target = defaultSpotLightTarget;

                let x_multiplier = 0;
                if (position.x > 0) x_multiplier = -1;
                if (position.x < 0) x_multiplier = 1;

                let z_multiplier = 0;
                if (position.z > 0) z_multiplier = -1;
                if (position.z < 0) z_multiplier = 1;

                spotLight.position.set(
                    position.x + 0.05 * x_multiplier,
                    position.y + 0.15,
                    position.z + 0.05 * z_multiplier
                );

                let newWallLampGroup = new THREE.Group();

                newWallLampGroup.add(wallLamp);
                newWallLampGroup.add(spotLight);

                this.wallLamps.add(newWallLampGroup);
            }

            this.app.scene.add(this.wallLamps);
        }

        if (this.beetle == null) {
            this.beetle = new MyBeetle(this);

            this.beetle.position.set(0, 3, 2)

            this.app.scene.add(this.beetle);
        }
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

    // ???????????
    updateWrappingModeU(value) {
        this.wrappingModeU = value;
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
     * Updates the color of the wall lamps spotlight
     */
    updateWallLampsColor(value) {
        for (let index = 0; index < this.wallLamps.children.length; index++) {
            const lamp = this.wallLamps.children[index].children[1];

            lamp.color.set(value);
        }
    }

    /**
     * Updates the intensity of the wall lamps spotlight
     */
    updateWallLampsIntensity(value) {
        for (let index = 0; index < this.wallLamps.children.length; index++) {
            const lamp = this.wallLamps.children[index].children[1];

            lamp.intensity = value;
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
