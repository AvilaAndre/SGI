import * as THREE from "three";
import { MyAxis } from "./MyAxis.js";
import { MyTriangle } from "./MyTriangle.js";

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

    const texture = new THREE.TextureLoader().load('./textures/uv_grid_opengl.jpg' ); 
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    const material = new THREE.MeshBasicMaterial( { map:texture } );

    //Triangle 1
    const triangleGeo1 = new MyTriangle(0, 0, 0, 1, 0, 0, 0, 1, 0);
    const mesh1 = new THREE.Mesh(triangleGeo1, material);
    mesh1.scale.set(3,3,1);
    mesh1.position.set(-3, 0,0);

    this.app.scene.add(mesh1);

    //Triangle 2
    const triangleGeo2 = new MyTriangle(0, 0, 0, 3, 0, 0, 0, 3, 0);
    const mesh2 = new THREE.Mesh(triangleGeo2, material);
    mesh2.position.set(0, 0,0);

    this.app.scene.add(mesh2);

    //Triangle 3
    const triangleGeo3 = new MyTriangle(4, 0, 0, 8, 2,0, 3,5, -4 );
    const mesh3 = new THREE.Mesh( triangleGeo3, material );

    this.app.scene.add(mesh3);
  }

  /**
   * updates the contents
   * this method is called from the render method of the app
   *
   */
  update() {}
}

export { MyContents };
