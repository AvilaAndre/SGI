import * as THREE from "three";
import { MyAxis } from "./MyAxis.js";
import { MyFileReader } from "./parser/MyFileReader.js";
import * as Utils from "./MyUtils.js";
import { MyNurbsBuilder } from "./MyNurbsBuilder.js";
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
        // global settings
        this.background = null;
        this.ambient = null;
        // textures
        this.textures = new Object();
        // materials
        this.materials = new Object();

        //cameras
        this.cameras = new Object();
        //nodes
        this.nodes = new Object();

        //lights
        this.lights = new Object();

        // show debug gizmos
        this.DEBUG = true;

        this.wireframe = false;

        this.reader = new MyFileReader(app, this, this.onSceneLoaded);
        this.reader.open("scenes/room/demo.xml");
        console.log("MyContents constructed");
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
    }

    /**
     * Called when the scene xml file load is complete
     * @param {MySceneData} data the entire scene data object
     */
    onSceneLoaded(data) {
        console.info(
            "scene data loaded " +
                data +
                ". visit MySceneData javascript class to check contents for each data item."
        );
        this.onAfterSceneLoadedAndBeforeRender(data);
    }

    output(obj, indent = 0) {
        console.log(
            "" +
                new Array(indent * 4).join(" ") +
                " - " +
                obj.type +
                " " +
                (obj.id !== undefined ? "'" + obj.id + "'" : "")
        );
    }

    onAfterSceneLoadedAndBeforeRender(data) {
        // refer to descriptors in class MySceneData.js
        // to see the data structure for each item

        this.output(data.options);

        this.setOptions(data.options);

        console.log("data.options:", data.options);

        console.log("textures:");
        for (var key in data.textures) {
            let texture = data.textures[key];
            this.output(texture, 1);
            this.addTexture(texture);
        }

        console.log("materials:");
        for (var key in data.materials) {
            let material = data.materials[key];
            this.output(material, 1);
            this.addMaterial(material);
        }

        console.log("cameras:");
        for (var key in data.cameras) {
            let camera = data.cameras[key];
            this.output(camera, 1);
            this.addCamera(camera);
        }

        console.log("nodes:");
        const rootNode = this.instantiateNode(data.rootId, data);

        this.app.scene.add(rootNode);

        // add cameras to the app object
        this.app.addCameras(this.cameras);
        this.app.setActiveCamera(data.activeCameraId);

        // reinitialize gui

        //this.app.gui.init();
    }

    update() {}

    instantiateNode(nodeRef, data, parent = undefined) {
        let node = data.nodes[nodeRef];

        if (!node) return undefined;

        this.output(node, 1);

        const nodeObj = new THREE.Object3D();

        if (node.materialIds.length != 0)
            nodeObj.materialIds = node.materialIds;
        else if (parent != undefined) nodeObj.materialIds = parent.materialIds;
        else nodeObj.materialIds = [];

        nodeObj.children_refs = [];

        this.applyTransformations(nodeObj, node.transformations);

        nodeObj.castShadow = node.castShadows || parent?.castShadow;
        nodeObj.receiveShadow = node.receiveShadows || parent?.receiveShadows;

        for (let i = 0; i < node.children.length; i++) {
            let child = node.children[i];

            if (child.type === "primitive") {
                const geometry = this.createPrimitive(child);

                if (geometry !== undefined) {
                    if (nodeObj.materialIds) {
                        const mesh = new THREE.Mesh(
                            geometry,
                            this.materials[nodeObj.materialIds[0]]
                        );
                        mesh.castShadow = nodeObj.castShadow;
                        mesh.receiveShadow = nodeObj.receiveShadows;
                        nodeObj.add(mesh);
                    } else {
                        console.error("Material Missing in", nodeRef);
                    }
                }
            } else if (child.type === "pointlight") {
                const light = this.addPointlight(child);
                nodeObj.add(light);
            } else if (child.type === "spotlight") {
                const light = this.addSpotlight(child);
                nodeObj.add(light);
            } else if (child.type === "directionallight") {
                const light = this.addDirectionallight(child);
                nodeObj.add(light);
            } else {
                this.output(child, 2);

                const newChild = this.instantiateNode(child.id, data, nodeObj);
                if (newChild) nodeObj.add(newChild);
            }
        }

        return nodeObj;
    }

    setOptions(options) {
        const ambientColor = new THREE.Color(
            options.ambient.r,
            options.ambient.g,
            options.ambient.b
        );
        const light = new THREE.AmbientLight({
            color: ambientColor,
        });

        this.app.scene.add(light);

        const backgroundColor = new THREE.Color(
            options.background.r,
            options.background.g,
            options.background.b
        );
        this.app.scene.background = backgroundColor;
    }

    addTexture(texture) {
        const newTexture = new THREE.TextureLoader().load(texture.filepath);

        newTexture.magFilter = Utils.getMagFilterFromString(texture.magFilter);
        newTexture.minFilter = Utils.getMinFilterFromString(texture.minFilter);
        newTexture.anisotropy = texture.anisotropy;

        this.textures[texture.id] = newTexture;
    }

    addMaterial(material) {
        // Create a THREE.Color object with RGB values
        const materialColor = new THREE.Color(
            material.color.r,
            material.color.g,
            material.color.b
        );

        let intSides = material.twosided ? THREE.DoubleSide : THREE.FrontSide;

        let shadingBool = material.shading === "flat";

        const newMaterial = new THREE.MeshPhongMaterial({
            color: materialColor,
            specular: material.specular,
            emissive: material.emissive,
            map: this.textures[material.textureref || null],
            shininess: material.shininess,
            flatShading: shadingBool,
            wireframe: material.wireframe || false,
            texlength_s: material.texlength_s || 1,
            texlength_t: material.texlength_t || 1,
        });

        if (material.color.a == 1) {
            newMaterial.opacity = 1;
        } else {
            newMaterial.opacity = material.color.a;
        }

        newMaterial.side = intSides;

        newMaterial.wireframeValue = material.wireframe || false;

        this.materials[material.id] = newMaterial;
    }

    addPointlight(light) {
        // Now, positionArray contains the individual components as numbers
        const x = light.position[0];
        const y = light.position[1];
        const z = light.position[2];

        const lightColor = new THREE.Color(
            light.color.r,
            light.color.g,
            light.color.b
        );
        const newLight = new THREE.PointLight(
            lightColor,
            light.intensity || 1,
            light.distance || 1000,
            light.decay || 2
        );

        newLight.castShadow = light.castshadow || false;
        newLight.shadowFar = light.shadowFar || 500.0;
        newLight;
        newLight.position.set(x, y, z);

        // TODO: enabled default true

        // TODO: changes degrees to radians
        // TODO: change translate to position
        // TODO: skybox
        // TODO: texlength
        // TODO: adicionar à UI wireframe e enable/disable
        // TODO: castShadow

        if (this.DEBUG) {
            const helper = new THREE.PointLightHelper(newLight, 0.5);
            this.app.scene.add(helper);
        }

        return newLight;
    }

    addSpotlight(light) {
        // Now, positionArray contains the individual components as numbers
        const x = light.position[0];
        const y = light.position[1];
        const z = light.position[2];

        const lightColor = new THREE.Color(
            light.color.r,
            light.color.g,
            light.color.b
        );
        const newLight = new THREE.SpotLight(
            lightColor,
            light.intensity || 1,
            light.distance || 1000,
            light.angle,
            light.penumbra || 1,
            light.decay || 2
        );
        newLight.castShadow = light.castshadow;
        newLight.target.position.set(
            light.target[0],
            light.target[1],
            light.target[2]
        );

        newLight.shadowFar = light.shadowFar || 500.0;
        newLight.position.set(x, y, z);

        // TODO: enabled default true
        // TODO: shadowFar default 500.0
        // TODO: shadowmapsize default 512
        // TODO: enabled default true (luzes na GUI)
        // TODO: changes degrees to radians
        // TODO: change translate to position (fix room)
        // TODO: skybox

        if (this.DEBUG) {
            const helper = new THREE.SpotLightHelper(newLight, lightColor);
            this.app.scene.add(helper);
        }
        return newLight;
    }

    addDirectionallight(light) {
        // Now, positionArray contains the individual components as numbers
        const x = light.position[0];
        const y = light.position[1];
        const z = light.position[2];

        const lightColor = new THREE.Color(
            light.color.r,
            light.color.g,
            light.color.b
        );
        const newLight = new THREE.DirectionalLight(
            lightColor,
            light.intensity || 1
        );

        newLight.castShadow = light.castshadow;
        newLight.shadowFar = light.shadowFar || 500.0;
        newLight.position.set(x, y, z);

        // TODO: shadowleft default -5
        // TODO: shadowright default 5
        // TODO: shadowbottom default -5
        // TODO: shadowtop default 5

        // TODO: enabled default true
        // TODO: shadowFar default false
        // TODO: shadowmapsize default 512

        if (this.DEBUG) {
            const helper = new THREE.DirectionalLightHelper(
                newLight,
                lightColor
            );
            this.app.scene.add(helper);
        }

        return newLight;
    }

    /**
     *
     * @param {CameraData} camera
     * creates a camera based on the data received and adds to the cameras array
     */
    addCamera(camera) {
        let newCamera = undefined;

        if (camera.type == "perspective") {
            newCamera = new THREE.PerspectiveCamera(
                camera.angle,
                undefined,
                camera.near,
                camera.far
            );
        } else if (camera.type == "orthogonal") {
            newCamera = new THREE.OrthographicCamera(
                camera.left,
                camera.right,
                camera.top,
                camera.bottom,
                camera.near,
                camera.far
            );
        } else return;

        newCamera.position.set(
            camera.location[0],
            camera.location[1],
            camera.location[2]
        );

        const target = new THREE.Object3D();
        target.position.set(
            camera.target[0],
            camera.target[1],
            camera.target[2]
        );

        newCamera.target = target;

        this.cameras[camera.id] = newCamera;
    }

    createPrimitive(child) {
        if (child.subtype === "cylinder") {
            return new THREE.CylinderGeometry(
                child.representations[0]["top"],
                child.representations[0]["base"],
                child.representations[0]["height"],
                child.representations[0]["slices"],
                child.representations[0]["stacks"],
                child.representations[0]["capsclose"] || false,
                child.representations[0]["thetastart"],
                child.representations[0]["thetalength"]
            );
        } else if (child.subtype === "rectangle") {
            const point1 = child.representations[0]["xy1"];
            const point2 = child.representations[0]["xy2"];

            const geometry = new THREE.PlaneGeometry(
                point2[0] - point1[0],
                point2[1] - point1[1],
                child.representations["parts_x"],
                child.representations["parts_y"]
            );

            geometry.translate(
                (point2[0] + point1[0]) / 2,
                (point2[1] + point1[1]) / 2,
                0
            );

            return geometry;
        } else if (child.subtype === "triangle") {
            return new THREE.Triangle(
                new Vector3(
                    child.representations[0]["xyz1"][0],
                    child.representations[0]["xyz1"][1],
                    child.representations[0]["xyz1"][2]
                ),
                new Vector3(
                    child.representations[0]["xyz2"][0],
                    child.representations[0]["xyz2"][1],
                    child.representations[0]["xyz2"][2]
                ),
                new Vector3(
                    child.representations[0]["xyz3"][0],
                    child.representations[0]["xyz3"][1],
                    child.representations[0]["xyz3"][2]
                )
            );
        } else if (child.subtype === "sphere") {
            return new THREE.SphereGeometry(
                child.representations["radius"],
                child.representations["slices"],
                child.representations["stacks"],
                child.representations["phistart"],
                child.representations["philength"],
                child.representations["thetastart"],
                child.representations["thetalength"]
            );
        } else if (child.subtype === "nurbs") {
            const degree_v = child.representations[0]["degree_v"];
            const degree_u = child.representations[0]["degree_u"];
            const num_pts = child.representations[0].controlpoints.length;
            const controlpoints = [];

            for (let i = 0; i < num_pts / (degree_u + 1); i++) {
                const pt_to_add = [];
                for (let j = 0; j < degree_v + 1; j++) {
                    const point =
                        child.representations[0].controlpoints[
                            i * (degree_u + 1) + j
                        ];
                    pt_to_add.push([point.xx, point.yy, point.zz]);
                }
                controlpoints.push(pt_to_add);
            }

            return new MyNurbsBuilder().build(
                controlpoints,
                degree_u,
                degree_v,
                child.representations[0]["parts_u"],
                child.representations[0]["parts_v"]
            );
        } else if (child.subtype === "box") {
            const point1 = child.representations[0]["xyz1"];
            const point2 = child.representations[0]["xyz2"];

            return new THREE.BoxGeometry(
                point2[0] - point1[0],
                point2[1] - point1[1],
                point2[2] - point1[2],
                child.representations["parts_x"],
                child.representations["parts_y"],
                child.representations["parts_z"]
            );
        } else {
            console.error("Can't create primitive: ", child.subtype);
            return undefined;
        }
        // ("model3d");
        // ("skybox");
    }

    applyTransformations(node, transformations) {
        transformations.forEach((key) => {
            switch (key.type) {
                case "T":
                    node.translateX(key.translate[0]);
                    node.translateY(key.translate[1]);
                    node.translateZ(key.translate[2]);
                    break;
                case "S":
                    node.scale.x = key.scale[0];
                    node.scale.y = key.scale[1];
                    node.scale.z = key.scale[2];
                    break;
                case "R":
                    node.rotation.x = key.rotation[0] * (Math.PI / 180);
                    node.rotation.y = key.rotation[1] * (Math.PI / 180);
                    node.rotation.z = key.rotation[2] * (Math.PI / 180);
                    break;
            }
        });
    }

    /**
     *
     * Turns on/off the wireframe in the this.materials array
     */
    toggleWireframe(value) {
        console.log(this.materials);
        for (
            let index = 0;
            index < Object.keys(this.materials).length;
            index++
        ) {
            const material = this.materials[Object.keys(this.materials)[index]];

            material.wireframe = value || material.wireframeValue;
        }
    }
}

export { MyContents };
