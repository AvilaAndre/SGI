import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { MyApp } from './MyApp.js';
import { MyContents } from './MyContents.js';
import * as THREE from 'three';

/**
    This class customizes the gui interface for the app
*/
class MyGuiInterface  {

    /**
     * 
     * @param {MyApp} app The application object 
     */
    constructor(app) {
        this.app = app
        this.datgui =  new GUI();
        this.contents = null
    }

    /**
     * Set the contents object
     * @param {MyContents} contents the contents objects 
     */
    setContents(contents) {
        this.contents = contents
    }

    /**
     * Initialize the gui interface
     */
    init() {
        // add a folder to the gui interface for the box
        const boxFolder = this.createFolder( 'Box' );
        // note that we are using a property from the contents object 
        boxFolder.add(this.contents, 'boxMeshSize', 0, 10).name("size").onChange( () => { this.contents.rebuildBox() } );
        boxFolder.add(this.contents, 'boxEnabled', true).name("enabled");
        boxFolder.add(this.contents.boxDisplacement, 'x', -5, 5)
        boxFolder.add(this.contents.boxDisplacement, 'y', -5, 5)
        boxFolder.add(this.contents.boxDisplacement, 'z', -5, 5)
        boxFolder.close()
        
        const data = {  
            'diffuse color': this.contents.diffusePlaneColor,
            'specular color': this.contents.specularPlaneColor,
        };

        // adds a folder to the gui interface for the plane
        const planeFolder = this.createFolder( 'Plane' );
        planeFolder.addColor( data, 'diffuse color' ).onChange( (value) => { this.contents.updateDiffusePlaneColor(value) } );
        planeFolder.addColor( data, 'specular color' ).onChange( (value) => { this.contents.updateSpecularPlaneColor(value) } );
        planeFolder.add(this.contents, 'planeShininess', 0, 1000).name("shininess").onChange( (value) => { this.contents.updatePlaneShininess(value) } );
        planeFolder.close();

        // adds a folder to the gui interface for the camera
        const cameraFolder = this.createFolder('Camera')
        cameraFolder.add(this.app, 'activeCameraName', [ 'Perspective', 'Left', 'Top', 'Front' ] ).name("active camera");
        // note that we are using a property from the app 
        cameraFolder.add(this.app.activeCamera.position, 'x', 0, 10).name("x coord")
        cameraFolder.close()

         // adds a folder to the gui interface for the spotlight
         const lightFolder = this.createFolder('Spot light')
         lightFolder.add(this.contents.spotLight, 'intensity', 0, 40).name("intensity (cd)");
         lightFolder.add(this.contents.spotLight, 'distance', 0, 20).name("distance");
         lightFolder.add(this.contents.spotLight, 'penumbra', 0, 1).name("penumbra ratio");
         lightFolder.add(this.contents.spotLight, 'decay', 0, 3).name("decay with distance");
         lightFolder.add(this.contents.spotLight.position, 'y', 0, 20).name("y coord");
         lightFolder.add(this.contents, 'spotangle', 10, 60).name("angle").onChange( (value) => { this.contents.updateSpotAngle() } );
         
         lightFolder.open()

         // adds a folder to the gui interface for the camera
         const textureFolder = this.createFolder('Plane Texture')
         textureFolder.add(this.contents, 'wrapSmode', [ 'Clamp to edge', 'Repeat', 'Mirrored repeat' ] ).name("wrap S mode").onChange( (value) => { this.contents.wrapSmode = value; this.contents.disposeAndCreateTexture() }) ;
         textureFolder.add(this.contents, 'wrapTmode', [ 'Clamp to edge', 'Repeat', 'Mirrored repeat' ] ).name("wrap T mode").onChange( (value) => { this.contents.wrapTmode = value; this.contents.disposeAndCreateTexture() }) ;
         textureFolder.add(this.contents, 'repeatS', 0.5, 4).name("repeat S").onChange( (value) => { this.contents.updateRepeatST() } );
         textureFolder.add(this.contents, 'repeatT', 0.5, 4).name("repeat T").onChange( (value) => { this.contents.updateRepeatST() } );
         textureFolder.add(this.contents.planeTexture.offset, 'x', -1, 1).name("offset X").onChange( (value) => { this.contents.updateOffset() } );
         textureFolder.add(this.contents.planeTexture.offset, 'y', -1, 1).name("offset Y").onChange( (value) => { this.contents.updateOffset() } );
         textureFolder.add(this.contents, 'rotation', 0, 180).name("rotation").onChange( (value) => { this.contents.updateRotation() } );
        

         cameraFolder.open()
    }

    // new: 20230924
    createFolder(name) {
        return this.datgui.addFolder(name);
    }
}

export { MyGuiInterface };