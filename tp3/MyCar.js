import * as THREE from "three";
import { MyApp } from "./MyApp.js";
/**
 * This class contains a car
 */
class MyCar extends THREE.Object3D {
    /**
     *
     * @param {MyApp} app the application object
     * @param {Object} data the path of the racetrack
     */
    constructor(app, data) {
        super();
        this.app = app;
        this.type = "Group";
    }
}

MyCar.prototype.isGroup = true;

export { MyCar };
