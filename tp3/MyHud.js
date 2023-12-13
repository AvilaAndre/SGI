import * as THREE from "three";
import { MyApp } from "./MyApp.js";
/**
 * This class contains a race track made with catmull curves
 */
class MyHud extends THREE.Object3D {
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

        this.path = this.path.map(
            (elem) => new THREE.Vector3(elem.value2[0], 0, elem.value2[1])
        );

        this.startingLine = this.path[0];

        const curve = new THREE.CatmullRomCurve3(this.path, true, "catmullrom");

        curve.arcLengthDivisions = this.divisions;
        curve.updateArcLengths();

        const trackGeometry = new THREE.BufferGeometry();

        const vertices = [];
        const indices = [];

        const curveLength = curve.getLength();

        const spacedLengths = curve.getLengths(this.divisions);

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
                        .multiplyScalar(-this.trackWidth)
                );

            const pointOut = point
                .clone()
                .add(
                    perpendicularToTangent
                        .clone()
                        .multiplyScalar(this.trackWidth)
                );

            vertices.push(...pointIn);
            vertices.push(...pointOut);
            if (i == this.divisions - 1) {
                indices.push(0 + 2 * i, 1 + 2 * i, 0);
                indices.push(1 + 2 * i, 1, 0);
            } else {
                indices.push(0 + 2 * i, 1 + 2 * i, 2 + 2 * i);
                indices.push(1 + 2 * i, 3 + 2 * i, 2 + 2 * i); //TODO: existem faces viradas ao contrario
            }
        }

        trackGeometry.setIndex(indices);
        trackGeometry.setAttribute(
            "position",
            new THREE.BufferAttribute(new Float32Array(vertices), 3)
        );

        const trackMaterial = new THREE.MeshBasicMaterial({ color: 0x222222 }); // TODO: Track Material
        const trackMesh = new THREE.Mesh(trackGeometry, trackMaterial);

        this.add(trackMesh);
    }
}

MyHud.prototype.isGroup = true;

export { MyHud };
