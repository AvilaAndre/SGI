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

    this.lodDistances = [0, 10, 20, 30];
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

    //LOD
    const lod = new THREE.LOD();

    const box = new THREE.BoxGeometry(3, 3, 3);
    const box2 = new THREE.BoxGeometry(0.5, 3, 0.5);
    const square = new THREE.PlaneGeometry(0.3, 0.3);
    const rectangle = new THREE.PlaneGeometry(0.3, 1);

    const material1 = new THREE.MeshPhongMaterial({ color: "white" });
    const material2 = new THREE.MeshPhongMaterial({ color: "red" });
    const material3 = new THREE.MeshPhongMaterial({ color: "lightblue" });

    //Level 1 - Walls only
    const walls = new THREE.Mesh(box, material1);
    lod.addLevel(walls, this.lodDistances[3]);

    //Level 2 - Walls, pillars and wall facade (defined as sublod)
    const group = new THREE.Group();
    const walls2 = walls.clone();
    const pillar = new THREE.Mesh(box2, material1);
    const pillar2 = pillar.clone();

    pillar.position.set(-1, 0, 1.5);
    pillar2.position.set(1, 0, 1.5);

    group.add(walls2);
    group.add(pillar);
    group.add(pillar2);

    ////SUBLOD
    const sublod = new THREE.LOD();

    ////Sublevel 1 - Door
    const door = new THREE.Mesh(rectangle, material2);
    door.position.set(0, -1, 1.51);
    sublod.addLevel(door, this.lodDistances[2]);

    ////Sublevel 2 - Door and 2 tall windows
    const subGroup = new THREE.Group();

    const door2 = door.clone();
    const window = new THREE.Mesh(rectangle, material3);
    window.scale.set(1, 1.5, 1);
    const window2 = window.clone();

    window.position.set(-0.4, 0.5, 1.51);
    window2.position.set(0.4, 0.5, 1.51);

    subGroup.add(door2);
    subGroup.add(window);
    subGroup.add(window2);

    sublod.addLevel(subGroup, this.lodDistances[1]);

    ////Sublevel 3 - Door and 6 square windows
    const subGroup2 = new THREE.Group();
    const door3 = door.clone();

    //group of 3 square windows
    let groupWindow = new THREE.Group();
    let smallWindow;
    for (let i = 0; i < 4; i++) {
      smallWindow = new THREE.Mesh(square, material3);
      smallWindow.position.set(0, (i % 4) * 0.4 - 0.1, 1.51);
      groupWindow.add(smallWindow);
    }

    let groupWindow2 = groupWindow.clone(true);
    groupWindow.position.set(-0.4, 0, 0);
    groupWindow2.position.set(0.4, 0, 0);

    subGroup2.add(door3);
    subGroup2.add(groupWindow);
    subGroup2.add(groupWindow2);

    sublod.addLevel(subGroup2, this.lodDistances[0]);

    //adding sublod to group
    group.add(sublod);
    lod.addLevel(group, this.lodDistances[2]);

    //Adding main LOD to the scene
    lod.rotation.set(0, 45, 0);
    this.app.scene.add(lod);
  }

  /**
   * updates the contents
   * this method is called from the render method of the app
   *
   */
  update() {}
}

export { MyContents };
