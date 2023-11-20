import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { MyApp } from './MyApp.js';
import { MyContents } from './MyContents.js';

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
        
        const data = {  
            'diffuse color': this.contents.diffuseColor,
            'specular color': this.contents.specularColor,
        };

        // adds a folder to the gui interface for the plane
        const geometryFolder = this.datgui.addFolder( 'Earth' );
        geometryFolder.addColor( data, 'diffuse color' ).onChange( (value) => { this.contents.updateDiffuseColor(value) } );
        geometryFolder.addColor( data, 'specular color' ).onChange( (value) => { this.contents.updateSpecularColor(value) } );
        geometryFolder.add(this.contents, 'shininess', 0, 1000).name("shininess").onChange( (value) => { this.contents.updateShininess(value) } );
        geometryFolder.add(this.contents, 'bumpScale', 0.0001, 0.1).name("Bump scale").onChange( (value) => { this.contents.updateBumpScale(value) } );

        var text = {
                showTexture: 'on',
                showBumpTexture: 'on'
            }
            geometryFolder.add(text, 'showTexture', { On: 'on', Off: 'off' } ).name("Show texture").onChange( (value) => { this.contents.updateShowTexture(value === 'on') } );
            geometryFolder.add(text, 'showBumpTexture', { On: 'on', Off: 'off'} ).name("Show Bump").onChange( (value) => { this.contents.updateShowBumpTexture(value === 'on') } );


        geometryFolder.open();

        // adds a folder to the gui interface for the camera
        const cameraFolder = this.datgui.addFolder('Camera')
        cameraFolder.add(this.app, 'activeCameraName', [ 'Perspective', 'Left', 'Top', 'Front' ] ).name("active camera");
        // note that we are using a property from the app 
        cameraFolder.add(this.app.activeCamera.position, 'x', 1, 10).name("x coord")
        cameraFolder.open()
    }
}

export { MyGuiInterface };