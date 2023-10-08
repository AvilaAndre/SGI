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
        // add a folder to the gui interface for the box
        const boxFolder = this.datgui.addFolder("Box");
        // note that we are using a property from the contents object
        boxFolder
            .add(this.contents, "boxMeshSize", 0, 10)
            .name("size")
            .onChange(() => {
                this.contents.rebuildBox();
            });
        boxFolder.add(this.contents, "boxEnabled", true).name("enabled");
        boxFolder.add(this.contents.boxDisplacement, "x", -5, 5);
        boxFolder.add(this.contents.boxDisplacement, "y", -5, 5);
        boxFolder.add(this.contents.boxDisplacement, "z", -5, 5);
        boxFolder.open();

        const data = {
            "diffuse color": this.contents.diffusePlaneColor,
            "specular color": this.contents.specularPlaneColor,
        };

        // adds a folder to the gui interface for the plane
        const planeFolder = this.datgui.addFolder("Plane");
        planeFolder.addColor(data, "diffuse color").onChange((value) => {
            this.contents.updateDiffusePlaneColor(value);
        });
        planeFolder.addColor(data, "specular color").onChange((value) => {
            this.contents.updateSpecularPlaneColor(value);
        });
        planeFolder
            .add(this.contents, "planeShininess", 0, 1000)
            .name("shininess")
            .onChange((value) => {
                this.contents.updatePlaneShininess(value);
            });
        planeFolder.open();

        // adds a folder to the gui interface for the camera
        const cameraFolder = this.datgui.addFolder("Camera");
        cameraFolder
            .add(this.app, "activeCameraName", [
                "Perspective",
                "Left",
                "Top",
                "Front",
                "Back",
                "Right",
            ])
            .name("active camera");

        // note that we are using a property from the app
        cameraFolder
            .add(this.app.activeCamera.position, "x", 0, 10)
            .name("x coord");
        cameraFolder.open();

        // adds a folder to the gui interface for controlling the plane's texture parameters/properties

        const textureFolder = this.datgui.addFolder("Plane Texture");

        textureFolder
            .add(this.contents, "wrappingModeU", ["A", "B", "C"])
            .name("Wrapping mode U");

        textureFolder.open();

        const lightsFolder = this.datgui.addFolder("Lights");

        const lightsData = {
            wallLampsColor: this.contents.wallLampsColor,
            wallLampsIntensity: this.contents.wallLampsIntensity,
        };

        lightsFolder.add(this.contents, "lightsOn").onChange((value) => {
            this.contents.toggleLights(value)
        })

        const wallLampsFolder = lightsFolder.addFolder("Wall Lamps")

        wallLampsFolder
            .addColor(lightsData, "wallLampsColor")
            .onChange((value) => {
                this.contents.updateWallLampsColor(value);
            })
            .name("Wall Lamps Color");

        wallLampsFolder
            .add(lightsData, "wallLampsIntensity", 0, 20)
            .onChange((value) => {
                this.contents.updateWallLampsIntensity(value);
            })
            .name("Wall Lamps Intensity");
    }
}

export { MyGuiInterface };
