import * as THREE from "three";
import { instantiateNode } from "../builders/GraphBuilder.js";
import { RectangleCollider } from "../collisions/RectangleCollider.js";
import { MyContents } from "../MyContents.js";

/**
 * This class contains a powerup
 */
class MyPowerUp extends THREE.Object3D {
    #active = false;
    #effects = {
        TOP_SPEED: 0,
        STOP_TIME: 1,
    };

    /**
     *
     * @param {MyContents} contents the contents object
     * @param {Object} data data about the scene
     * @param {THREE.Vector2} position the powerup's position
     */
    constructor(contents, data, position) {
        super();
        this.contents = contents;

        this.object = instantiateNode("powerupCube", data, this.contents);

        const texture = new THREE.TextureLoader().load(
            "scenes/scene1/textures/powerupCube.png"
        );

        const powerUpMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 1.0 },
                pwUpActive: { value: false },
                rotationSpeed: { value: 2.0 },
                uTexture: { value: texture },
                pumpRange: { value: 0.1 },
                pumpSpeed: { value: 4 },
            },

            vertexShader: document.getElementById("vertexPowerUpShader")
                .textContent,
            fragmentShader: document.getElementById("fragmentPowerUpShader")
                .textContent,
        });

        powerUpMaterial.transparent = true;

        const geometry = this.createPowerUpBox();

        const mesh = new THREE.Mesh(geometry, powerUpMaterial);

        mesh.position.add(new THREE.Vector3(0, 0.2, 0));

        this.object = mesh;

        this.add(this.object);

        this.position.set(position.x, 0.5, position.y);

        this.contents.manager.collisionManager.addCollider(
            new RectangleCollider(this, new THREE.Vector2(0, 0), 1.25, 1.25),
            true
        );

        this.isPowerup = true;

        this.activate();
    }

    // geometry with normals compatible with the shader
    createPowerUpBox() {
        const geometry = new THREE.BufferGeometry();

        // prettier-ignore
        const vertices = new Float32Array( [
            -0.5, -0.5,  0.5, // v0
            0.5, -0.5,  0.5, // v1
            0.5,  0.5,  0.5, // v2
            -0.5,  0.5,  0.5, // v3

            -0.5, -0.5,  -0.5, // v4
            0.5, -0.5,  -0.5, // v5
            0.5,  0.5,  -0.5, // v6
            -0.5,  0.5,  -0.5, // v7

            -0.5, 0.5,  -0.5, // v8
            0.5, 0.5,  -0.5, // v9
            0.5,  0.5,  0.5, // v10
            -0.5,  0.5,  0.5, // v11

            -0.5, -0.5,  -0.5, // v12
            0.5, -0.5,  -0.5, // v13
            0.5, -0.5,  0.5, // v14
            -0.5, -0.5,  0.5, // v15
            
            0.5, -0.5,  -0.5, // v16
            0.5, -0.5,  0.5, // v17
            0.5,  0.5,  0.5, // v18
            0.5,  0.5,  -0.5, // v19

            -0.5, -0.5,  -0.5, // v20
            -0.5, -0.5,  0.5, // v21
            -0.5,  0.5,  0.5, // v22
            -0.5,  0.5,  -0.5, // v23
        ] );

        // prettier-ignore
        const normals = new Float32Array( [
            -1.0, -1.0,  1.0, // v0
            1.0, -1.0,  1.0, // v1
            1.0,  1.0,  1.0, // v2
            -1.0,  1.0,  1.0, // v3

            -1.0, -1.0,  -1.0, // v4
            1.0, -1.0,  -1.0, // v5
            1.0,  1.0,  -1.0, // v6
            -1.0,  1.0,  -1.0, // v7

            -1.0, 1.0,  -1.0, // v8
            1.0, 1.0,  -1.0, // v9
            1.0,  1.0,  1.0, // v10
            -1.0,  1.0,  1.0, // v11

            -1.0, -1.0,  -1.0, // v12
            1.0, -1.0,  -1.0, // v13
            1.0, -1.0,  1.0, // v14
            -1.0, -1.0,  1.0, // v15

            1.0, -1.0,  -1.0, // v16
            1.0, -1.0,  1.0, // v17
            1.0,  1.0,  1.0, // v18
            1.0,  1.0,  -1.0, // v19

            -1.0, -1.0,  -1.0, // v20
            -1.0, -1.0,  1.0, // v21
            -1.0,  1.0,  1.0, // v22
            -1.0,  1.0,  -1.0, // v23
        ] );

        // prettier-ignore
        const uvs = new Float32Array( [
            0.0, 0.0, // v0
            1.0, 0.0, // v1
            1.0, 1.0, // v2
            0.0, 1.0, // v3

            1.0, 0.0, // v4
            0.0, 0.0, // v5
            0.0, 1.0, // v6
            1.0, 1.0, // v7

            0.0, 0.0, // v8
            1.0, 0.0, // v9
            1.0, 1.0, // v10
            0.0, 1.0, // v11

            0.0, 0.0, // v12
            1.0, 0.0, // v13
            1.0, 1.0, // v14
            0.0, 1.0, // v15

            1.0, 0.0, // v16
            0.0, 0.0, // v17
            0.0, 1.0, // v18
            1.0, 1.0, // v19

            0.0, 0.0, // v20
            1.0, 0.0, // v21
            1.0, 1.0, // v22
            0.0, 1.0, // v23
        ] );

        // prettier-ignore
        const indices = [
            0, 1, 2,
            2, 3, 0,

            4, 6, 5,
            6, 4, 7,

            9, 8, 10,
            11, 10, 8,

            12, 13, 14,
            12, 14, 15,

            16, 18, 17,
            16, 19, 18,

            20, 21, 22,
            20, 22, 23,
        ];

        geometry.setIndex(indices);

        geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(vertices, 3)
        );
        geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
        geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));

        return geometry;
    }

    /**
     * Triggers the effect when this powerup is collided with
     */
    trigger() {
        if (!this.#active) return null;

        this.deactivate();

        return this.effect;
    }

    /**
     * Deactivates the powerup
     */
    deactivate() {
        this.#active = false;
    }

    /**
     * Called to reactivate this powerup
     */
    activate() {
        this.effect = Math.floor(
            Math.random() * Object.keys(this.#effects).length
        );

        this.#active = true;
    }

    /**
     * Updates the time value on the shader
     * @param {number} delta
     */
    update(delta) {
        this.object.material.uniforms.time.value += delta;
        this.object.material.uniforms.pwUpActive.value = this.#active;
    }
}

MyPowerUp.prototype.isGroup = true;

export { MyPowerUp };
