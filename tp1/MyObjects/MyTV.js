import * as THREE from "three";
import { MyApp } from "../MyApp.js";

/**
 * This class contains a 3D chair representation
 */
class MyTV extends THREE.Object3D {
    /**
     *
     * @param {MyApp} app the application object
     * @param {number} width the width of the frame
     * @param {number} height the height of the frame
     * @param {number} barWidth the depth of the frame's bar
     * @param {number} barDepth the depth of the frame's bar
     * @param {string} photo the photo to display in the frame
     */
    constructor(app, width, height, barWidth, barDepth) {
        super();
        this.app = app;
        this.type = "Group";
        this.width = width || 0.4;
        this.height = height || 0.6;
        this.barWidth = barWidth || 0.1;
        this.barDepth = barDepth || 0.06;
        //this.texture = null;
        
           // Define video and video texture
           let video = document.getElementById('video');
           video.muted = true;
           let texture = new THREE.VideoTexture(video);
   
           const material = new THREE.MeshBasicMaterial({ map: texture });
   
           this.tvTexture = new THREE.TextureLoader().load('textures/steel.jpg');
   
           this.frameMaterial = new THREE.MeshPhongMaterial({
               map: this.tvTexture,
               shininess: 10,
           });



        let frameHorizontalBar = new THREE.BoxGeometry(
            this.width + this.barWidth*2,
            this.barDepth,
            this.barWidth,
        );
        let frameVerticalBar = new THREE.BoxGeometry(
            this.barWidth,
            this.height + this.barWidth/2,
            this.barDepth,
        );

        [-1, 1].forEach((num) => {
            let frameHorizontalMesh = new THREE.Mesh(
                frameHorizontalBar,
                this.frameMaterial
            );
            let frameVerticalMesh = new THREE.Mesh(
                frameVerticalBar,
                this.frameMaterial
            );

            frameHorizontalMesh.position.y = num * ((this.height / 2) + this.barWidth/2)
            frameVerticalMesh.position.x = num * ((this.width / 2) + this.barWidth/2);

            this.add(frameHorizontalMesh);
            this.add(frameVerticalMesh);
        });

        let photoGeometry = new THREE.PlaneGeometry(this.width, this.height);


        let photoMesh = new THREE.Mesh(
            photoGeometry,
            material
        );

        this.add(photoMesh);

        this.dispose = function () {
            // Dispose of the video texture and stop the video
            texture.dispose();
            video.pause();
            video.src = '';
            video.load();
        };
        

        

    }
}

MyTV.prototype.isGroup = true;

export { MyTV };
