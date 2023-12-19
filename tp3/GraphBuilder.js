import * as THREE from "three";
import { MyApp } from "./MyApp.js";
import { createPrimitive } from "./PrimitiveBuilder.js";

/**
 * Instantiates nodes, having in consideration if it is a primitive,
 * a kind of light, a LOD or none of this options
 * @param {*} nodeRef
 * @param {*} data
 * @param {MyApp} app
 * @param {*} parent
 * @returns
 */
const instantiateNode = (nodeRef, data, app, parent = undefined) => {
    let node = data.nodes[nodeRef];

    if (!node) return undefined;

    const nodeObj = new THREE.Object3D();

    nodeObj.name = node.id;

    if (node.materialIds.length != 0) nodeObj.materialIds = node.materialIds;
    else if (parent != undefined) nodeObj.materialIds = parent.materialIds;
    else nodeObj.materialIds = [];

    nodeObj.children_refs = [];

    applyTransformations(nodeObj, node.transformations);

    nodeObj.castShadow = node.castShadows || parent?.castShadow;
    nodeObj.receiveShadow = node.receiveShadows || parent?.receiveShadow;

    // This is a custom parameter for our team
    if (
        nodeObj.name == "curtain1" ||
        nodeObj.name == "curtain2" ||
        nodeObj.name == "curtain3"
    ) {
        app.curtains.push(nodeObj);
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
                                app.materials[nodeObj.materialIds[0]]
                            );

                            if (child.subtype == "rectangle") {
                                mesh.material.map.repeat.set(
                                    mesh.material.texlength_s /
                                        mesh.geometry.parameters.width,
                                    mesh.material.texlength_t /
                                        mesh.geometry.parameters.height
                                );

                                mesh.material.map.wrapS = THREE.RepeatWrapping;
                                mesh.material.map.wrapT = THREE.RepeatWrapping;
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
            const light = addPointLight(child, app);
            light.name = child.id;
            nodeObj.add(light);
        } else if (child.type === "spotlight") {
            const light = addSpotlight(child, app);
            light.name = child.id;
            nodeObj.add(light);
        } else if (child.type === "directionallight") {
            const light = addDirectionalLight(child, app);
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
                    app,
                    nodeObj
                );
                lod.addLevel(newChild, element.mindist);
            }

            nodeObj.add(lod);
        } else {
            const newChild = instantiateNode(child.id, data, app, nodeObj);
            if (newChild) nodeObj.add(newChild);
        }
    }

    return nodeObj;
};

/**
 * Applies the transformations (translate, scale and rotate) to the node
 * @param {*} node
 * @param {*} transformations
 */
const applyTransformations = (node, transformations) => {
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
};

/**
 * Adds a Pointlight to the Pointlights array
 * @param {*} light
 * @returns newLight
 */
const addPointLight = (light, app) => {
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

    if (app.DEBUG) {
        const helper = new THREE.PointLightHelper(newLight, 0.5);
        app.scene.add(helper);
    }

    app.lightsArray.push({
        originalIntensity: light.intensity || 1,
        light: newLight,
        defaultEnabled: light.enabled,
    });

    return newLight;
};

/**
 * Adds a Spotlight to the Spotlights array
 * @param {*} light
 * @returns newLight
 */
const addSpotlight = (light, app) => {
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

    if (app.DEBUG) {
        app.scene.add(helper);
    }

    app.lightsArray.push({
        originalIntensity: newLight.intensity,
        light: newLight,
        defaultEnabled: light.enabled,
    });

    return newLight;
};

/**
 * Adds a Directionallight to the Directionallights array
 * @param {*} light
 * @returns
 */
const addDirectionalLight = (light, app) => {
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

    if (app.DEBUG) {
        const helper = new THREE.DirectionalLightHelper(
            newLight,
            5,
            lightColor
        );

        app.scene.add(helper);
    }

    app.lightsArray.push({
        originalIntensity: newLight.intensity,
        light: newLight,
        defaultEnabled: light.enabled,
    });

    return newLight;
};

export { instantiateNode };
