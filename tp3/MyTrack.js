import * as THREE from "three";
import { MyApp } from "./MyApp.js";
import { MyContents } from "./MyContents.js";
import { RectangleCollider } from "./collisions/RectangleCollider.js";
import { createPrimitive } from "./PrimitiveBuilder.js";
import { instantiateNode } from "./GraphBuilder.js";
/**
 * This class contains a race track made with catmull curves
 */
class MyTrack extends THREE.Object3D {
    /**
     *
     * @param {MyContents} contents the contents object
     * @param {Object} data the path of the racetrack
     * @param {number} divisions the number of divisions on the racetrack creating the polygons
     */
    constructor(contents, data, divisions) {
        super();
        this.contents = contents;
        this.type = "Group";
        this.path = data.path;
        this.trackWidth = data.width;
        this.divisions = divisions || 50;
        this.numCheckpoints = data.checkpoints || 20;
        this.powerups = data.powerups;

        // The curve that defines the points on the track
        this.trackCurve = null;

        // All objects representing a checkpoint
        this.checkpoints = [];

        //Check if isEmpty is set to true
        if (data.isEmpty) {
            return;
        }

        this.path = this.path.map(
            (elem) => new THREE.Vector3(elem.value2[0], 0, elem.value2[1])
        );

        /* Uncomment this block to see where are the points located
        this.path.forEach((elem) => {
            console.log(elem);
            const msh = new THREE.Mesh(
                new THREE.SphereGeometry(0.2),
                this.contents.materials[data.materialId]
            );
            
            msh.position.set(...elem);
            
            this.add(msh);
        });
        */

        this.startingLine = this.path[0];

        const curve = new THREE.CatmullRomCurve3(
            this.path,
            true,
            "centripetal"
        );

        curve.arcLengthDivisions = this.divisions;
        curve.updateArcLengths();

        this.trackCuve = curve;

        const trackGeometry = new THREE.BufferGeometry();

        const vertices = [];
        const indices = [];
        const normals = [];
        const uvs = [];

        const curveLength = curve.getLength();

        const spacedLengths = curve.getLengths(this.divisions);

        // To calculate the UV mapping
        let lastPoint = new THREE.Vector3(0, 0, 0);
        let dist = 0;

        const checkpointWidth = this.trackWidth * 1.2;

        for (let i = 0; i < this.numCheckpoints; i++) {
            const progress =
                ((i / this.numCheckpoints) * curve.getLength()) /
                curve.getLength();

            const pt = curve.getPointAt(progress);
            const tangent = curve.getTangentAt(progress);

            if (i == 0) {
                const startPoint = pt
                    .clone()
                    .sub(tangent.clone().multiplyScalar(20));

                this.startingPoint = {
                    x: startPoint.x,
                    z: startPoint.z,
                    rotation:
                        Math.atan2(
                            startPoint.x - tangent.x,
                            startPoint.z - tangent.z
                        ) +
                        Math.PI / 2,
                };
            }

            const checkpointObj = new THREE.Object3D();

            const checkpointPylonLeft = createPrimitive({
                type: "model3d",
                filepath: "scenes/scene1/models/checkpoints/pylon.glb",
            });

            const checkpointPylonRight = createPrimitive({
                type: "model3d",
                filepath: "scenes/scene1/models/checkpoints/pylon.glb",
            });

            checkpointPylonLeft.scale.set(3, 3, 3);
            checkpointPylonRight.scale.set(3, 3, 3);

            const coneL = new THREE.Object3D();
            const coneR = new THREE.Object3D();
            coneR.add(checkpointPylonRight);
            coneL.add(checkpointPylonLeft);

            checkpointObj.cones = new Array(coneL, coneR);

            coneL.position.set(
                ...new THREE.Vector3(-checkpointWidth / 2, 0, 0)
            );
            coneR.position.set(...new THREE.Vector3(checkpointWidth / 2, 0, 0));

            checkpointObj.add(coneR);
            checkpointObj.add(coneL);

            checkpointObj.position.set(...pt);

            tangent.add(pt);

            checkpointObj.rotation.y = Math.atan2(
                checkpointObj.position.x - tangent.x,
                checkpointObj.position.z - tangent.z
            );

            checkpointObj.collider = new RectangleCollider(
                checkpointObj,
                new THREE.Vector2(0, 0),
                checkpointWidth,
                0.2
            );

            /* Uncomment to see the checkpoint collider
            const checkPointMesh = new THREE.Mesh(
                new THREE.BoxGeometry(checkpointWidth, 1, 0.2),
                new THREE.MeshBasicMaterial({
                    color: new THREE.Color(0.2, 0.2, 1),
                    opacity: 0.3,
                    transparent: true,
                })
            );
            checkpointObj.add(checkPointMesh);
            */

            checkpointObj.visible = true;

            this.add(checkpointObj);

            this.checkpoints.push(checkpointObj);
        }

        this.checkpoints[0].visible = true;

        for (let i = 0; i < this.divisions; i++) {
            const progress = spacedLengths[i] / curveLength;

            const point = curve.getPointAt(progress);
            const tangent = curve.getTangentAt(progress);

            const perpendicularToTangent = tangent
                .clone()
                .cross(new THREE.Vector3(0, 1, 0))
                .normalize();

            const pointIn = point
                .clone()
                .add(
                    perpendicularToTangent
                        .clone()
                        .multiplyScalar(-this.trackWidth / 2)
                );

            const pointOut = point
                .clone()
                .add(
                    perpendicularToTangent
                        .clone()
                        .multiplyScalar(this.trackWidth / 2)
                );

            vertices.push(...pointIn);
            vertices.push(...pointOut);
            normals.push(0, -1, 0);
            normals.push(0, -1, 0);

            if (i == 0) {
                lastPoint = point;
            }

            dist += lastPoint.distanceTo(point);

            uvs.push(0, dist);
            uvs.push(this.trackWidth, dist);

            lastPoint = point;
        }

        for (let i = 0; i < this.divisions; i++) {
            const idx0 = 0 + 2 * i;
            const idx1 = 1 + 2 * i;
            let idx2 = 2 + 2 * i;
            let idx3 = 3 + 2 * i;

            if (i == this.divisions - 1) {
                idx2 = 0;
                idx3 = 1;
            }

            const ordered1 = calcOrder(vertices, idx0, idx1, idx2);
            const ordered2 = calcOrder(vertices, idx1, idx2, idx3);

            indices.push(...ordered1);
            indices.push(...ordered2);
        }

        trackGeometry.setIndex(indices);
        trackGeometry.setAttribute(
            "position",
            new THREE.BufferAttribute(new Float32Array(vertices), 3)
        );
        trackGeometry.setAttribute(
            "normal",
            new THREE.BufferAttribute(new Float32Array(normals), 3)
        );
        trackGeometry.setAttribute(
            "uv",
            new THREE.BufferAttribute(new Float32Array(uvs), 2)
        );

        const trackTexture = new THREE.TextureLoader().load(data.texturePath);
        trackTexture.wrapS = THREE.RepeatWrapping;
        trackTexture.wrapT = THREE.RepeatWrapping;

        const trackMaterial = new THREE.MeshPhongMaterial({
            map: trackTexture,
        });
        trackMaterial.wireframeValue = false;

        this.contents.materials["track"] = trackMaterial;

        this.trackMesh = new THREE.Mesh(trackGeometry, trackMaterial);

        this.add(this.trackMesh);


    }

    createPowerupCube(data) {

        //TODO: for each new lap done by the player, powerups that were collected should be respawned

        console.log("this.contents.nodes:", this.contents.nodes);
        console.log("data.powerups:", this.powerups);

        for(let i = 0; i < this.powerups.length; i++) {
            console.log("this.powerups[i]:", this.powerups[i]);
            const powerupNode = instantiateNode("powerupCube1", data, this.contents);
            powerupNode.position.set(this.powerups[i].value2[0], 0.5, this.powerups[i].value2[1]);
            this.contents.app.scene.add(powerupNode);

            this.contents.manager.collisionManager.addCollider(
                new RectangleCollider(
                    powerupNode,
                    new THREE.Vector2(0, 0),
                    1.25,
                    1.25
                ),
                true
            );

            powerupNode.isPowerup = true;
            powerupNode.caught = false;
        }

        return;

    }
}

const calcOrder = (vertices, idx1, idx2, idx3) => {
    const v1 = new THREE.Vector3(
        vertices[idx1 * 3],
        vertices[idx1 * 3 + 1],
        vertices[idx1 * 3 + 2]
    );
    const v2 = new THREE.Vector3(
        vertices[idx2 * 3],
        vertices[idx2 * 3 + 1],
        vertices[idx2 * 3 + 2]
    );
    const v3 = new THREE.Vector3(
        vertices[idx3 * 3],
        vertices[idx3 * 3 + 1],
        vertices[idx3 * 3 + 2]
    );

    if (v2.x == v1.x) {
        // division by zero;

        if (v2.z < v1.z) {
            return [idx1, idx2, idx3];
        } else {
            return [idx1, idx3, idx2];
        }
    } else {
        const alpha = (v2.z - v1.z) / (v2.x - v1.x);

        const m1 = v1.z - alpha * v1.x;

        const m2 = v3.z - alpha * v3.x;

        if (v2.x < v1.x) {
            if (m1 < m2) {
                return [idx1, idx2, idx3];
            } else {
                return [idx1, idx3, idx2];
            }
        } else {
            if (m1 < m2) {
                return [idx1, idx3, idx2];
            } else {
                return [idx1, idx2, idx3];
            }
        }
    }

    
};

MyTrack.prototype.isGroup = true;

export { MyTrack };
