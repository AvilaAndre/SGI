import * as THREE from "three";
import { MyApp } from "../MyApp.js";

/**
 * This class contains a 3D cake representation
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
    }
}

MyBeetle.prototype.isGroup = true;

export { MyBeetle };
