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
      
        const textureFolder = this.datgui.addFolder('Right texture')
        textureFolder.add(this.contents.texture2, 'minFilter', this.contents.options.minFilters).name('minFilter (far)').onChange((value) => this.contents.updateMinFilter(value))
        textureFolder.add(this.contents.texture2, 'magFilter', this.contents.options.magFilters).name('magFilter (close)').onChange((value) => this.contents.updateMagFilter(value))
        textureFolder.open()

        // adds a folder to the gui interface for the camera
        const cameraFolder = this.datgui.addFolder('Camera')
        cameraFolder.add(this.app, 'activeCameraName', [ 'Perspective', 'Left', 'Top', 'Front' ] ).name("active camera");
        
        // note that we are using a property from the app 
        cameraFolder.add(this.app.activeCamera.position, 'z', 0.05, 1).name("z coord")
        cameraFolder.open()
    }
}

export { MyGuiInterface };