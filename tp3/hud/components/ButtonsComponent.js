import * as THREE from 'three';
import { HudComponent } from '../HudComponent.js';

class ButtonsComponent extends HudComponent {
    constructor(position, scale, imageName) {
        super(position, scale);
        this.imageName = imageName;
        this.name = imageName.replace('.png', '');
        this.createImagePlane();
    }

    /**
     * Creates a plane that has a texture of a button, that will be added to the HUD
     */
    createImagePlane() {

        new THREE.TextureLoader().load(`scenes/scene1/textures/${this.imageName}`, (texture) => {

            const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });


            const geometry = new THREE.PlaneGeometry(0.25, 0.15); 
            const imagePlane = new THREE.Mesh(geometry, material);


            imagePlane.position.set(this.position.x, this.position.y, this.position.z);
            imagePlane.scale.set(this.scale.x, this.scale.y, this.scale.z);


            console.log("imagePlane:", imagePlane);
            this.add(imagePlane);
        });
    }
}

export { ButtonsComponent };
