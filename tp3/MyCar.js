import * as THREE from "three";
import {
    addDirectionalLight,
    addPointLight,
    addSpotlight,
    instantiateNode,
} from "./GraphBuilder.js";
import { addCamera } from "./ComponentBuilder.js";
import { RectangleCollider } from "./collisions/RectangleCollider.js";
import { MyAnimation } from "./animation/MyAnimation.js";
import { MyContents } from "./MyContents.js";

/**
 * This class contains a car
 */
class MyCar extends THREE.Object3D {
    /**
     *
     * @param {MyContents} contents the contents object
     * @param {Object} data data about the scene
     * @param {Object} carData data about the car
     */
    constructor(contents, data, carData) {
        super();
        this.contents = contents;
        this.type = "Group";
        this.turningWheels = [];
        this.rotatingWheels = [];
        this.wheelRotation = 0;
        this.frontLights = [];
        this.rearLights = [];

        this.intention = new THREE.Vector3();
        this.speed = 0;
        this.maxSpeedPowerUPMultiplier = 1;
        this.maxSpeedObstacleMultiplier = 1;
        this.maxSpeedBackwards = -8;
        this.acceleration = 20;
        this.brakeValue = 30;
        this.maxSpeed = 60;
        this.lastPosition = this.position;
        this.turnAngle = 1;
        this.frontLightsNode = null;

        this.cameras = [];

        // signals if is braking
        this.isBraking = false;

        // if car is on track
        this.isOnTrack = false;

        // if car is colliding with another car
        this.isCollidingWithCar = false;

        this.carName = carData.id;
        this.name = carData.id;

        const bodyNode = instantiateNode(carData.id, data, this.contents);

        this.bodyNode = bodyNode;
        this.add(bodyNode);

        for (let i = 0; i < carData.turningWheels.length; i++) {
            const wheel = carData.turningWheels[i];

            const wheelNode = instantiateNode(wheel.id, data, this.contents);
            this.add(wheelNode);

            this.turningWheels.push(wheelNode);
            this.rotatingWheels.push(wheelNode);
        }

        for (let i = 0; i < carData.stationaryWheels.length; i++) {
            const wheel = carData.stationaryWheels[i];

            const wheelNode = instantiateNode(wheel.id, data, this.contents);
            this.add(wheelNode);

            this.rotatingWheels.push(wheelNode);
        }

        this.collider = new RectangleCollider(
            this,
            new THREE.Vector2(...carData.collider.pos),
            ...carData.collider.size
        );

        const camTarget = new THREE.Object3D();

        camTarget.add(new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2))); // FIXME: DEBUG

        for (let i = 0; i < carData.cameras.length; i++) {
            const camera = carData.cameras[i];

            camera.id = carData.id + "_" + camera.id;

            const newCam = addCamera(camera, this.contents, this);

            newCam.camTarget = camTarget;

            const carCamInfo = {
                id: camera.id,
                cam: newCam,
                offset: camera.target,
            };

            this.cameras.push(carCamInfo);

            this.add(newCam);
        }

        for (let i = 0; i < carData.frontLights.length; i++) {
            const light = carData.frontLights[i];

            let lightObj;
            switch (light.type) {
                case "spotlight":
                    lightObj = addSpotlight(light, this.contents, false);

                    bodyNode.add(lightObj);

                    this.frontLights.push(lightObj);
                    break;
                case "pointlight":
                    lightObj = addPointLight(light, this.contents, false);

                    bodyNode.add(lightObj);
                    lightObj.visible = false;

                    this.frontLights.push(lightObj);
                    break;
                case "directionallight":
                    lightObj = addDirectionalLight(light, this.contents, false);

                    bodyNode.add(lightObj);

                    this.frontLights.push(lightObj);

                    break;
                default:
                    break;
            }
        }

        for (let i = 0; i < carData.rearLights.length; i++) {
            const light = carData.rearLights[i];

            let lightObj;
            switch (light.type) {
                case "spotlight":
                    lightObj = addSpotlight(light, this.contents, false);

                    bodyNode.add(lightObj);

                    this.rearLights.push(lightObj);
                    break;
                case "pointlight":
                    lightObj = addPointLight(light, this.contents, false);

                    bodyNode.add(lightObj);
                    lightObj.visible = false;

                    this.rearLights.push(lightObj);
                    break;
                case "directionallight":
                    lightObj = addDirectionalLight(light, this.contents, false);

                    bodyNode.add(lightObj);

                    this.rearLights.push(lightObj);
                    break;
                default:
                    break;
            }
        }

        // optional car light animation
        this.frontLightsNode = this.contents.nodes[this.carName + "-popups"];

        // compute car route curve
        this.route = null;

        let path = null;
        if (carData.route.length > 1) {
            path = carData.route.map(
                (elem) => new THREE.Vector3(elem.value2[0], 0, elem.value2[1])
            );
        } else {
            path = this.contents.track.path;
        }

        if (path != null && path.length > 0) {
            const curve = new THREE.CatmullRomCurve3(path, true, "centripetal");

            const animationData = {
                id: carData.id + "_routeAnim",
                duration: carData.routeTime,
                repeat: true,
                autostart: false,
                tracks: [],
                timestamps: [],
            };

            animationData.tracks.push({
                id: "carBody",
                nodes: [this],
                interpolation: "linear",
            });

            const divisions = 200;

            const curveLength = curve.getLength();
            const curveSpacedLengths = curve.getLengths(divisions);

            for (let i = 0; i <= divisions; i++) {
                const progress = curveSpacedLengths[i] / curveLength;
                const pointOnCurve = curve.getPointAt(progress);

                const tangent = curve.getTangentAt(progress);

                animationData.timestamps.push({
                    value: carData.routeTime * progress,
                    keys: {
                        carBody: {
                            id: "carBody",
                            transformations: [
                                {
                                    type: "T",
                                    translate: [
                                        pointOnCurve.x,
                                        pointOnCurve.y,
                                        pointOnCurve.z,
                                    ],
                                },
                                {
                                    type: "R",
                                    rotation: [
                                        0,
                                        Math.atan2(tangent.x, tangent.z),
                                        0,
                                    ],
                                },
                            ],
                        },
                    },
                });
            }

            const carRouteAnimation = new MyAnimation(this.contents).fromObject(
                animationData
            );

            this.contents.animationPlayer.addAnimation(carRouteAnimation);
        }

        this.isCar = true;
    }

    turnTo(angle) {
        angle = Math.sign(angle) * this.turnAngle;

        this.wheelRotation = THREE.MathUtils.lerp(
            this.wheelRotation,
            angle,
            0.1
        );

        for (let i = 0; i < this.turningWheels.length; i++) {
            const wheel = this.turningWheels[i];

            wheel.rotation.y = this.wheelRotation / 2;
        }
    }

    getMaxSpeedForwards() {
        return (
            this.maxSpeed *
            this.maxSpeedPowerUPMultiplier *
            this.maxSpeedObstacleMultiplier *
            (this.isOnTrack || this.isCollidingWithCar ? 1 : 0.7)
        );
    }

    getMaxSpeedBackwards() {
        return (
            this.maxSpeedBackwards *
            this.maxSpeedPowerUPMultiplier *
            this.maxSpeedObstacleMultiplier
        );
    }

    accelerate(delta) {
        this.speed +=
            this.acceleration *
            delta *
            (this.isOnTrack || this.isCollidingWithCar ? 1 : 0.7);
        this.speed = Math.min(this.speed, this.getMaxSpeedForwards());

        this.isAccelerating = true;
    }

    brake(delta) {
        if (!this.isBraking && this.speed <= 0) {
            this.speed -= this.brakeValue * delta;

            this.speed = Math.max(this.speed, this.getMaxSpeedBackwards());
        } else {
            this.speed -= this.brakeValue * delta;

            this.speed = Math.max(this.speed, 0);

            this.isBraking = true;
        }
    }

    brakeReleased() {
        this.isBraking = false;
    }

    calculateNextMove(delta) {
        const carDirection = new THREE.Vector3();

        this.getWorldDirection(carDirection);

        this.lastPosition = this.position.clone();

        this.position.add(carDirection.multiplyScalar(this.speed * delta));
    }

    move(delta) {
        if (this.speed >= 0) {
            this.speed = Math.max(0, this.speed - 0.1);
        } else {
            this.speed = Math.min(0, this.speed + 0.1);
        }

        this.rotation.y += this.wheelRotation * delta * Math.sign(this.speed);

        for (let i = 0; i < this.cameras.length; i++) {
            const camInfo = this.cameras[i];

            if (this.contents.app.activeCameraName == camInfo.id) {
                camInfo.cam.camTarget.position.set(
                    ...this.position
                        .clone()
                        .add(
                            new THREE.Vector3(...camInfo.offset).applyAxisAngle(
                                new THREE.Vector3(0, 1, 0),
                                this.rotation.y
                            )
                        )
                );
            }
        }

        if (this.isAccelerating) {
            this.tiltCarX(-0.03);
        } else if (this.isBraking) {
            this.tiltCarX(0.04 * Math.sign(this.speed));
        } else {
            this.tiltCarX(0);
        }
        if (Math.sign(this.speed) != 0) {
            this.tiltCarZ((this.wheelRotation / this.turnAngle) * -0.03);
        } else {
            this.tiltCarZ(0);
        }

        // rotate wheels

        for (let i = 0; i < this.rotatingWheels.length; i++) {
            const wheel = this.rotatingWheels[i];

            wheel.children[0].rotateX(this.speed * -delta);
        }

        this.frontCarLights();
        this.brakeLights();

        this.isAccelerating = false;
    }

    /**
     * tilts the car in the X axis (simulates braking and acceleration)
     * @param {number} angle
     */
    tiltCarX(angle) {
        this.bodyNode.rotation.x = THREE.MathUtils.lerp(
            this.bodyNode.rotation.x,
            angle,
            0.05
        );
    }

    /**
     * tilts the car in the Z axis (simulates turning)
     * @param {number} angle
     */
    tiltCarZ(angle) {
        this.bodyNode.rotation.z = THREE.MathUtils.lerp(
            this.bodyNode.rotation.z,
            angle,
            0.1
        );
    }

    frontCarLights() {
        for (let i = 0; i < this.frontLights.length; i++) {
            const frontLight = this.frontLights[i];

            frontLight.intensity = THREE.MathUtils.lerp(
                frontLight.intensity,
                this.frontLightsOn ? frontLight.originalIntensity : 0,
                0.1
            );
        }

        if (this.frontLightsNode) {
            this.frontLightsNode.rotation.x = THREE.MathUtils.lerp(
                this.frontLightsNode.rotation.x,
                this.frontLightsOn ? 0 : -1.1,
                0.05
            );
        }
    }

    brakeLights() {
        for (let i = 0; i < this.rearLights.length; i++) {
            const rearLight = this.rearLights[i];

            rearLight.intensity = THREE.MathUtils.lerp(
                rearLight.intensity,
                this.isBraking ? rearLight.originalIntensity : 0,
                0.3
            );
        }
    }

    toggleLights() {
        this.frontLightsOn = !this.frontLightsOn;
        this.contents.animationPlayer.playFromStart(
            this.carName + "-open-lights"
        );

        this.frontLightsNode = this.contents.nodes[this.carName + "-popups"];
    }

    /**
     * By default lights are not activated as it is performance costly
     */
    activateLights() {
        for (let i = 0; i < this.rearLights.length; i++) {
            const rearLight = this.rearLights[i];

            rearLight.visible = true;
        }

        for (let i = 0; i < this.frontLights.length; i++) {
            const frontLight = this.frontLights[i];

            frontLight.visible = true;
        }
    }

    teleportTo(x, z, rotation = 0) {
        this.speed = 0;
        this.wheelRotation = 0;

        this.position.x = x;
        this.position.z = z;
        this.rotation.y = rotation;
    }

    /**
     * Starts the animation around the track
     */
    startRunAnimation() {
        this.contents.animationPlayer.playFromStart(
            this.carName + "_routeAnim"
        );
    }

    /**
     * Pauses the animation around the track
     */
    pauseRunAnimation() {
        this.contents.animationPlayer.pause(this.carName + "_routeAnim");
    }

    /**
     * Changes the time scale of an animation
     * @param {number} timeScale
     */

    setRunAnimationTimeScale(timeScale) {
        this.contents.animationPlayer.setTimeScale(
            this.carName + "_routeAnim",
            timeScale
        );
    }

    /**
     * Resumes the animation around the track
     */
    resumeRunAnimation() {
        this.contents.animationPlayer.play(this.carName + "_routeAnim");
    }
}

MyCar.prototype.isGroup = true;

export { MyCar };
