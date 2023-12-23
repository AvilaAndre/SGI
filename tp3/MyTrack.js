import * as THREE from "three";
import { MyApp } from "./MyApp.js";
/**
 * This class contains a race track made with catmull curves
 */
class MyTrack extends THREE.Object3D {
    /**
     *
     * @param {MyApp} app the application object
     * @param {Object} data the path of the racetrack
     * @param {number} divisions the number of divisions on the racetrack creating the polygons
     */
    constructor(app, data, divisions) {
        super();
        this.app = app;
        this.type = "Group";
        this.path = data.path;
        this.trackWidth = data.width;
        this.divisions = divisions || 50;
        this.numCheckpoints = data.checkpoints || 20;

        console.log("track", data);

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
                app.materials[data.materialId]
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

        curve.getSpacedPoints(this.numCheckpoints).forEach((pt) => {
            const msh = new THREE.Mesh(
                new THREE.SphereGeometry(0.4),
                new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 0, 1) })
            );

            msh.position.set(...pt);

            this.add(msh);
        });

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

        app.materials["track"] = trackMaterial;

        const trackMesh = new THREE.Mesh(trackGeometry, trackMaterial);

        this.add(trackMesh);
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
