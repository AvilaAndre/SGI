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
            new THREE.Vector2(0.75, -0.5),
            0.1,
            0,
            3
        );

        this.lapTimer = new NumbersComponent(
            new THREE.Vector2(0, 0.5),
            0.1,
            0,
            4
        );

        this.lapCounter = new NumbersComponent(
            new THREE.Vector2(0.75, 0.5),
            0.1,
            0,
            1
        );

        this.add(this.speedometer);
        this.add(this.lapTimer);
        this.add(this.lapCounter);
    }

    updateHudComponents() {
        // updates if exists
        this.speedometer?.update();
        this.lapTimer?.update();
        this.lapCounter?.update();
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

    setSpeedometerValue(value) {
        this.speedometer?.setValue(value);
    }

    setLapTimerValue(value) {
        this.lapTimer?.setValue(value);
    }
    setLapCounterValue(value) {
        this.lapCounter?.setValue(value);
    }
}

MyHud.prototype.isGroup = true;

export { MyHud };
