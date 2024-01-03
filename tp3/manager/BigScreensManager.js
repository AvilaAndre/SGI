import * as THREE from "three";
import { MyContents } from "../MyContents.js";

/**
 * This class contains a screen
 */
class BigScreensManager {
    #screenMeshes = [];

    /**
     * This manager manages all the screens that show the current camera.
     * @param {MyContents} contents the contents object
     */
    constructor(contents) {
        this.contents = contents;
    }

    /**
     * Adds a sceen object when a mesh representing the big screen is created
     * @param {THREE.Object3D} bigScreenObj the big screen's object
     */
    loadObject(bigScreenObj) {
        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(8, 4, 8, 100, 100, 100),
            new THREE.ShaderMaterial({
                uniforms: {
                    tDiffuse: {
                        value: new THREE.TextureLoader().load(
                            "scenes/scene1/textures/sprite_sheet.png"
                        ),
                    },
                    tDepth: { value: null },
                    cameraNear: {
                        value: 1,
                    },
                    cameraFar: {
                        value: 1000,
                    },
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
    }

    /**
     * Resets this manager
     */
    reset() {
        this.#screenMeshes = [];
    }

    /**
     * Updates the manager, setting its material's uniforms values
     * @param {number} _delta
     * @param {THREE.RenderTarget} target
     */
    update(_delta, target) {
        this.#screenMeshes.forEach((mesh) => {
            if (target.depthTexture) {
                mesh.material.uniforms.tDepth.value = target.depthTexture;
                mesh.material.uniforms.tDiffuse.value = target.texture;
            }
        });
    }
}
export { BigScreensManager };
