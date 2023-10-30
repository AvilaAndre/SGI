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
        for (var key in data.nodes) {
            console.log("data:", data)
            let node = data.nodes[key];
            this.output(node, 1);

            const nodeObj = new THREE.Object3D();

            nodeObj.children_refs = [];

            this.applyTransformations(nodeObj, node.transformations);
            for (let i = 0; i < node.children.length; i++) {
                let child = node.children[i];
                console.log("características child:", child)
                console.log("caracteristicas node!:", node)

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

                    const geometry = this.createPrimitive(child);

                    if (geometry !== undefined)
                    console.log("materials!: ", this.materials);
                    console.log("materials specific: ", this.materials["tableApp"]);
                    console.log("dentro do último if:")
                    console.log("child: ", child);
                    console.log("nodeObj: ", nodeObj);
                    console.log("node:", node);
                    console.log("node materialsID:", node.materialIds);
                    console.log("node materialIds 0: ", node.materialIds[0]);
                    console.log("this.materials[node.materialIds[0]]: ", this.materials[node.materialIds[0]])
                    if(node.materialIds.length > 0){
                        this.newMaterial = this.materials[node.materialIds[0]];
                        console.log("newMaterial: ", this.newMaterial);
                        console.log("texturas:", this.textures);
                        nodeObj.add(new THREE.Mesh(geometry, this.newMaterial));
                        
                    } else{
                        nodeObj.add(new THREE.Mesh(geometry));
                    }
                        
                } else {
                    this.output(child, 2);

                    nodeObj.children_refs.push(child.id);
                }
                this.nodes[key] = nodeObj;
            }
        }

        this.resolveHierarchy(data.rootId);

        this.app.scene.add(this.nodes[data.rootId]);
        const ambientLight = new THREE.AmbientLight(0x000000, 20);
        this.app.scene.add(ambientLight);

        // add cameras to the app object
        this.app.addCameras(this.cameras);
        this.app.setActiveCamera(data.activeCameraId);

        // reinitialize gui

        //this.app.gui.init();
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
        console.log("map2: ", this.textures[material.textureref]);
        if(material.twosided == "true"){
            this.intSides= 2;
        } else{
            this.intSides = 1;
        }
        const newMaterial = new THREE.MeshPhongMaterial({
            color: materialColor,
            specular: material.specular,
            emissive: material.emissive,
            map: this.textures[material.textureref],
            shininess: material.shininess,
            //Not sure if is supossed to be this way
            //forceSinglePass: this.intSides,     
        });



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
        if (child.subtype === "cylinder") {
            return new THREE.CylinderGeometry(
                child.representations[0]["top"],
                child.representations[0]["base"],
                child.representations[0]["height"],
                child.representations[0]["slices"],
                child.representations[0]["stacks"],
                child.representations[0]["capsclose"],
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
                    node.position.x += key.translate[0];
                    node.position.y += key.translate[1];
                    node.position.z += key.translate[2];
                    break;
                case "S":
                    node.scale.x *= key.scale[0];
                    node.scale.y *= key.scale[1];
                    node.scale.z *= key.scale[2];
                    break;
                case "R":
                    node.rotation.x += key.rotation[0] * (Math.PI / 180);
                    node.rotation.y += key.rotation[1] * (Math.PI / 180);
                    node.rotation.z += key.rotation[2] * (Math.PI / 180);
                    break;
            }
        });
    }

    resolveHierarchy(rootId) {
        if (this.nodes === undefined) return;

        this.visitNode(rootId);
    }

    visitNode(node_ref) {
        const node = this.nodes[node_ref];
        if (node === undefined) {
            console.warn("node", node_ref, "not found");
            return;
        }
        for (let i = 0; i < node.children_refs.length; i++) {
            const child_ref = node.children_refs[i];

            this.visitNode(child_ref);

            const child_node = this.nodes[child_ref];

            if (child_node === undefined) {
                console.warn("node", child_ref, "not found");
                continue;
            }
            if (child_node.parent === null) {
                child_node.parent = node;
                node.add(child_node);
            } else {
                const new_child_node = child_node.clone();
                new_child_node.parent = node;
                node.add(new_child_node);
            }
        }
    }
}

export { MyContents };
