import * as THREE from "three";
import { MyApp } from "../MyApp.js";

/**
 * This class contains a 3D table representation
 */
class MyTable extends THREE.Object3D {
    /**
     *
     * @param {MyApp} app the application object
     * @param {number} width the width of the table
     * @param {number} depth the depth of the table
     */
    constructor(app, width, depth) {
        super();
        this.app = app;
        this.type = "Group";
        this.width = width || 3;
        this.depth = depth || 2;

        this.tableMaterial = new THREE.MeshPhongMaterial({
            color: "#964B00",
            specular: "#6E260E",
            emissive: "#000000",
            shininess: 10,
        });

        let tableTop = new THREE.BoxGeometry(this.width, 0.2, this.depth);
        this.tableTopMesh = new THREE.Mesh(tableTop, this.tableMaterial);
        this.tableTopMesh.position.y = 0.9;
        this.add(this.tableTopMesh);

        let legX = this.width / 2 - 0.2;
        let legY = this.depth / 2 - 0.2;

        let tableLeg = new THREE.CylinderGeometry(0.1, 0.1, 0.8, 10, 2);

        for (let index = 0; index < 4; index++) {
            let tableLegMesh = new THREE.Mesh(tableLeg, this.tableMaterial);
            tableLegMesh.position.copy(
                new THREE.Vector3(
                    (index > 1 ? 1 : -1) * legX,
                    0.4,
                    (index % 2 == 0 ? 1 : -1) * legY
                )
            );
            this.add(tableLegMesh);
        }
    }
}

MyTable.prototype.isGroup = true;

export { MyTable };