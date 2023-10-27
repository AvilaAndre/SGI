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
        }

        console.log("nodes:");
        for (var key in data.nodes) {
            let node = data.nodes[key];
            this.output(node, 1);
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
                }
            }
        }
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
        const newMaterial = new THREE.MeshBasicMaterial({
            color: material.diffuse,
            wireframe: true,
        });

        this.materials[material.id] = newMaterial;
    }
}

export { MyContents };
