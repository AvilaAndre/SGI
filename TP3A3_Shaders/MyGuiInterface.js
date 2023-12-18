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
        const gui = this.datgui.addFolder( 'Options' );
        const shaderList = this.contents.fromShaderList()
		gui.add(this.contents, 'selectedObjectIndex', this.contents.objectList).onChange(this.contents.onSelectedObjectChanged.bind(this.contents)).name('Object Type');
		gui.add(this.contents, 'selectedShaderIndex', shaderList).name('Shader examples').onChange(this.contents.onSelectedShaderChanged.bind(this.contents));
		gui.add(this.contents, 'showShaderCode').name('Show Shader Code').onChange(this.contents.onShaderCodeVizChanged.bind(this.contents));
		gui.add(this.contents, 'scaleFactor',0,1,0.01).onChange(this.contents.onScaleFactorChanged.bind(this.contents));
        gui.add(this.contents, 'blendFactor',0,1,0.01).onChange(this.contents.onBlendFactorChanged.bind(this.contents));
    }
}

export { MyGuiInterface };