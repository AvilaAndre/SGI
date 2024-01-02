import * as THREE from "three";
import { createPrimitive } from "./PrimitiveBuilder.js";
import { MyContents } from "./MyContents.js";
import { RectangleCollider } from "./collisions/RectangleCollider.js";

/**
 * Instantiates nodes, having in consideration if it is a primitive,
 * a kind of light, a LOD or none of this options
 * @param {*} nodeRef
 * @param {*} data
 * @param {MyContents} contents
 * @param {*} parent
 * @returns
 */
const instantiateNode = (nodeRef, data, contents, parent = undefined) => {
    let node = data.nodes[nodeRef];

    if (!node) return undefined;

    const nodeObj = new THREE.Object3D();

    nodeObj.name = node.id;
    contents.nodes[node.id] = nodeObj;

    if (node.materialIds.length != 0) nodeObj.materialIds = node.materialIds;
    else if (parent != undefined) nodeObj.materialIds = parent.materialIds;
    else nodeObj.materialIds = [];

    nodeObj.children_refs = [];

    applyTransformations(nodeObj, node.transformations);

    nodeObj.castShadow = node.castShadows || parent?.castShadow;
    nodeObj.receiveShadow = node.receiveShadows || parent?.receiveShadow;

    if (node.isPickable) contents.pickables.push(nodeObj);

    if (node.collider) {
        nodeObj.collider = new RectangleCollider(
            nodeObj,
            new THREE.Vector2(...node.collider.pos),
            ...node.collider.size
        );
    }

    for (let i = 0; i < node.children.length; i++) {
        let child = node.children[i];

        if (child.type === "primitive") {
            child.representations.forEach((representation) => {
                const geometry = createPrimitive(representation, contents);

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
                                contents.materials[nodeObj.materialIds[0]]
                            );

                            if (nodeObj.name == "Mesh") {
                                nodeObj.name = nodeObj.parent.name;
                            }

                            mesh.name = nodeObj.name;

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
            const light = addPointLight(child, contents);
            light.name = child.id;
            nodeObj.add(light);
        } else if (child.type === "spotlight") {
            const light = addSpotlight(child, contents);
            light.name = child.id;
            nodeObj.add(light);
        } else if (child.type === "directionallight") {
            const light = addDirectionalLight(child, contents);
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
                const newChild = contents.instantiateNode(
                    element.node.id,
                    data,
                    contents,
                    nodeObj
                );
                lod.addLevel(newChild, element.mindist);
            }

            nodeObj.add(lod);
        } else {
            const newChild = instantiateNode(child.id, data, contents, nodeObj);
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
const addPointLight = (light, contents, addToContents = true) => {
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

    if (contents.DEBUG) {
        const helper = new THREE.PointLightHelper(newLight, 0.1);
        contents.app.scene.add(helper);
    }

    newLight.originalIntensity = light.intensity || 1;

    if (addToContents) {
        contents.lightsArray.push({
            originalIntensity: light.intensity || 1,
            light: newLight,
            defaultEnabled: light.enabled,
        });
    }

    return newLight;
};

/**
 * Adds a Spotlight to the Spotlights array
 * @param {*} light
 * @returns newLight
 */
const addSpotlight = (light, contents, addToContents = true) => {
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

    const obj = new THREE.Object3D();

    obj.position.set(...light.target);

    newLight.add(obj);
    newLight.target = obj;

    newLight.shadowFar = light.shadowFar || 500.0;
    newLight.position.set(x, y, z);

    // for some strange reason, this line keeps the light position in the right place
    const helper = new THREE.SpotLightHelper(newLight, lightColor);

    if (contents.DEBUG) {
        contents.app.scene.add(helper);
    }

    newLight.originalIntensity = light.intensity || 1;

    if (addToContents) {
        contents.lightsArray.push({
            originalIntensity: newLight.intensity,
            light: newLight,
            defaultEnabled: light.enabled,
        });
    }

    return newLight;
};

/**
 * Adds a Directionallight to the Directionallights array
 * @param {*} light
 * @returns
 */
const addDirectionalLight = (light, contents, addToContents = true) => {
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

    if (contents.DEBUG) {
        const helper = new THREE.DirectionalLightHelper(
            newLight,
            5,
            lightColor
        );

        contents.scene.add(helper);
    }

    newLight.originalIntensity = light.intensity || 1;

    if (addToContents) {
        contents.lightsArray.push({
            originalIntensity: newLight.intensity,
            light: newLight,
            defaultEnabled: light.enabled,
        });
    }

    return newLight;
};

export { instantiateNode, addPointLight, addDirectionalLight, addSpotlight };
