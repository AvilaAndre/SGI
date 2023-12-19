import * as THREE from "three";
import { MyApp } from "./MyApp.js";
/**
 * This class contains a hud 
 */
class MyFloor extends THREE.Object3D {
    /**
     *
     * @param {MyApp} app the application object
     * @param {Object} data the path of the hud
     */
    constructor(app) {
        super();
        this.app = app;
        this.type = "Group";

        // Create a plane geometry
        const planeGeometry = new THREE.PlaneGeometry(404, 404);

        // Load a texture
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load('scenes/scene1/textures/grass.jpg');

        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(200, 200); // Adjust the repeat values as needed

        // Create a material with the texture
        const planeMaterial = new THREE.MeshBasicMaterial({ map: texture });

        // Combine geometry and material to create a mesh
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);

        plane.rotation.x = -Math.PI / 2;
        plane.position.set(0, -0.2, 0);

        this.add(plane);



    }

}

MyFloor.prototype.isGroup = true;
    
export { MyFloor };
    