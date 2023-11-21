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
        // primitive materials, polygon is the only primitive with a material assigned
        this.primitiveMaterials = [];
        //skyboxes
        this.skyboxes = new Object();
        //cameras
        this.cameras = new Object();
        //nodes
        this.nodes = new Object();

        //lights
        this.lights = new Object();

        this.lightsArray = [];

        // show debug gizmos
        this.DEBUG = true;

        this.wireframe = false;

        this.lightsOn = true;

        //this.scenePath = "scenes/room/";

        this.reader = new MyFileReader(app, this, this.onSceneLoaded);
        //this.reader.open(this.scenePath + "demo.xml");
        this.reader.open("SGI_TP2_XML_T04_G06_v02/SGI_TP2_XML_T04_G06_v01.xml");
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
                child.representations.forEach((representation) => {
                    const geometry = this.createPrimitive(representation);

                    /**
                     * Polygon is the only primitive that has material defined in itself
                     * this way, we need a special case to handle it
                     */
                    if (child.subtype === "polygon") {
                        geometry.castShadow = nodeObj.castShadow;
                        geometry.receiveShadow = nodeObj.receiveShadows;
                        nodeObj.add(geometry);
                    } else {
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
                    }
                });
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

        if (texture.mipmap0) {
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
        } else if(texture.isVideo){
            const video = document.createElement("video");
            video.id = "video";
            video.playsinline = true;
            video.setAttribute("webkit-playsinline", ""); // Webkit specific attribute
            video.muted = true;
            video.loop = true;
            video.autoplay = true;
            video.width = 640;
            video.height = 360;
            video.src = "./" + texture.filepath;
            video.style.display = "none";

            document.body.appendChild(video);

            texObject = new THREE.VideoTexture(video);
        }

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
            bumpMap: this.textures[material.bumpref || null],
            bumpScale: material.bumpscale || 1.0,
            specularMap: this.textures[material.specularref || null],
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

        newLight.position.set(x, y, z);


        if (this.DEBUG) {
            const helper = new THREE.PointLightHelper(newLight, 0.5);
            this.app.scene.add(helper);
        }


        this.lightsArray.push({prevIntensity: newLight.intensity,
            light: newLight}
        );

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

        if (this.DEBUG) {
            const helper = new THREE.SpotLightHelper(newLight, lightColor);

            this.app.scene.add(helper);
        }

        this.lightsArray.push({prevIntensity: newLight.intensity,
            light: newLight}
        );

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

        if (this.DEBUG) {
            const helper = new THREE.DirectionalLightHelper(
                newLight,
                5,
                lightColor
            );

            this.app.scene.add(helper);
        }

        this.lightsArray.push({prevIntensity: newLight.intensity,
            light: newLight}
        );

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

        const skyboxBuildInfo = [
            // back
            {
                textPath: skybox.back,
                trans: [0, 0, -sizeZ / 2],
                rotate: [0, 0, 0],
            },
            // front
            {
                textPath: skybox.front,
                trans: [0, 0, sizeZ / 2],
                rotate: [0, 3.1416, 0],
            },
            // left
            {
                textPath: skybox.left,
                trans: [-sizeX / 2, 0, 0],
                rotate: [0, 1.5708, 0],
            },
            // right
            {
                textPath: skybox.right,
                trans: [sizeX / 2, 0, 0],
                rotate: [0, -1.5708, 0],
            },
            // up
            {
                textPath: skybox.up,
                trans: [0, sizeY / 2, 0],
                rotate: [1.5708, 0, 0],
            },
            // down
            {
                textPath: skybox.down,
                trans: [0, -sizeY / 2, 0],
                rotate: [-1.5708, 0, 0],
            },
        ];

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

    createPrimitive(representation) {
        if (representation.type === "cylinder") {
            return new THREE.CylinderGeometry(
                representation["top"],
                representation["base"],
                representation["height"],
                representation["slices"],
                representation["stacks"],
                representation["capsclose"] || false,
                representation["thetastart"],
                representation["thetalength"]
            );
        } else if (representation.type === "rectangle") {
            const point1 = representation["xy1"];
            const point2 = representation["xy2"];

            const geometry = new THREE.PlaneGeometry(
                point2[0] - point1[0],
                point2[1] - point1[1],
                representation["parts_x"],
                representation["parts_y"]
            );

            geometry.translate(
                (point2[0] + point1[0]) / 2,
                (point2[1] + point1[1]) / 2,
                0
            );

            return geometry;
        } else if (representation.type === "triangle") {
            return new THREE.Triangle(
                new Vector3(
                    representation["xyz1"][0],
                    representation["xyz1"][1],
                    representation["xyz1"][2]
                ),
                new Vector3(
                    representation["xyz2"][0],
                    representation["xyz2"][1],
                    representation["xyz2"][2]
                ),
                new Vector3(
                    representation["xyz3"][0],
                    representation["xyz3"][1],
                    representation["xyz3"][2]
                )
            );
        } else if (representation.type === "sphere") {
            return new THREE.SphereGeometry(
                representation["radius"],
                representation["slices"],
                representation["stacks"],
                representation["phistart"],
                representation["philength"],
                representation["thetastart"],
                representation["thetalength"]
            );
        } else if (representation.type === "nurbs") {
            const degree_v = representation["degree_v"];
            const degree_u = representation["degree_u"];
            const num_pts = representation.controlpoints.length;
            const controlpoints = [];

            for (let i = 0; i < num_pts / (degree_u + 1); i++) {
                const pt_to_add = [];
                for (let j = 0; j < degree_v + 1; j++) {
                    const point =
                        representation.controlpoints[i * (degree_u + 1) + j];
                    pt_to_add.push([point.xx, point.yy, point.zz]);
                }
                controlpoints.push(pt_to_add);
            }

            return new MyNurbsBuilder().build(
                controlpoints,
                degree_u,
                degree_v,
                representation["parts_u"],
                representation["parts_v"]
            );
        } else if (representation.type === "box") {
            const point1 = representation["xyz1"];
            const point2 = representation["xyz2"];

            return new THREE.BoxGeometry(
                point2[0] - point1[0],
                point2[1] - point1[1],
                point2[2] - point1[2],
                representation["parts_x"],
                representation["parts_y"],
                representation["parts_z"]
            );
        } else if (representation.type === "polygon") {
            const { radius, stacks, slices } = representation;

            const geometry = new THREE.BufferGeometry();

            const colorCenter = new THREE.Color(
                representation.color_c.r,
                representation.color_c.g,
                representation.color_c.b
            );
            const colorPoint = new THREE.Color(
                representation.color_p.r,
                representation.color_p.g,
                representation.color_p.b
            );

            const vertices = [];

            const colors = [];

            for (let i = 1; i < slices + 1; i++) {
                const len = radius / slices;
                for (let j = 0; j < stacks; j++) {
                    const angleA = (j * (2 * Math.PI)) / stacks;
                    const angleB = ((j + 1) * (2 * Math.PI)) / stacks;

                    const innerColor = new THREE.Color();

                    const outterColor = new THREE.Color();

                    innerColor.lerpColors(
                        colorCenter,
                        colorPoint,
                        (i - 1) / slices
                    );
                    outterColor.lerpColors(colorCenter, colorPoint, i / slices);

                    if (i == 1) {
                        vertices.push(0, 0, 0);
                        vertices.push(
                            i * len * Math.cos(angleA),
                            i * len * Math.sin(angleA),
                            0
                        );
                        vertices.push(
                            i * len * Math.cos(angleB),
                            i * len * Math.sin(angleB),
                            0
                        );

                        colors.push(...innerColor);
                        colors.push(...outterColor);
                        colors.push(...outterColor);
                    } else {
                        vertices.push(
                            (i - 1) * len * Math.cos(angleA),
                            (i - 1) * len * Math.sin(angleA),
                            0
                        );
                        vertices.push(
                            i * len * Math.cos(angleA),
                            i * len * Math.sin(angleA),
                            0
                        );
                        vertices.push(
                            i * len * Math.cos(angleB),
                            i * len * Math.sin(angleB),
                            0
                        );

                        colors.push(...innerColor);
                        colors.push(...outterColor);
                        colors.push(...outterColor);

                        vertices.push(
                            (i - 1) * len * Math.cos(angleA),
                            (i - 1) * len * Math.sin(angleA),
                            0
                        );
                        vertices.push(
                            i * len * Math.cos(angleB),
                            i * len * Math.sin(angleB),
                            0
                        );
                        vertices.push(
                            (i - 1) * len * Math.cos(angleB),
                            (i - 1) * len * Math.sin(angleB),
                            0
                        );

                        colors.push(...innerColor);
                        colors.push(...outterColor);
                        colors.push(...innerColor);
                    }
                }
            }

            geometry.setAttribute(
                "position",
                new THREE.BufferAttribute(new Float32Array(vertices), 3)
            );
            geometry.setAttribute(
                "color",
                new THREE.BufferAttribute(new Float32Array(colors), 3)
            );

            const material = new THREE.MeshBasicMaterial({
                vertexColors: true,
                wireframe: false,
            });

            this.primitiveMaterials.push(material);

            const mesh = new THREE.Mesh(geometry, material);

            return mesh;
        } else {
            console.error("Can't create primitive: ", representation.type);
            return undefined;
        }
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

    toggleLights(value) {
        console.log("toggleLights", value);
        if (value) {
            for (let index = 0; index < this.lightsArray.length; index++) {
                const lightInfo = this.lightsArray[index];
    
                if (lightInfo.light.intensity == 0)
                    lightInfo.light.intensity = lightInfo.prevIntensity;
            }
        } else {

            for (let index = 0; index < this.lightsArray.length; index++) {
                const lightInfo = this.lightsArray[index];

                lightInfo.prevIntensity = lightInfo.light.intensity;
                lightInfo.light.intensity = 0;
                
            }
        }
    }
    
}

export { MyContents };
