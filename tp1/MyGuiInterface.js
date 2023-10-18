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
        const cameras = [
            "Perspective",
            "Left",
            "Top",
            "Front",
            "Back",
            "Right",
        ];

        this.contents.observables.forEach((obs) => {
            cameras.push(obs.name);
        });

        // adds a folder to the gui interface for the camera
        const cameraFolder = this.datgui.addFolder("Camera");
        cameraFolder
            .add(this.app, "activeCameraName", cameras)
            .name("active camera");

        // note that we are using a property from the app
        cameraFolder
            .add(this.app.activeCamera.position, "x", 0, 10)
            .name("x coord");
        cameraFolder.open();

        // adds a folder to the gui interface for controlling the plane's texture parameters/properties

        const textureFolder = this.datgui.addFolder("Plane Texture");

        textureFolder
            .add(this.contents.floorTexture, "wrapS", [
                "RepeatWrapping",
                "ClampToEdgeWrapping",
                "MirroredRepeatWrapping",
            ])
            .onChange((value) => {
                this.contents.floorTexture.wrapS =
                    [
                        "RepeatWrapping",
                        "ClampToEdgeWrapping",
                        "MirroredRepeatWrapping",
                    ].indexOf(value) + 1000;
            })
            .name("Wrapping mode U");

        textureFolder
            .add(this.contents.floorTexture, "wrapT", [
                "RepeatWrapping",
                "ClampToEdgeWrapping",
                "MirroredRepeatWrapping",
            ])
            .onChange((value) => {
                this.contents.floorTexture.wrapT =
                    [
                        "RepeatWrapping",
                        "ClampToEdgeWrapping",
                        "MirroredRepeatWrapping",
                    ].indexOf(value) + 1000;
            })
            .name("Wrapping mode U");

        textureFolder
            .add(this.contents.floorTexture.repeat, "x", 0, 2, 0.1)
            .name("Repeat X");

        textureFolder
            .add(this.contents.floorTexture.repeat, "y", 0, 2, 0.1)
            .name("Repeat Y");

        textureFolder
            .add(this.contents.floorTexture.offset, "x", -1, 1, 0.1)
            .name("Offset X");

        textureFolder
            .add(this.contents.floorTexture.offset, "y", -1, 1, 0.1)
            .name("Offset Y");

        textureFolder
            .add(this.contents.floorTexture, "rotation", -Math.PI, Math.PI, 0.1)
            .name("Rotation");

        textureFolder.open();

        const lightsFolder = this.datgui.addFolder("Lights");

        // const lightsData = {
        //     wallLampsColor: this.contents.wallLampsColor,
        //     wallLampsIntensity: this.contents.wallLampsIntensity,
        // };

        lightsFolder
            .add(this.contents, "lightsOn")
            .onChange((value) => {
                this.contents.toggleLights(value);
            })
            .name("Toggle Lights");

        lightsFolder
            .add(this.contents, "curtain", 0.0, 1.0)
            .onChange((value) => {
                this.contents.moveCurtain(value);
            })
            .name("Move Curtains");

        // const wallLampsFolder = lightsFolder.addFolder("Wall Lamps");

        // wallLampsFolder
        //     .addColor(lightsData, "wallLampsColor")
        //     .onChange((value) => {
        //         this.contents.updateWallLampsColor(value);
        //     })
        //     .name("Wall Lamps Color");

        // wallLampsFolder
        //     .add(lightsData, "wallLampsIntensity", 0, 20)
        //     .onChange((value) => {
        //         this.contents.updateWallLampsIntensity(value);
        //     })
        //     .name("Wall Lamps Intensity");
    }
}

export { MyGuiInterface };
