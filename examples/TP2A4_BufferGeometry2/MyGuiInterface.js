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
        // add a folder to the gui interface for the box
        const boxFolder = this.datgui.addFolder( 'Shadows' );
        // note that we are using a property from the contents object 
        boxFolder.add(this.contents, 'boxSize', 100,1000, 10).name("boxSize").onChange((value) => { this.contents.rebuildCube()});
        boxFolder.add(this.contents, 'triangleSize', 1,12,1).name("triangle size").onChange((value) => { this.contents.rebuildCube()});
        boxFolder.add(this.contents, 'triangles', 1000,1000000,1000).name("triangles").onChange((value) => { this.contents.rebuildCube()});
        boxFolder.open()
    }
}

export { MyGuiInterface };