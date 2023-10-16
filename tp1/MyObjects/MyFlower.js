import * as THREE from "three";
import { MyApp } from "../MyApp.js";

/**
 * This class contains a Flower representation
 */
class MyFlower extends THREE.Object3D {
    /**
     *
     * @param {MyApp} app the application object
     */
    constructor(app) {
        super();
        this.app = app;
        this.type = "Group";

        let points = [
            new THREE.Vector3(0, 0.0, 0.0), // starting point

            new THREE.Vector3(-0.1, 0.3, 0.0), // control point
            new THREE.Vector3(0.25, 0.45, 0.25), // control point

            new THREE.Vector3(0.0, 0.6, 0.0), // ending point
        ];

        let position = new THREE.Vector3(0, 0, 0);

        let curve = new THREE.CubicBezierCurve3(...points);

        this.curveGeometry = new THREE.TubeGeometry(curve, 1024, 0.01);

        const flowerMaterial = new THREE.MeshPhongMaterial({
            color: "#ff5349",
            side: 2,
        });
        const flowerPetalMaterial = new THREE.MeshPhongMaterial({
            color: "#FFFFFF",
            side: 2,
        });

        const stalkMaterial = new THREE.MeshPhongMaterial({
            color: "#00FF00",
        });

        this.lineObj = new THREE.Line(this.curveGeometry, stalkMaterial);

        this.lineObj.position.set(position.x, position.y, position.z);

        this.add(this.lineObj);

        const flowerGeo = new THREE.CircleGeometry(0.06);

        const flowerPetalGeo = new THREE.CircleGeometry(0.2, 5);

        const flowerMesh = new THREE.Mesh(flowerGeo, flowerMaterial);
        const flowerPetalMesh = new THREE.Mesh(
            flowerPetalGeo,
            flowerPetalMaterial
        );

        flowerMesh.position.set(0.0, 0.615, 0.0);
        flowerMesh.rotation.x = Math.PI / 3;
        flowerMesh.rotation.y = Math.PI / 3;
        flowerPetalMesh.position.set(0.0, 0.61, 0.0);
        flowerPetalMesh.rotation.x = Math.PI / 3;
        flowerPetalMesh.rotation.y = Math.PI / 3;

        flowerMesh.castShadow = true;
        flowerPetalMesh.castShadow = true;
        this.lineObj.castShadow = true;

        this.add(flowerMesh);
        this.add(flowerPetalMesh);
    }
}

MyFlower.prototype.isGroup = true;

export { MyFlower };
