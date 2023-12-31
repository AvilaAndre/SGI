import * as THREE from "three";
import { MyContents } from "./MyContents.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

/**
 *
 * @param {Object} representation the object with the primitive's representation
 * @param {MyContents} contents the contents object
 * @returns the mesh of the primitive
 */
const createPrimitive = (representation, contents) => {
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
        const point1 = new THREE.Vector3(
            representation["xyz1"][0],
            representation["xyz1"][1],
            representation["xyz1"][2]
        );

        const point2 = new THREE.Vector3(
            representation["xyz2"][0],
            representation["xyz2"][1],
            representation["xyz2"][2]
        );

        const point3 = new THREE.Vector3(
            representation["xyz3"][0],
            representation["xyz3"][1],
            representation["xyz3"][2]
        );

        //CALCULATING NORMALS
        var vectorAx = point2.x - point1.x;
        var vectorAy = point2.y - point1.y;
        var vectorAz = point2.z - point1.z;

        var vectorBx = point3.x - point1.x;
        var vectorBy = point3.y - point1.y;
        var vectorBz = point3.z - point1.z;

        var crossProductX = vectorAy * vectorBz - vectorBy * vectorAz;
        var crossProductY = vectorBx * vectorAz - vectorAx * vectorBz;
        var crossProductZ = vectorAx * vectorBy - vectorBx * vectorAy;

        var normal = new THREE.Vector3(
            crossProductX,
            crossProductY,
            crossProductZ
        );
        normal.normalize();

        //TEXTURE COORDINATES
        let a = point1.distanceTo(point2);
        let b = point2.distanceTo(point3);
        let c = point1.distanceTo(point3);

        let cos_ac = (a * a - b * b + c * c) / (2 * a * c);
        let sin_ac = Math.sqrt(1 - cos_ac * cos_ac);

        const vertices = new Float32Array([
            ...point1.toArray(), //0
            ...point2.toArray(), //1
            ...point3.toArray(), //2
        ]);

        const indices = [0, 1, 2];

        const normals = [
            ...normal.toArray(),
            ...normal.toArray(),
            ...normal.toArray(),
        ];

        // prettier-ignore
        const uvs = [
                0, 0,
                1, 0,
                1 * cos_ac, 1 * sin_ac
            ];

        const geometry = new THREE.BufferGeometry();

        geometry.setIndex(indices);
        geometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(vertices, 3)
        );
        geometry.setAttribute(
            "normal",
            new THREE.Float32BufferAttribute(normals, 3)
        );
        geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));

        return geometry;
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
        const controlpoints = [];

        for (let i = 0; i < degree_u + 1; i++) {
            const pt_to_add = [];
            for (let j = 0; j < degree_v + 1; j++) {
                const point =
                    representation.controlpoints[i * (degree_v + 1) + j];
                pt_to_add.push([point.xx, point.yy, point.zz, 1]);
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

        for (let i = 1; i < stacks + 1; i++) {
            const len = radius / stacks;
            for (let j = 0; j < slices; j++) {
                const angleA = (j * (2 * Math.PI)) / slices + Math.PI / 2;
                const angleB = ((j + 1) * (2 * Math.PI)) / slices + Math.PI / 2;

                const innerColor = new THREE.Color();

                const outterColor = new THREE.Color();

                innerColor.lerpColors(
                    colorCenter,
                    colorPoint,
                    (i - 1) / stacks
                );
                outterColor.lerpColors(colorCenter, colorPoint, i / stacks);

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
    } else if (representation.type === "model3d") {
        const loader = new GLTFLoader();

        const scene = new THREE.Scene();

        loader.load(
            representation.filepath,
            async function (gltf) {
                scene.add(gltf.scene);

                // check if model3d added is a big screen
                if (
                    representation.filepath ===
                    "scenes/scene1/models/big-screen/billboardDouble_exclusive.glb"
                )
                    contents.addBigScreen(scene);
            },
            // called while loading is progressing
            function (xhr) {
                console.log(
                    representation.filepath,
                    (xhr.loaded / xhr.total) * 100 + "% loaded"
                );
            },
            function (error) {
                console.error(error);
            }
        );

        // Is empty because loader does not await
        return scene;
    } else {
        console.error("Can't create primitive: ", representation.type);
        return undefined;
    }
};

export { createPrimitive };
