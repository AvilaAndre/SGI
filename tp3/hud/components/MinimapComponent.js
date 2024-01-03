import * as THREE from "three";
import { HudComponent } from "../HudComponent.js";

/**
 * This class contains methods of  the game
 */
class MinimapComponent extends HudComponent {
    #path = null;
    #sprites = [];
    #playerCarObj = null;
    #opponentCarObj = null;

    /**
     * Dsiplays a map with the current location of the cars
     * @param {THREE.Vector2} position
     * @param {number} spriteScale
     * @param {function} valueGetter gets the value for this component
     * @param {Array} initialValue
     * @param {number} nDigits the ammount of digits
     */
    constructor(position, spriteScale, valueGetter, initialValue, track) {
        super(position, spriteScale, valueGetter, initialValue);

        this.#path = track.path.map((pt) => pt.multiplyScalar(0.01));
        this.setValue(this.value);

        this.curve = new THREE.CatmullRomCurve3(
            this.#path,
            true,
            "centripetal"
        );

        const geometry = new THREE.TubeGeometry(
            this.curve,
            this.#path.length * 10,
            0.08,
            3,
            false
        );
        const material = new THREE.MeshBasicMaterial({
            color: 0x000000,
            opacity: 0.3,
            transparent: true,
        });
        const mesh = new THREE.Mesh(geometry, material);

        mesh.scale.set(-this.spriteScale, this.spriteScale, this.spriteScale);
        mesh.rotation.x = -Math.PI / 2;

        this.add(mesh);

        // player car obj
        if (initialValue.playerCar) {
            this.#playerCarObj = new THREE.Mesh(
                new THREE.CircleGeometry(0.05 * this.spriteScale),
                new THREE.MeshBasicMaterial({ color: 0x0000ff })
            );
            this.#playerCarObj.position.z += 0.01;

            this.add(this.#playerCarObj);
        }

        // opponent car obj
        if (initialValue.opponentCar) {
            this.#opponentCarObj = new THREE.Mesh(
                new THREE.CircleGeometry(0.05 * this.spriteScale),
                new THREE.MeshBasicMaterial({ color: 0xff0000 })
            );
            this.#opponentCarObj.position.z += 0.009;

            this.add(this.#opponentCarObj);
        }

        this.setValue(initialValue);
    }

    /**
     * Updates this component
     */
    update() {
        if (this.valueGetter) {
            this.setValue(this.valueGetter());
        }

        for (let i = 0; i < this.#sprites.length; i++) {
            const sprite = this.#sprites[i];

            const spriteNumber = parseInt(this.value[i]);

            sprite.material.map.offset.x = spriteNumber / 10;
        }
    }

    /**
     * Updates the positions of the cars
     * @param {Object} newValue
     */
    setValue(newValue) {
        if (this.#playerCarObj && newValue.playerCar) {
            this.#playerCarObj.position.x = newValue.playerCar.position
                .clone()
                .multiplyScalar(-0.01 * this.spriteScale).x;
            this.#playerCarObj.position.y = newValue.playerCar.position
                .clone()
                .multiplyScalar(0.01 * this.spriteScale).z;
        }
        if (this.#opponentCarObj && newValue.opponentCar) {
            this.#opponentCarObj.position.x = newValue.opponentCar.position
                .clone()
                .multiplyScalar(-0.01 * this.spriteScale).x;
            this.#opponentCarObj.position.y = newValue.opponentCar.position
                .clone()
                .multiplyScalar(0.01 * this.spriteScale).z;
        }
    }
}

export { MinimapComponent };
