import * as THREE from "three";
import { MyApp } from "./MyApp.js";
import { instantiateNode } from "./GraphBuilder.js";
/**
 * This class contains a car
 */
class MyCar extends THREE.Object3D {
    /**
     *
     * @param {MyApp} app the application object
     * @param {Object} data data about the scene
     * @param {Object} carData data about the car
     */
    constructor(app, data, carData) {
        super();
        this.app = app;
        this.type = "Group";
        this.turningWheels = [];

        console.log("carData", carData);

        const bodyNode = instantiateNode(carData.id, data, app);
        this.add(bodyNode);

        for (let i = 0; i < carData.turningWheels.length; i++) {
            const wheel = carData.turningWheels[i];

            const wheelNode = instantiateNode(wheel.id, data, app);
            this.add(wheelNode);

            this.turningWheels.push(wheelNode);
        }

        for (let i = 0; i < carData.stationaryWheels.length; i++) {
            const wheel = carData.stationaryWheels[i];

            const wheelNode = instantiateNode(wheel.id, data, app);
            this.add(wheelNode);
        }
        // TODO: Collider

        this.turnTo(0.5); // TODO: Remove
    }

    turnTo(angle) {
        for (let i = 0; i < this.turningWheels.length; i++) {
            const wheel = this.turningWheels[i];

            wheel.rotation.y = angle;
        }
    }
}

MyCar.prototype.isGroup = true;

export { MyCar };
