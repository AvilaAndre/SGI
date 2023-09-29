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

        const spotLightData = {
            color: this.contents.spotLightColor,
            penumbra: this.contents.spotLightPenumbra,
            decay: this.contents.spotLightDecay,
            position: this.contents.spotLightPosition,
            "target position": this.contents.targetPosition,
        };

        const spotLightFolder = this.datgui.addFolder("SpotLight");
        spotLightFolder.addColor(spotLightData, "color").onChange((value) => {
            this.contents.updateSpotLightColor(value);
        });
        spotLightFolder
            .add(this.contents.spotLight, "intensity")
            .name("Intensity")
            .onChange((value) => {
                this.contents.spotLight.intensity = value;
            });
        spotLightFolder
            .add(this.contents.spotLight, "distance")
            .name("Limit Distance")
            .onChange((value) => {
                this.contents.spotLight.distance = value;
            });
        spotLightFolder
            .add(this.contents.spotLight, "angle", 0, 2 * Math.PI)
            .name("Angle of Spot")
            .onChange((value) => {
                this.contents.spotLight.angle = value;
            });
        spotLightFolder
            .add(this.contents.spotLight, "penumbra")
            .name("Penumbra")
            .onChange((value) => {
                this.contents.spotLight.penumbra = value;
            });
        spotLightFolder
            .add(this.contents.spotLight, "decay")
            .name("Decay")
            .onChange((value) => {
                this.contents.spotLight.decay = value;
            });
        const spotLightPositionFolder = spotLightFolder.addFolder("Position");
        spotLightPositionFolder.add(this.contents.spotLight.position, "x");
        spotLightPositionFolder.add(this.contents.spotLight.position, "y");
        spotLightPositionFolder.add(this.contents.spotLight.position, "z");
        const spotLightTargetPositionFolder =
            spotLightFolder.addFolder("TargetPosition");
        spotLightTargetPositionFolder.add(
            this.contents.spotLightTarget.position,
            "x"
        );
        spotLightTargetPositionFolder.add(
            this.contents.spotLightTarget.position,
            "y"
        );
        spotLightTargetPositionFolder.add(
            this.contents.spotLightTarget.position,
            "z"
        );
    }
}

export { MyGuiInterface };