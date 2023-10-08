import * as THREE from "three";
import { MyApp } from "../MyApp.js";
import { MyCircunferenceCircle } from "./MyCircunferenceCurve.js";

/**
 * This class contains a 3D Beetle made with lines representation
 */
class MyBeetle extends THREE.Object3D {
    /**
     *
     * @param {MyApp} app the application object
     */
    constructor(app) {
        super();
        this.app = app;
        this.type = "Group";

        const leftWheel = new MyCircunferenceCircle(this, Math.PI, 0.3);

        leftWheel.position.set(-0.5, -0.4, 0);

        this.add(leftWheel);

        const rightwheel = new MyCircunferenceCircle(this, Math.PI, 0.3);

        rightwheel.position.set(0.5, -0.4, 0);

        this.add(rightwheel);

        const frontBumper = new MyCircunferenceCircle(this, Math.PI / 2, 0.4);

        frontBumper.position.set(0.4, -0.4, 0);
        this.add(frontBumper);

        const window = new MyCircunferenceCircle(this, Math.PI / 2, 0.4);

        window.position.set(0, 0, 0);
        this.add(window);

        const rearBumper = new MyCircunferenceCircle(this, Math.PI / 2, 0.8);

        rearBumper.position.set(0, -0.4, 0);
        rearBumper.rotation.z = Math.PI/2

        this.add(rearBumper);
    }
}

MyBeetle.prototype.isGroup = true;

export { MyBeetle };
