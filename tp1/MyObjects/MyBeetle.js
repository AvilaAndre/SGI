import * as THREE from "three";
import { MyApp } from "../MyApp.js";
import { MyCircunferenceCurve } from "./MyCircunferenceCurve.js";
import { MyFrame } from "./MyFrame.js";

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

        const frame = new MyFrame(this.app, 2, 1.3, "herbie.jpeg");

        frame.rotation.y = Math.PI;

        this.add(frame);

        this.beetleOutline = new THREE.Group();

        const leftWheel = new MyCircunferenceCurve(this, false, 0.3);

        leftWheel.position.set(-0.5, -0.4, 0);

        this.beetleOutline.add(leftWheel);

        const rightwheel = new MyCircunferenceCurve(this, false, 0.3);

        rightwheel.position.set(0.5, -0.4, 0);

        this.beetleOutline.add(rightwheel);

        const frontBumper = new MyCircunferenceCurve(this, true, 0.4);

        frontBumper.position.set(0.4, -0.4, 0);
        this.beetleOutline.add(frontBumper);

        const window = new MyCircunferenceCurve(this, true, 0.4);

        window.position.set(0, 0, 0);
        this.beetleOutline.add(window);

        const rearBumper = new MyCircunferenceCurve(this, true, 0.8);

        rearBumper.position.set(0, -0.4, 0);
        rearBumper.rotation.z = Math.PI / 2;

        this.beetleOutline.add(rearBumper);

        this.beetleOutline.position.y = -0.1;
        this.beetleOutline.position.z = -0.05;

        this.add(this.beetleOutline);
    }
}

MyBeetle.prototype.isGroup = true;

export { MyBeetle };
