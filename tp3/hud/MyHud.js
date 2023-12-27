import * as THREE from "three";
import { MyContents } from "../MyContents.js";
import { NumbersComponent } from "./components/NumbersComponent.js";
/**
 * This class contains a hud
 */
class MyHud extends THREE.Object3D {
    /**
     *
     * @param {MyContents} contents the contents object
     * @param {Object} data the path of the hud
     */
    constructor(contents, data) {
        super();
        this.contents = contents;
        this.type = "Group";
        this.path = data.path;
        this.timeElapsed = data.timeElapsed[0].timeFloat;
        this.laps = data.laps[0].value;
        this.speed = data.speedometer[0].value;
        this.timeLeftBenefit = data.timeLeftBenefit[0].timeFloat;
        this.timeLeftPenalty = data.timeLeftPenalty[0].timeFloat;
        this.states = data.states[0].stateValue;

        this.spriteScale = 0.1;

        this.speedometer = new NumbersComponent(
            new THREE.Vector2(0.5, -0.5),
            0.1,
            0,
            3
        );

        this.add(this.speedometer);
    }

    updateHudComponents() {
        // updates if exists
        this.speedometer?.update();
    }

    update() {
        if (!this.visible) return;

        const activeCamera = this.contents.app.getActiveCamera();

        const cameraWorldPosition = new THREE.Vector3();
        const cameraWorldDirection = new THREE.Vector3();

        activeCamera.getWorldPosition(cameraWorldPosition);
        activeCamera.getWorldDirection(cameraWorldDirection);

        const hudPosition = cameraWorldPosition
            .clone()
            .add(cameraWorldDirection);

        this.position.set(...hudPosition);

        this.lookAt(cameraWorldPosition);

        this.updateHudComponents();
    }

    getDigits(number) {
        const numberString = number.toString();

        // Convert the string to an array of digits
        const digitsArray = numberString
            .split("")
            .map((digit) => parseInt(digit) || 0);

        // Pad the array with leading zeros if needed
        while (digitsArray.length < 3) {
            digitsArray.unshift(0);
        }

        return digitsArray;
    }

    setSpeedometerValue(value) {
        this.speedometer?.setValue(value);
    }
}

MyHud.prototype.isGroup = true;

export { MyHud };
