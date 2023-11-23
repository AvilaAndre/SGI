import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { MyApp } from "./MyApp.js";
import { MyContents } from "./MyContents.js";

/**
    This class customizes the gui interface for the app
*/
class MyGuiInterface {
    /**
     *
     * @param {MyApp} app The application object
     */
    constructor(app) {
        this.app = app;
        this.datgui = new GUI();
        this.contents = null;
    }

    /**
     * Set the contents object
     * @param {MyContents} contents the contents objects
     */
    setContents(contents) {
        this.contents = contents;
    }

    /**
     * Initialize the gui interface
     */
    init() {
        if (this.datgui != undefined) this.datgui.destroy();
        this.datgui = new GUI();

        this.datgui
            .add(this.contents, "wireframe")
            .onChange((value) => {
                this.contents.toggleWireframe(value);
            })
            .name("Wireframe");

        this.datgui
            .add(this.contents, "lightsOn")
            .onChange((value) => {
                this.contents.toggleLights(value);
            })
            .name("Toggle Lights");

        const cameraFolder = this.datgui.addFolder("Camera");
        cameraFolder
            .add(this.app, "activeCameraName", Object.keys(this.app.cameras))
            .name("active camera");
        cameraFolder.open();

        const individualLightsFolder =
            this.datgui.addFolder("Individual Lights");

        for (
            let camIdx = 0;
            camIdx < this.contents.lightsArray.length;
            camIdx++
        ) {
            const thisLightFolder = individualLightsFolder.addFolder(
                this.contents.lightsArray[camIdx].light.name ||
                    this.contents.lightsArray[camIdx].light.type
            );

            thisLightFolder
                .add(
                    this.contents.lightsArray[camIdx].light,
                    "intensity",
                    0,
                    20
                )
                .name("Intensity");

            thisLightFolder
                .addColor(this.contents.lightsArray[camIdx].light, "color")
                .name("Color");

            thisLightFolder.close();
        }
        individualLightsFolder.close();

        const customFolder = this.datgui.addFolder("Custom");

        // A controller for the curtain custom field
        let curtainController = undefined;
        const curtainValue = { curtains: 1 };

        // A folder for custom properties
        if (this.contents.curtains != []) {
            curtainController = customFolder
                .add(curtainValue, "curtains", 0.2, 3.5)
                .onChange((value) => this.contents.moveCurtains(value))
                .name("Curtains");
        }

        const resetButton = {
            reset: () => {
                this.contents.resetLights();
                if (curtainController) curtainController.setValue(1);
            },
        };
        customFolder.add(resetButton, "reset").name("Reset");
    }
}

export { MyGuiInterface };
