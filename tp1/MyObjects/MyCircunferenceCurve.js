import * as THREE from "three";
import { MyApp } from "../MyApp.js";

/**
 * This class contains a Circle representation
 */
class MyCircunferenceCircle extends THREE.Object3D {
    /**
     *
     * @param {MyApp} app the application object
     */
    constructor(app, angle, radius, numberOfPoints) {
        super();
        this.app = app;
        this.type = "Group";
        this.angle = angle || Math.PI;
        this.radius = radius || 2;
        this.numberOfPoints = numberOfPoints || 8;
        this.numberOfSamples = 32;

        let points = [];

        for (let index = 0; index <= this.numberOfPoints; index++) {
            const angle = this.angle / this.numberOfPoints;

            points.push(
                new THREE.Vector3(
                    this.radius * Math.cos(angle * index),
                    this.radius * Math.sin(angle * index),
                    0
                )
            );
        }

        let curve = new THREE.CatmullRomCurve3(points);

        // sample a number of points on the curve
        let sampledPoints = curve.getPoints(this.numberOfSamples);

        this.curveGeometry = new THREE.BufferGeometry().setFromPoints(
            sampledPoints
        );

        this.lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });

        this.lineObj = new THREE.Line(this.curveGeometry, this.lineMaterial);

        this.add(this.lineObj);
    }
}

MyCircunferenceCircle.prototype.isGroup = true;

export { MyCircunferenceCircle };
