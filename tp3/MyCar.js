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
        this.wheelRotation = 0;

        this.intention = new THREE.Vector3();
        this.speed = 0;
        this.maxSpeedForward = 40;
        this.maxSpeedBackwards = -8;
        this.acceleration = 20;
        this.brakeValue = 20;
        this.maxSpeed = 100;
        this.nextPosition = this.position;
        this.turnAngle = 1;

        // signals if is braking
        this.isBraking = false;

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
    }

    turnTo(angle) {
        angle = Math.sign(angle) * this.turnAngle;

        this.wheelRotation = angle;

        for (let i = 0; i < this.turningWheels.length; i++) {
            const wheel = this.turningWheels[i];

            wheel.rotation.y = angle;
        }
    }

    accelerate(delta) {
        this.speed += this.acceleration * delta;
        this.speed = Math.min(this.speed, this.maxSpeedForward);
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

    move() {
        this.position.set(...this.nextPosition);

        this.speed = Math.max(0, this.speed - 0.01);
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
