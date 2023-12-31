import * as THREE from "three";
import { MyContents } from "../MyContents.js";

/**
 * This class contains a screen
 */
class BigScreensManager {
    #screenMeshes = [];

    /**
     *
     * @param {MyContents} contents the contents object
     */
    constructor(contents) {
        this.contents = contents;
    }

    /**
     *
     * @param {THREE.Object3D} bigScreenObj the big screen's object
     */
    loadObject(bigScreenObj) {
        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(8, 4, 8),
            new THREE.ShaderMaterial({
                uniforms: {
                    tDiffuse: {
                        value: new THREE.TextureLoader().load(
                            "sprite_sheet.png"
                        ),
                    },
                    tDepth: { value: null },
                    cameraNear: { value: 1 },
                    cameraFar: { value: 1000 },
                },

                vertexShader:
                    document.getElementById("vertexBigScreen").textContent,
                fragmentShader:
                    document.getElementById("fragmentBigScreen").textContent,
            })
        );
        const dir = new THREE.Vector3();

        bigScreenObj.getWorldDirection(dir);

        mesh.position.set(
            ...bigScreenObj
                .getWorldPosition(new THREE.Vector3())
                .clone()
                .add(new THREE.Vector3(0, 5, 0))
        );

        mesh.rotation.y = Math.atan2(dir.x, dir.z);

        this.contents.app.scene.add(mesh);

        this.#screenMeshes.push(mesh);

        this.textu = new THREE.TextureLoader().load("sprite_sheet.png");
    }

    /**
     * Resets this manager
     */
    reset() {
        this.#screenMeshes = [];
    }

    update(delta, target) {
        this.#screenMeshes.forEach((mesh) => {
            if (this.contents.app.framebufferTexture) {
                mesh.material.uniforms.tDiffuse.value =
                    this.contents.app.framebufferTexture;
            }

            //mesh.material.uniforms.tDepth.value = target.depthTexture;
        });
    }

    createTextureFromImage() {
        const canvas = document.getElementById("canvas-elem");
        const texture = new THREE.CanvasTexture(canvas);

        return texture;
    }
}
export { BigScreensManager };
