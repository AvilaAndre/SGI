import * as THREE from "three";
import { MyAxis } from "./MyAxis.js";
import { MyFileReader } from "./parser/MyFileReader.js";
import * as Utils from "./MyUtils.js";
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

        this.reader = new MyFileReader(app, this, this.onSceneLoaded);
        this.reader.open("scenes/demo/demo.xml");
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
        console.log("DEBUG: ", data);
        for (var key in data.nodes) {
            let node = data.nodes[key];

            const nodeObj = new THREE.Object3D();
            this.output(node, 1);
            this.applyTransformations(nodeObj, node.transformations);
            for (let i = 0; i < node.children.length; i++) {
                let child = node.children[i];

                if (child.type === "primitive") {
                    console.log(
                        "" +
                            new Array(2 * 4).join(" ") +
                            " - " +
                            child.type +
                            " with " +
                            child.representations.length +
                            " " +
                            child.subtype +
                            " representation(s)"
                    );
                    const geometry = this.createPrimitive(child);

                    nodeObj.add(new THREE.Mesh(geometry));

                    if (child.subtype === "nurbs") {
                        console.log(
                            "" +
                                new Array(3 * 4).join(" ") +
                                " - " +
                                child.representations[0].controlpoints.length +
                                " control points"
                        );
                    }
                } else {
                    this.output(child, 2);
                    //node ref!
                }
            }

            this.app.scene.add(this.nodes[data.rootId]);
        }

        // add cameras to the app object
        this.app.addCameras(this.cameras);
        this.app.setActiveCamera(data.activeCameraId);

        // reinitialize gui
        this.app.gui.init();
    }

    update() {}

    setOptions(options) {
        this.background = JSON.stringify(options.background) || 0;
        this.ambient = JSON.stringify(options.ambient) || 0;
    }

    addTexture(texture) {
        const newTexture = new THREE.Texture(
            texture.filepath,
            undefined,
            undefined,
            undefined,
            Utils.getMagFilterFromString(texture.magFilter),
            Utils.getMinFilterFromString(texture.minFilter),
            undefined,
            undefined,
            texture.anisotropy
        );

        this.textures[texture.id] = newTexture;

    }



    addMaterial(material){
        // Create a THREE.Color object with RGB values
        const materialColor = new THREE.Color(material.color.r / 255, material.color.g / 255, material.color.b / 255);

        // Get the hexadecimal representation of the color
        const hex = materialColor.getHexString();
        console.log("Material!", material);
        console.log("Material color!", material.color);
        console.log("r!", material.color.r);
        console.log("map: ", material.textureref);
        const newMaterial = new THREE.MeshPhongMaterial({
            color: materialColor,
            specular: material.specular ? material.specular : "#000000",
            emissive: material.emissive ? material.emissive : "#000000",
            map: material.textureref ? this.textures[material.textureref] : undefined,
            shininess: material.shininess ? material.shininess : 10,          
        });

        const materialMesh = new THREE.Mesh(

            newMaterial
        );

        material.map.repeat.set(texlength_s, texlength_t)

        this.materials[material.id] = newMaterial;
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
        if (child.subtype == "cylinder") {
            return new THREE.CylinderGeometry(
                child.representations["top"],
                child.representations["base"],
                child.representations["height"],
                child.representations["slices"],
                child.representations["stacks"],
                child.representations["capsclose"],
                child.representations["thetastart"],
                child.representations["thetalength"]
            );
        }
    }

    applyTransformations(node, transformations) {
        transformations.forEach((key) => {
            switch (key.type) {
                case "T":
                    node.position.x += key.translate[0];
                    node.position.y += key.translate[1];
                    node.position.z += key.translate[2];
                    break;
                case "S":
                    node.scale.x += key.scale[0];
                    node.scale.y += key.scale[1];
                    node.scale.z += key.scale[2];
                    break;
                case "R":
                    node.rotation.x += key.rotation[0];
                    node.rotation.y += key.rotation[1];
                    node.rotation.z += key.rotation[2];
                    break;
            }
        });
    }
}

export { MyContents };
