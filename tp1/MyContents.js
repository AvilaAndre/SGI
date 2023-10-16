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
import { MySofa } from "./MyObjects/MySofa.js";
import { MyChandelier } from "./MyObjects/MyChandelier.js";
import { MyFlower } from "./MyObjects/MyFlower.js";
import { MyNurbsBuilder } from "./MyNurbsBuilder.js";
import { MySpring } from "./MyObjects/MySpring.js";
import { MyVase } from "./MyObjects/MyVase.js";
import { MyJournal } from './MyObjects/MyJournal.js';
import { MyTV } from './MyObjects/MyTV.js';

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
        this.fallen_chair = null;
        this.chairs = null;
        this.candle1 = null;
        this.candle2 = null;
        this.candle3 = null;
        this.candle4 = null;
        this.candle5 = null;
        this.mainSpotLight = null;
        this.frame1 = null;
        this.frame2 = null;
        this.window = null;
        this.cakeSlice = null;
        this.wallLamps = null;
        this.wallLampsColor = "#FFFFFF";
        this.wallLampsIntensity = 10;
        this.beetle = null;
        this.sofa = null;
        this.chandelier = null;
        this.windowLight = null;
        this.landscape = null;
        this.null = null;
        this.flower = null;
        this.spring = null;
        this.vase = null;
        this.journal = null;
        this.tv = null;

        // Array with every controllable light
        this.roomLights = [];
        this.lightsOn = true;
        this.curtain = 0.0;

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

        this.landscapeTexture = new THREE.TextureLoader().load(
            "textures/arouca.jpg"
        );
        this.landscapeTexture.wrapS = THREE.RepeatWrapping;
        this.landscapeTexture.wrapT = THREE.RepeatWrapping;

        // material
        this.diffusePlaneColor = "rgb(128,0,0)";
        this.specularPlaneColor = "rgb(0,0,0)";
        this.planeShininess = 0;

        this.planeMaterial = new THREE.MeshLambertMaterial({
            map: this.planeTexture,
        });
        this.landscapeMaterial = new THREE.MeshLambertMaterial({
            map: this.landscapeTexture,
        });
        this.floorMaterial = new THREE.MeshLambertMaterial({
            map: this.floorTexture,
        });

        this.wrappingModeU = null;

        //creating the hole in the wall for the window

        this.holeGeometry = new THREE.BoxGeometry(1, 1, 0.2);
        this.holeMaterial = new THREE.MeshStandardMaterial({
            transparent: true,
            opacity: 0,
        });

        const map = new THREE.TextureLoader().load(
            "textures/uv_grid_opengl.jpg"
        );
        map.wrapS = map.wrapT = THREE.RepeatWrapping;
        map.anisotropy = 16;
        map.colorSpace = THREE.SRGBColorSpace;
        this.material = new THREE.MeshLambertMaterial({
            map: map,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.9,
        });
        this.builder = new MyNurbsBuilder();
        this.meshes = [];
        this.samplesU = 8; // maximum defined in MyGuiInterface
        this.samplesV = 8; // maximum defined in MyGuiInterface

        this.observables = [];

        this.init();

        this.createNurbsSurfaces();

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
                Math.PI / 5,
                0.5,
                0.5
            );
            this.mainSpotLight.position.set(0, 8, 0);

            let defaultSpotLightTarget = new THREE.Object3D();
            defaultSpotLightTarget.position.set(0, 0, 0);

            this.mainSpotLight.target = defaultSpotLightTarget;

            this.mainSpotLight.castShadow = true;

            this.app.scene.add(this.mainSpotLight);

            this.roomLights.push({
                prevIntensity: this.mainSpotLight.intensity,
                light: this.mainSpotLight,
            });
        }

        // add an ambient light
        const ambientLight = new THREE.AmbientLight(0x555555, 12);
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
        this.planeMesh.receiveShadow = true;
        this.app.scene.add(this.planeMesh);

        this.wallWithFramesGroup = new THREE.Group();

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

        let backWallTop = new THREE.PlaneGeometry(10, 4.4);
        this.backWallTopMesh = new THREE.Mesh(backWallTop, this.planeMaterial);
        this.backWallTopMesh.position.copy(new THREE.Vector3(0, 7.75, -5));
        this.app.scene.add(this.backWallTopMesh);

        let backWallBottom = new THREE.PlaneGeometry(10, 2.45);
        this.backWallBottomMesh = new THREE.Mesh(
            backWallBottom,
            this.planeMaterial
        );
        this.backWallBottomMesh.position.copy(new THREE.Vector3(0, 1.2, -5));
        this.app.scene.add(this.backWallBottomMesh);

        let backWallLeft = new THREE.PlaneGeometry(2.4, 3.2);
        this.backWallLeftMesh = new THREE.Mesh(
            backWallLeft,
            this.planeMaterial
        );
        this.backWallLeftMesh.position.copy(new THREE.Vector3(-3.81, 4, -5));
        this.app.scene.add(this.backWallLeftMesh);

        let backWallRight = new THREE.PlaneGeometry(2.4, 3.2);
        this.backWallRightMesh = new THREE.Mesh(
            backWallRight,
            this.planeMaterial
        );
        this.backWallRightMesh.position.copy(new THREE.Vector3(3.81, 4, -5));
        this.app.scene.add(this.backWallRightMesh);

        let frontWall = new THREE.PlaneGeometry(10, 10);
        this.frontWallMesh = new THREE.Mesh(frontWall, this.planeMaterial);
        this.frontWallMesh.position.copy(new THREE.Vector3(0, 5, 5));
        this.frontWallMesh.rotation.y = Math.PI;
        this.app.scene.add(this.frontWallMesh);

        this.rightWallMesh.castShadow = true;
        this.rightWallMesh.receiveShadow = true;
        this.leftWallMesh.castShadow = true;
        this.leftWallMesh.receiveShadow = true;
        this.frontWallMesh.castShadow = true;
        this.frontWallMesh.receiveShadow = true;
        this.backWallBottomMesh.castShadow = true;
        this.backWallBottomMesh.receiveShadow = true;
        this.backWallLeftMesh.castShadow = true;
        this.backWallLeftMesh.receiveShadow = true;
        this.backWallRightMesh.castShadow = true;
        this.backWallRightMesh.receiveShadow = true;
        this.backWallTopMesh.castShadow = true;
        this.backWallTopMesh.receiveShadow = true;

        if (this.landscape === null) {
            this.landscape = new THREE.PlaneGeometry(15, 15);
            this.landscapeMesh = new THREE.Mesh(
                this.landscape,
                this.landscapeMaterial
            );
            this.landscapeMesh.position.set(0, 5, -8);
            this.app.scene.add(this.landscapeMesh);
        }

        if (this.hole === null) {
            this.hole = new THREE.Mesh(holeGeometry, holeMaterial);
            this.hole.position.set(0, 5, -5);
            this.hole.position.set(0, 0, 0); // Set the position of the hole within the wall
            scene.add(this.hole);
        }

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

            this.observables.push({
                object: this.cake,
                offset: new THREE.Vector3(0, 0.3, 0),
                angle: 0,
                name: "Cake",
            });
        }

        this.app.scene.add(this.cake);
        this.app.scene.add(this.tableGroup);

        // Cake slice

        if (this.cakeSlice === null) {
            this.cakeSlice = new MyCakeSlice(this);
            console.log(this.cakeSlice.position);
            this.cakeSlice.rotation.set(-Math.PI/4, 0, -Math.PI/2);
            this.cakeSlice.position.copy(new THREE.Vector3(2, 0, -1.5));

            
            this.app.scene.add(this.cakeSlice);
        }

        // Candle

        if (this.candle1 === null) {
            this.candle1 = new MyCandle(this);
            this.candle1.position.y = 1.4;
            this.candle1.position.x = 0.15;
            this.candle1.position.z = 0.07;

            const candleLight = new THREE.PointLight(0xffffff, 1, 0.2, 0.01);
            candleLight.position.set(0.15, 1.475, 0.07);
            this.app.scene.add(candleLight);
            this.app.scene.add(this.candle1);
        }

        if (this.candle2 === null) {
            this.candle2 = new MyCandle(this);
            this.candle2.position.y = 1.4;
            this.candle2.position.x = -0.15;
            this.candle2.position.z = 0.09;

            const candleLight = new THREE.PointLight(0xffffff, 1, 0.2, 0.01);
            candleLight.position.set(-0.15, 1.475, 0.09);
            this.app.scene.add(candleLight);
            this.app.scene.add(this.candle2);
        }

        if (this.candle3 === null) {
            this.candle3 = new MyCandle(this);
            this.candle3.position.y = 1.4;
            this.candle3.position.x = -0.15;
            this.candle3.position.z = -0.07;

            const candleLight = new THREE.PointLight(0xffffff, 1, 0.2, 0.01);
            candleLight.position.set(-0.15, 1.475, -0.07);
            this.app.scene.add(candleLight);
            this.app.scene.add(this.candle3);
        }

        if (this.candle4 === null) {
            this.candle4 = new MyCandle(this);
            this.candle4.position.y = 1.4;
            //this.candle4.position.x = 0.1;
            this.candle4.position.z = -0.15;

            const candleLight = new THREE.PointLight(0xffffff, 1, 0.2, 0.01);
            candleLight.position.set(0, 1.475, -0.15);
            this.app.scene.add(candleLight);
            this.app.scene.add(this.candle4);
        }

        if (this.candle5 === null) {
            this.candle5 = new MyCandle(this);
            this.candle5.position.y = 1.4;
            this.candle5.position.x = 0.15;
            this.candle5.position.z = -0.07;

            const candleLight = new THREE.PointLight(0xffffff, 1, 0.2, 0.01);
            candleLight.position.set(0.15, 1.475, -0.07);
            this.app.scene.add(candleLight);
            this.app.scene.add(this.candle5);
        }

        // Frame1 - Ávila

        if (this.frame1 === null) {
            this.frame1 = new MyFrame(this, 2, 2, "ávila.jpg");
            this.frame1.rotation.z = -Math.PI / 8;
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

        // Spring

        if (this.spring === null) {
            this.spring = new MySpring(this);
            this.spring.position.copy(new THREE.Vector3(0.6, 1.2, -0.5));
            this.spring.rotation.set(0, Math.PI / 8, 0);
            this.spring.scale.set(0.5, 0.5, 0.5);
            this.app.scene.add(this.spring);

            this.observables.push({
                object: this.spring,
                offset: new THREE.Vector3(0.4, 0, 0),
                angle: 0,
                name: "Spring"
            });
        }

        //journal

        if(this.journal === null){
            this.journal = new MyJournal(this);
            this.journal.scale.set(0.2, 0.2, 0.2);
            this.journal.rotation.set(-Math.PI/2, 0, 0);
            this.journal.position.copy(new THREE.Vector3(-0.6, 1.17, 0.5));
            this.app.scene.add(this.journal);

            this.observables.push({
                object: this.journal,
                offset: new THREE.Vector3(0, 0, 0),
                angle: Math.PI/2,
                name: "Newspaper"
            });
        }

        // TV

        if(this.tv === null){
            this.tv = new MyTV(this, 5, 3);
            this.tv.rotation.set(0, -Math.PI/2, 0);
            this.tv.position.copy(new THREE.Vector3(4.9, 3, 0));
            this.app.scene.add(this.tv);

            this.observables.push({
                object: this.tv,
                offset: new THREE.Vector3(0, 0, 0),
                angle: Math.PI,
                name: "TV"
            });
        }


        //Window

        if (this.window === null) {
            this.window = new MyWindow(this, 5, 3, "arouca.jpg");
            this.window.position.copy(new THREE.Vector3(0, 4, -5));
            this.window.moveCurtains(this.curtain);
            this.app.scene.add(this.window);
        }

        if (this.windowLight === null) {
            this.windowLight = new THREE.PointLight("#FFFFFF", 1, 100, 0.3);
            this.windowLight.castShadow = true;
            this.windowLight.position.set(0, 6.3, -6.3);

            this.app.scene.add(this.windowLight);
        }

        /** Chair **/

        if (this.fallen_chair === null) {
            this.fallen_chair = new MyChair(this);
            this.fallen_chair.position.y += 0.001;
            this.fallen_chair.position.z = -2.5;
            this.fallen_chair.rotation.z = -Math.PI / 3;
            this.fallen_chair.rotation.x = Math.PI / 2;
            this.fallen_chair.position.y = 0.3;
            this.app.scene.add(this.fallen_chair);
        }

        if (this.chairs == null) {
            this.chairs = new THREE.Group();

            const positions = [
                { position: new THREE.Vector3(-1.5, 0, 0), rotation: Math.PI },
                { position: new THREE.Vector3(1.5, 0, 0), rotation: 0 },
                {
                    position: new THREE.Vector3(0.6, 0, 1),
                    rotation: -Math.PI / 2,
                },
                {
                    position: new THREE.Vector3(-0.6, 0, 1),
                    rotation: -Math.PI / 2,
                },
                {
                    position: new THREE.Vector3(-1, 0, -2),
                    rotation: (3 * Math.PI) / 4,
                },
            ];

            for (let index = 0; index < positions.length; index++) {
                const element = positions[index];
                const position = element.position;
                const rotation = element.rotation;

                // Lamp
                let newChair = new MyChair(this);

                newChair.position.set(...position);
                newChair.rotation.y = rotation;

                this.chairs.add(newChair);
            }

            this.app.scene.add(this.chairs);
        }

        this.app.scene.add(this.wallWithFramesGroup);

        /*if (this.wallLamps == null) {
            this.wallLamps = new THREE.Group();

            const positions = [
                { position: new THREE.Vector3(-5, 9, 0), rotation: 0 },
                { position: new THREE.Vector3(5, 9, 0), rotation: Math.PI },
                { position: new THREE.Vector3(0, 9, 5), rotation: Math.PI / 2 },
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

                spotLight.castShadow = true;

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

                this.roomLights.push({
                    prevIntensity: spotLight.intensity,
                    light: spotLight,
                });

                this.wallLamps.add(newWallLampGroup);
            }

            this.app.scene.add(this.wallLamps);
        }*/

        if (this.beetle == null) {
            this.beetle = new MyBeetle(this);

            this.beetle.position.set(0, 3, 4.98);

            this.app.scene.add(this.beetle);

            this.observables.push({
                object: this.beetle,
                offset: new THREE.Vector3(0, 0, 0),
                angle: -Math.PI / 2,
                name: "Beetle",
            });
        }

        if (this.sofa == null) {
            this.sofa = new MySofa(this);

            this.sofa.position.set(0, 0, 3.95); // 5 is wall z, 1.2 is for the sofa, 0.05 is a padding

            this.app.scene.add(this.sofa);
        }

        if (this.chandelier == null) {
            this.chandelier = new MyChandelier(this);

            const chandelierPosition = new THREE.Vector3(0, 8, 0);

            this.chandelier.position.set(...chandelierPosition);
            this.mainSpotLight.position.set(...chandelierPosition);

            this.app.scene.add(this.chandelier);
        }

        if (this.flower == null) {
            this.flower = new MyFlower(this);

            this.flower.position.set(4, 0.05, -4);

            this.app.scene.add(this.flower);


            this.observables.push({
                object: this.flower,
                offset: new THREE.Vector3(0, 0.6, 0),
                angle: Math.PI,
                name: "Flower",
            });
        }

        if (this.vase == null) {
            this.vase = new MyVase(this, 0.2, 0.4);

            this.vase.position.set(4.05, 0, -3.95)
            this.app.scene.add(this.vase);
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

    toggleLights(value) {
        if (value) {
            for (let index = 0; index < this.roomLights.length; index++) {
                const lightInfo = this.roomLights[index];

                if (lightInfo.light.intensity == 0)
                    lightInfo.light.intensity = lightInfo.prevIntensity;
            }
        } else {
            for (let index = 0; index < this.roomLights.length; index++) {
                const lightInfo = this.roomLights[index];

                lightInfo.prevIntensity = lightInfo.light.intensity;
                lightInfo.light.intensity = 0;
            }
        }
    }

    moveCurtain(value) {
        this.curtain = value;

        if (this.window !== null) {
            this.window.moveCurtains(this.curtain);
            this.windowLight.angle = (Math.PI / 4) * (1 - value);
        }
    }

    /**
     * removes (if existing) and recreates the nurbs surfaces
     */
    createNurbsSurfaces() {
        // are there any meshes to remove?
        if (this.meshes !== null) {
            // traverse mesh array
            for (let i = 0; i < this.meshes.length; i++) {
                // remove all meshes from the scene
                this.app.scene.remove(this.meshes[i]);
            }
            this.meshes = []; // empty the array
        }

        // declare local variables
        let controlPoints;
        let surfaceData;
        let mesh;
        let orderU = 1;
        let orderV = 1;
        // build nurb #1
        controlPoints =
            [   // U = 0
                [ // V = 0..1;
                    [-2.0, -2.0, 0.0, 1 ],
                    [-2.0,  2.0, 0.0, 1 ]
                ],
                // U = 1
                [ // V = 0..1
                    [ 2.0, -2.0, 0.0, 1 ],
                    [ 2.0,  2.0, 0.0, 1 ]                                                
                ]
            ]
       
        surfaceData = this.builder.build(controlPoints,
                      orderU, orderV, this.samplesU,
                      this.samplesV, this.material)  
        mesh = new THREE.Mesh( surfaceData, this.material );
        mesh.rotation.x = 0
        mesh.rotation.y = 0
        mesh.rotation.z = 0
        mesh.scale.set( 0,3,0 )
        mesh.position.set( 0,0,0 )
        this.app.scene.add( mesh )
        this.meshes.push (mesh)

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
