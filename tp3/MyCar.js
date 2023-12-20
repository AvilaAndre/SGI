import * as THREE from "three";
import { MyApp } from "./MyApp.js";
import { instantiateNode } from "./GraphBuilder.js";
import { addCamera } from "./ComponentBuilder.js";
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
        this.wheelRotation = 0;

        this.intention = new THREE.Vector3();
        this.speed = 0;
        this.maxSpeedForward = 60;
        this.maxSpeedBackwards = -8;
        this.acceleration = 20;
        this.brakeValue = 30;
        this.maxSpeed = 100;
        this.nextPosition = this.position;
        this.turnAngle = 1;

        this.cameras = [];

        // signals if is braking
        this.isBraking = false;

        console.log("carData", carData);

        const bodyNode = instantiateNode(carData.id, data, app);

        this.bodyNode = bodyNode;
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

        const camTarget = new THREE.Object3D();

        camTarget.add(new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2))); // DEBUG

        for (let i = 0; i < carData.cameras.length; i++) {
            const camera = carData.cameras[i];

            camera.id = carData.id + "_" + camera.id;

            const newCam = addCamera(camera, this.app, this);

            newCam.camTarget = camTarget;

            const carCamInfo = {
                id: camera.id,
                cam: newCam,
                offset: camera.target,
            };

            this.cameras.push(carCamInfo);

            this.add(newCam);
        }

        app.app.scene.add(camTarget);
    }

    turnTo(angle) {
        angle = Math.sign(angle) * this.turnAngle;

        this.wheelRotation = angle;

        for (let i = 0; i < this.turningWheels.length; i++) {
            const wheel = this.turningWheels[i];

            wheel.rotation.y = angle / 2;
        }
    }

    accelerate(delta) {
        this.speed += this.acceleration * delta;
        this.speed = Math.min(this.speed, this.maxSpeedForward);

        this.isAccelerating = true;
    }

    brake(delta) {
        if (!this.isBraking && this.speed <= 0) {
            this.speed -= this.brakeValue * delta;

            this.speed = Math.max(this.speed, this.maxSpeedBackwards);
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

        this.rotation.y += this.wheelRotation * delta * Math.sign(this.speed);
        this.nextPosition = this.position.add(
            carDirection.multiplyScalar(this.speed * delta)
        );
    }

    move(delta) {
        this.position.set(...this.nextPosition);

        if (this.speed >= 0) {
            this.speed = Math.max(0, this.speed - 0.01);
        } else {
            this.speed = Math.min(0, this.speed + 0.01);
        }

        for (let i = 0; i < this.cameras.length; i++) {
            const camInfo = this.cameras[i];

            if (this.app.app.activeCameraName == camInfo.id) {
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
            this.tiltCarX(-0.02);
        } else if (this.isBraking) {
            this.tiltCarX(0.03 * Math.sign(this.speed));
        } else {
            this.tiltCarX(0);
        }
        if (Math.sign(this.speed) != 0) {
            this.tiltCarZ((this.wheelRotation / this.turnAngle) * -0.02);
        } else {
            this.tiltCarZ(0);
        }

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
            0.1
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
}

MyCar.prototype.isGroup = true;

export { MyCar };

/**

Podem existir um ou mais modelos de carro. A mesma base geométrica pode ser decorada com diferentes texturas.

Alguns detalhes sobre um carro:
    - Deve ser controlado por meio das teclas WASD, respetivamente para acelerar, travar, virar à esquerda e virar à direita.
    - Quando em curva, as rodas da frente devem virar e o pivot de rotação do carro deve situar-se no centro do eixo traseiro.
    - Deve ser possível observar as quatro rodas girando em torno do seu eixo, em função da velocidade do carro.
    - Pode ter velocidade “negativa” (ou seja, andar em “marcha-atrás”).
    - Deverá ser dotado de uma velocidade máxima.

No início do jogo, o utilizador pode escolher o modelo de carro que deseja. Pode também escolher um carro autónomo com o qual concorrerá; a cada carro autónomo deve corresponder uma rota.

NOTA: na fase inicial do desenvolvimento, é aconselhável que seja utilizado um modelo geométrico muito simples para cada carro, por exemplo um retângulo com textura (vista de cima).

*/
