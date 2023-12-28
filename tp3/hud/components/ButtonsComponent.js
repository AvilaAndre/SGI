import * as THREE from 'three';
import { HudComponent } from '../HudComponent.js';

class ButtonsComponent extends HudComponent {
    #totalLetters = 1;
    #letterMeshes = [];

    constructor(position, scale, getValue, initialText) {
        super(position, scale, getValue, initialText);

    
        // Load the sprite sheet texture
        const textureLoader = new THREE.TextureLoader();
        const spriteSheetTexture = textureLoader.load('scenes/scene1/textures/HUD_BUTTONS_2.png', function(texture) {
        // Assuming the "PLAY" button is the first button on the sprite sheet and the buttons are evenly spaced
        const buttonWidth = texture.image.width / 3; // Update with actual number
        const buttonHeight = texture.image.height / 10; // Update with actual number
        
        // Calculate UV coordinates for the first "PLAY" button
        const uStart = 0;
        const vStart = 0;
        const uEnd = buttonWidth / texture.image.width;
        const vEnd = buttonHeight / texture.image.height;

        // Create a material using the sprite sheet texture
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true
        });

        // Create a plane geometry for the button
        const geometry = new THREE.PlaneGeometry(buttonWidth, buttonHeight);
        const mesh = new THREE.Mesh(geometry, material);

        // Adjust the UV mapping of the geometry
        const uvs = geometry.attributes.uv.array;
        uvs[0] = uvs[2] = uStart; // Left side u's
        uvs[4] = uvs[6] = uEnd;   // Right side u's
        uvs[1] = uvs[5] = vEnd;   // Top side v's
        uvs[3] = uvs[7] = vStart; // Bottom side v's
        geometry.attributes.uv.needsUpdate = true;

        // Position the mesh and add it to your scene
        mesh.position.set(0, -5, -1); // Set desired position
        this.add(mesh);
        });

    }

    
    
}

export { ButtonsComponent };
