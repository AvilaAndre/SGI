import * as THREE from 'three';
import { HudComponent } from '../HudComponent.js';

class ButtonsComponent extends HudComponent {
    constructor(position, scale, imageName) {
        super(position, scale);
        this.imageName = imageName;
        this.createImagePlane();
    }

    createImagePlane() {
        // Load the image texture
        new THREE.TextureLoader().load(`scenes/scene1/textures/${this.imageName}`, (texture) => {
            // Create material with the loaded texture
            const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });

            // Create plane geometry and apply material
            const geometry = new THREE.PlaneGeometry(0.25, 0.15); // Adjust the size as needed
            const imagePlane = new THREE.Mesh(geometry, material);

            // Adjust position and scale based on constructor parameters
            imagePlane.position.set(this.position.x, this.position.y, this.position.z);
            imagePlane.scale.set(this.scale.x, this.scale.y, this.scale.z);

            // Add image plane to the component
            this.add(imagePlane);
        });
    }
}

export { ButtonsComponent };
