import * as THREE from "three";
import { MyAxis } from "./MyAxis.js";
import { MyFileReader } from "./parser/MyFileReader.js";
import * as Utils from "./MyUtils.js";
import { MyTrack } from "./MyTrack.js";
import { createPrimitive } from "./PrimitiveBuilder.js";

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
        // primitive materials, polygon is the only primitive with a material assigned
        this.primitiveMaterials = [];
        //skyboxes
        this.skyboxes = new Object();
        //cameras
        this.cameras = new Object();
        //nodes
        this.nodes = new Object();

        // custom parameter for our scene
        this.curtains = [];

        //lights
        this.lights = new Object();

        this.lightsArray = [];

        // show debug gizmos
        this.DEBUG = false;

        this.wireframe = false;

        this.lightsOn = true;

        this.scenePath = "scenes/scene1/";

        this.reader = new MyFileReader(app, this, this.onSceneLoaded);
        this.reader.open(this.scenePath + "demo.xml");
    }

    /**
     * Initializes the contents
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

    /**
     * Output the object to the console
     * @param {*} obj
     * @param {*} indent
     */
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

    /**
     * Actual loading of the scene
     * @param {*} data
     */
    onAfterSceneLoadedAndBeforeRender(data) {
        // refer to descriptors in class MySceneData.js
        // to see the data structure for each item

        this.output(data.options);
        this.setOptions(data.options);

        if (data.fog) {
            const fogColor = new THREE.Color(
                data.fog.r,
                data.fog.g,
                data.fog.b
            );
            this.app.scene.fog = new THREE.Fog(
                fogColor,
                data.fog.near,
                data.fog.far
            );
        }

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

        // first and only skybox is called "default"
        this.output(data.skyboxes["default"]);

        console.log("skyboxes:", data.skyboxes);
        for (var key in data.skyboxes) {
            let skybox = data.skyboxes[key];
            this.output(skybox, 1);
            this.addSkybox(skybox);
        }

        this.app.scene.add(this.skyboxes["default"]);

        console.log("cameras:");
        for (var key in data.cameras) {
            let camera = data.cameras[key];
            this.output(camera, 1);
            this.addCamera(camera);
        }

        console.log("racetrack", data.racetrack.id);
        this.track = new MyTrack(this, data.racetrack, 100);
        this.app.scene.add(this.track);

        console.log("nodes:");
        const rootNode = this.instantiateNode(data.rootId, data);

        this.app.scene.add(rootNode);

        // add cameras to the app object
        this.app.addCameras(this.cameras);
        this.app.setActiveCamera(data.activeCameraId);
    }

    update() {}

    /**
     * Instantiates nodes, having in consideration if it is a primitive,
     * a kind of light, a LOD or none of this options
     * @param {*} nodeRef
     * @param {*} data
     * @param {*} parent
     * @returns
     */
    instantiateNode(nodeRef, data, parent = undefined) {
        let node = data.nodes[nodeRef];

        if (!node) return undefined;

        this.output(node, 1);

        const nodeObj = new THREE.Object3D();

        nodeObj.name = node.id;

        if (node.materialIds.length != 0)
            nodeObj.materialIds = node.materialIds;
        else if (parent != undefined) nodeObj.materialIds = parent.materialIds;
        else nodeObj.materialIds = [];

        nodeObj.children_refs = [];

        this.applyTransformations(nodeObj, node.transformations);

        nodeObj.castShadow = node.castShadows || parent?.castShadow;
        nodeObj.receiveShadow = node.receiveShadows || parent?.receiveShadow;

        // This is a custom parameter for our team
        if (
            nodeObj.name == "curtain1" ||
            nodeObj.name == "curtain2" ||
            nodeObj.name == "curtain3"
        ) {
            this.curtains.push(nodeObj);
        }

        for (let i = 0; i < node.children.length; i++) {
            let child = node.children[i];

            if (child.type === "primitive") {
                child.representations.forEach((representation) => {
                    const geometry = createPrimitive(representation, this);

                    /**
                     * Polygon and Model3d are the only primitives that has material defined in itself
                     * this way, we need a special case to handle it
                     */
                    if (child.subtype === "polygon") {
                        geometry.castShadow = nodeObj.castShadow;
                        geometry.receiveShadow = nodeObj.receiveShadow;
                        nodeObj.add(geometry);
                    } else if (child.subtype === "model3d") {
                        nodeObj.add(geometry);
                    } else {
                        if (geometry !== undefined) {
                            if (nodeObj.materialIds) {
                                const mesh = new THREE.Mesh(
                                    geometry,
                                    this.materials[nodeObj.materialIds[0]]
                                );

                                if (child.subtype == "rectangle") {
                                    mesh.material.map.repeat.set(
                                        mesh.material.texlength_s /
                                            mesh.geometry.parameters.width,
                                        mesh.material.texlength_t /
                                            mesh.geometry.parameters.height
                                    );

                                    mesh.material.map.wrapS =
                                        THREE.RepeatWrapping;
                                    mesh.material.map.wrapT =
                                        THREE.RepeatWrapping;
                                }

                                mesh.castShadow = nodeObj.castShadow;
                                mesh.receiveShadow = nodeObj.receiveShadow;
                                nodeObj.add(mesh);
                            } else {
                                console.error("Material Missing in", nodeRef);
                            }
                        }
                    }
                });
            } else if (child.type === "pointlight") {
                const light = this.addPointlight(child);
                light.name = child.id;
                nodeObj.add(light);
            } else if (child.type === "spotlight") {
                const light = this.addSpotlight(child);
                light.name = child.id;
                nodeObj.add(light);
            } else if (child.type === "directionallight") {
                const light = this.addDirectionallight(child);
                light.name = child.id;
                nodeObj.add(light);
            } else if (child.type === "lod") {
                const lod = new THREE.LOD();
                for (
                    let lodChild = 0;
                    lodChild < child.children.length;
                    lodChild++
                ) {
                    const element = child.children[lodChild];
                    const newChild = this.instantiateNode(
                        element.node.id,
                        data,
                        nodeObj
                    );
                    lod.addLevel(newChild, element.mindist);
                }

                nodeObj.add(lod);
            } else {
                this.output(child, 2);

                const newChild = this.instantiateNode(child.id, data, nodeObj);
                if (newChild) nodeObj.add(newChild);
            }
        }

        return nodeObj;
    }

    /**
     * Does the necessary changes to the scene based on the options received
     * @param {*} options
     */
    setOptions(options) {
        const ambientColor = new THREE.Color(
            options.ambient.r,
            options.ambient.g,
            options.ambient.b
        );
        const light = new THREE.AmbientLight(ambientColor, 1);

        this.app.scene.add(light);

        const backgroundColor = new THREE.Color(
            options.background.r,
            options.background.g,
            options.background.b
        );
        this.app.scene.background = backgroundColor;
    }

    /**
     * Adds a texture to the textures array
     * @param {*} texture
     */
    addTexture(texture) {
        let newTexture = new THREE.TextureLoader().load(texture.filepath);

        newTexture.magFilter = Utils.getMagFilterFromString(texture.magFilter);
        newTexture.minFilter = Utils.getMinFilterFromString(texture.minFilter);
        newTexture.anisotropy = texture.anisotropy;

        if (!texture.mipmaps && texture.mipmap0) {
            newTexture.generateMipmaps = false;
            newTexture.needsUpdate = true;

            const mipmaps = [
                "mipmap0",
                "mipmap1",
                "mipmap2",
                "mipmap3",
                "mipmap4",
                "mipmap5",
                "mipmap6",
                "mipmap7",
            ];

            for (let index = 0; index < mipmaps.length; index++) {
                const name = mipmaps[index];

                const mipmapText = texture[name];

                if (!mipmapText) break;

                new THREE.TextureLoader().load(
                    mipmapText,
                    function (mipmapTexture) {
                        const canvas = document.createElement("canvas");
                        const ctx = canvas.getContext("2d");
                        ctx.scale(1, 1);

                        // const fontSize = 48
                        const img = mipmapTexture.image;
                        canvas.width = img.width;
                        canvas.height = img.height;

                        // first draw the image
                        ctx.drawImage(img, 0, 0);

                        // set the mipmap image in the parent texture in the appropriate level
                        newTexture.mipmaps[index] = canvas;
                    },
                    undefined, // onProgress callback currently not supported
                    function (err) {
                        console.error(
                            "Unable to load the image " +
                                path +
                                " as mipmap level " +
                                level +
                                ".",
                            err
                        );
                    }
                );
            }
        } else if (texture.isVideo) {
            const video = document.createElement("video");
            video.id = "video";
            video.playsinline = true;
            video.setAttribute("webkit-playsinline", ""); // Webkit specific attribute
            video.muted = true;
            video.loop = true;
            video.autoplay = true;
            video.width = 640;
            video.height = 360;

            video.src = texture.filepath;
            video.style.display = "none";

            document.body.appendChild(video);

            newTexture = new THREE.VideoTexture(video);
            newTexture.needsUpdate = true;
        } else {
            newTexture.generateMipmaps = true;
            if (!texture.mipmaps)
                // mipmaps should be true if no mipmap textures are given
                console.error(
                    "texture",
                    texture.id,
                    "has mipmaps false but has no mipmap textures"
                );
        }

        this.textures[texture.id] = newTexture;
    }

    /**
     * Adds a material to the materials array
     * @param {*} material
     */
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
            map: this.textures[material.textureref || null]?.clone(),
            shininess: material.shininess,
            flatShading: shadingBool,
            wireframe: material.wireframe || false,
            bumpMap: this.textures[material.bumpref || null],
            bumpScale: material.bumpscale || 1.0,
            specularMap: this.textures[material.specularref || null],
        });

        newMaterial.texlength_s = material.texlength_s || 1;
        newMaterial.texlength_t = material.texlength_t || 1;

        if (material.color.a == 1) {
            newMaterial.opacity = 1;
        } else {
            newMaterial.opacity = material.color.a;
        }

        newMaterial.side = intSides;
        newMaterial.wireframeValue = material.wireframe || false;

        this.materials[material.id] = newMaterial;
    }

    /**
     * Adds a Pointlight to the Pointlights array
     * @param {*} light
     * @returns newLight
     */
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
            light.enabled ? light.intensity || 1 : 0,
            light.distance || 1000,
            light.decay || 2
        );

        newLight.castShadow = light.castshadow || false;
        newLight.shadowFar = light.shadowFar || 500.0;

        newLight.position.set(x, y, z);

        if (this.DEBUG) {
            const helper = new THREE.PointLightHelper(newLight, 0.5);
            this.app.scene.add(helper);
        }

        this.lightsArray.push({
            originalIntensity: light.intensity || 1,
            light: newLight,
            defaultEnabled: light.enabled,
        });

        return newLight;
    }

    /**
     * Adds a Spotlight to the Spotlights array
     * @param {*} light
     * @returns newLight
     */
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
            light.enabled ? light.intensity || 1 : 0,
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

        // for some strange reason, this line keeps the light position in the right place
        const helper = new THREE.SpotLightHelper(newLight, lightColor);

        if (this.DEBUG) {
            this.app.scene.add(helper);
        }

        this.lightsArray.push({
            originalIntensity: newLight.intensity,
            light: newLight,
            defaultEnabled: light.enabled,
        });

        return newLight;
    }

    /**
     * Adds a Directionallight to the Directionallights array
     * @param {*} light
     * @returns
     */
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
            light.enabled ? light.intensity || 1 : 0
        );

        newLight.castShadow = light.castshadow;
        newLight.shadowFar = light.shadowFar || 500.0;

        newLight.shadow.camera.left = light.shadowleft || -5;
        newLight.shadow.camera.right = light.shadowright || 5;
        newLight.shadow.camera.top = light.shadowtop || 5;
        newLight.shadow.camera.bottom = light.shadowbottom || -5;

        newLight.position.set(x, y, z);

        if (this.DEBUG) {
            const helper = new THREE.DirectionalLightHelper(
                newLight,
                5,
                lightColor
            );

            this.app.scene.add(helper);
        }

        this.lightsArray.push({
            originalIntensity: newLight.intensity,
            light: newLight,
            defaultEnabled: light.enabled,
        });

        return newLight;
    }

    /**
     *
     * @param {SkyboxData} camera
     * creates a skybox based on the data received and adds to the skyboxes array
     */
    addSkybox(skybox) {
        const skyboxObj = new THREE.Object3D();

        const sizeX = skybox.size[0];
        const sizeY = skybox.size[1];
        const sizeZ = skybox.size[2];

        const center = skybox.center;
        const emissiveIntensity = skybox.emissiveIntensity;

        const emissiveColor = new THREE.Color(
            skybox.emissive.r,
            skybox.emissive.g,
            skybox.emissive.b
        );

        const materials = [];

        ["right", "left", "up", "down", "front", "back"].forEach((side) => {
            const texture = new THREE.TextureLoader().load(
                this.scenePath + skybox[side]
            );
            const material = new THREE.MeshPhongMaterial({
                map: texture,
                emissiveMap: texture,
                emissive: emissiveColor,
                emissiveIntensity,
                side: THREE.BackSide,
            });

            materials.push(material);
        });

        const geo = new THREE.BoxGeometry(sizeX, sizeY, sizeZ);

        skyboxObj.add(new THREE.Mesh(geo, materials));

        skyboxObj.translateX(center[0]);
        skyboxObj.translateY(center[1]);
        skyboxObj.translateZ(center[2]);

        this.skyboxes[skybox.id] = skyboxObj;
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

            newCamera.targetCoords = new THREE.Vector3(
                camera.target[0],
                camera.target[1],
                camera.target[2]
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

            newCamera.targetCoords = new THREE.Vector3(
                camera.target[0],
                camera.target[1],
                camera.target[2]
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

    /**
     * Creates a primitive based on the representation received
     * @param {*} representation
     * @returns
     */

    /**
     * Applies the transformations (translate, scale and rotate) to the node
     * @param {*} node
     * @param {*} transformations
     */
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
                    node.rotation.x = key.rotation[0];
                    node.rotation.y = key.rotation[1];
                    node.rotation.z = key.rotation[2];
                    break;
            }
        });
    }

    /**
     *
     * Turns on/off the wireframe in the this.materials array
     */
    toggleWireframe(value) {
        for (
            let index = 0;
            index < Object.keys(this.materials).length;
            index++
        ) {
            const material = this.materials[Object.keys(this.materials)[index]];

            material.wireframe = value || material.wireframeValue;
        }

        this.primitiveMaterials.forEach(
            (material) => (material.wireframe = value)
        );
    }

    /**
     * Allows the movement of the curtains through the GUI
     * @param {*} value
     */
    moveCurtains(value) {
        for (let index = 0; index < this.curtains.length; index++) {
            const curtain = this.curtains[index];

            curtain.scale.y = value;
        }
    }

    /**
     * Resets the lights to their original value
     */
    resetLights() {
        for (let index = 0; index < this.lightsArray.length; index++) {
            const lightInfo = this.lightsArray[index];

            lightInfo.light.intensity = lightInfo.defaultEnabled
                ? lightInfo.originalIntensity
                : 0;
        }
    }

    /**
     * Allows the alternation of the scene's lights
     * @param {*} value
     */
    toggleLights(value) {
        for (let index = 0; index < this.lightsArray.length; index++) {
            const lightInfo = this.lightsArray[index];

            lightInfo.light.intensity = value ? lightInfo.originalIntensity : 0;
        }
    }
}

export { MyContents };
