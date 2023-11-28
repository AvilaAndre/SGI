import * as THREE from "three";
import { MyAxis } from "./MyAxis.js";

/**
 *  This class contains the contents of out application
 */
class MyContents {
  /**
       constructs the object
       @param {MyApp} app The application object
    */
  constructor(app) {
    this.app = app;
    this.axis = null;

    //Curve related attributes
    this.segments = 100;
    this.width = 1;
    this.textureRepeat = 1;
    this.showWireframe = true;
    this.showMesh = true;
    this.showLine = true;
    this.closedCurve = false;

    this.path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-5, 0, 5),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(5, 0, 5)
    ]);
  }
  /**
   * initializes the contents
   */
  init() {
    // create once
    if (this.axis === null) {
      // create and attach the axis to the scene
      this.axis = new MyAxis(this);
      this.app.scene.add(this.axis);
    }

    // add a point light on top of the model
    const pointLight = new THREE.PointLight(0xffffff, 500, 0);
    pointLight.position.set(0, 20, 0);
    this.app.scene.add(pointLight);

    // add a point light helper for the previous point light
    const sphereSize = 0.5;
    const pointLightHelper = new THREE.PointLightHelper(pointLight, sphereSize);
    this.app.scene.add(pointLightHelper);

    // add an ambient light
    const ambientLight = new THREE.AmbientLight(0x555555);
    this.app.scene.add(ambientLight);

    this.buildCurve();
  }

  /**
   * Creates the necessary elements for the curve
   */
  buildCurve() {
    this.createCurveMaterialsTextures();
    this.createCurveObjects();
  }

  /**
   * Create materials for the curve elements: the mesh, the line and the wireframe
   */
  createCurveMaterialsTextures() {
    const texture = new THREE.TextureLoader().load("./images/uvmapping.jpg");
    texture.wrapS = THREE.RepeatWrapping;

    this.material = new THREE.MeshBasicMaterial({ map: texture });
    this.material.map.repeat.set(3, 3);
    this.material.map.wrapS = THREE.RepeatWrapping;
    this.material.map.wrapT = THREE.RepeatWrapping;

    this.wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x0000ff,
      opacity: 0.3,
      wireframe: true,
      transparent: true,
    });

    this.lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
  }

  /**
   * Creates the mesh, the line and the wireframe used to visualize the curve
   */
  createCurveObjects() {
    let geometry = new THREE.TubeGeometry(
      this.path,
      this.segments,
      this.width,
      3,
      this.closedCurve
    );
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.wireframe = new THREE.Mesh(geometry, this.wireframeMaterial);

    let points = this.path.getPoints(this.segments);
    let bGeometry = new THREE.BufferGeometry().setFromPoints(points);

    // Create the final object to add to the scene
    this.line = new THREE.Line(bGeometry, this.lineMaterial);

    this.curve = new THREE.Group();

    this.mesh.visible = this.showMesh;
    this.wireframe.visible = this.showWireframe;
    this.line.visible = this.showLine;

    this.curve.add(this.mesh);
    this.curve.add(this.wireframe);
    this.curve.add(this.line);

    this.curve.rotateZ(Math.PI);
    this.curve.scale.set(1,0.2,1);
    this.app.scene.add(this.curve);
  }

  /**
   * Called when user changes number of segments in UI. Recreates the curve's objects accordingly.
   */
  updateCurve() {
    if (this.curve !== undefined && this.curve !== null) {
      this.app.scene.remove(this.curve);
    }
    this.buildCurve();
  }

  /**
   * Called when user curve's closed parameter in the UI. Recreates the curve's objects accordingly.
   */
  updateCurveClosing() {
    if (this.curve !== undefined && this.curve !== null) {
      this.app.scene.remove(this.curve);
    }
    this.buildCurve();
  }

  /**
   * Called when user changes number of texture repeats in UI. Updates the repeat vector for the curve's texture.
   * @param {number} value - repeat value in S (or U) provided by user
   */
  updateTextureRepeat(value) {
    this.material.map.repeat.set(value, 3);
  }

  /**
   * Called when user changes line visibility. Shows/hides line object.
   */
  updateLineVisibility() {
    this.line.visible = this.showLine;
  }
  
  /**
   * Called when user changes wireframe visibility. Shows/hides wireframe object.
   */
  updateWireframeVisibility() {
    this.wireframe.visible = this.showWireframe;
  }

  /**
   * Called when user changes mesh visibility. Shows/hides mesh object.
   */
  updateMeshVisibility() {
    this.mesh.visible = this.showMesh;
  }

  /**
   * updates the contents
   * this method is called from the render method of the app
   */
  update() {}
}

export { MyContents };
