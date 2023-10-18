import * as THREE from "three";
import { MyApp } from "../MyApp.js";

/**
 * This class contains a Curve representation
 */
class MyCircunferenceCurve extends THREE.Object3D {
    /**
     *
     * @param {MyApp} app the application object
     * @param {angle} angle if true it will have an angle of 45 else 90 degrees
     * @param {radius} radius the curve's circunference radius
     * @param {numberOfPoints} angle if true it will have an angle of 45 else 90 degrees
     */
    constructor(app, angle, radius, numberOfPoints) {
        super();
        this.app = app;
        this.type = "Group";
        this.angle = angle;
        this.radius = radius || 2;
        this.numberOfPoints = numberOfPoints || 8;
        this.numberOfSamples = 32;

        let h = (4 / 3) * this.radius;

        if (this.angle) {
            h = (4 / 3) * (Math.sqrt(2) - 1) * this.radius;
        }

        let points = [
            new THREE.Vector3(
                this.angle ? 0.0 : -this.radius,
                this.angle ? this.radius : 0,
                0.0
            ), // starting point

            new THREE.Vector3(
                this.angle ? h : -this.radius,
                this.angle ? this.radius : h,
                0.0
            ), // control point
            new THREE.Vector3(this.radius, h, 0.0), // control point

            new THREE.Vector3(this.radius, 0, 0.0), // ending point
        ];

        let curve = new THREE.CubicBezierCurve3(...points);

        this.curveGeometry = new THREE.TubeGeometry(curve, 248, 0.01, 16);

        this.lineMaterial = new THREE.LineBasicMaterial({ color: 0x0088ff });

        this.lineObj = new THREE.Line(this.curveGeometry, this.lineMaterial);

        this.add(this.lineObj);
    }
}

MyCircunferenceCurve.prototype.isGroup = true;

export { MyCircunferenceCurve };
