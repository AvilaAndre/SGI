import * as THREE from "three";
import { MyApp } from "../MyApp.js";

/**
 * This class contains a 3D cake representation
 */
class MySpring extends THREE.Object3D {
    /**
     *
     * @param {MyApp} app the application object
     */
    constructor(app) {
        super();
        this.app = app;
        this.type = "Group";

        let points = [];
        for (let x = 0; x <= 2.0; x += 0.01) {
            const y = Math.sin(x * 15) * 0.3; // Adjust the multiplier and amplitude as needed
            const z = Math.cos(x * 15) * 0.3; // Adjust the multiplier and amplitude as needed
            points.push(new THREE.Vector3(x, y, z));
        }
        let position = new THREE.Vector3(0, 0, 0);
        //this.drawHull(position, points);

        let curve = new THREE.CatmullRomCurve3(points);
        // sample a number of points on the curve
        let sampledPoints = curve.getPoints( 500 );
        this.curveGeometry = new THREE.TubeGeometry(curve, 2048, 0.01, 128);
                //new THREE.BufferGeometry().setFromPoints( sampledPoints );
        this.lineMaterial = new THREE.LineBasicMaterial({ 
            color: 0x808080, 
            //linewidth: 500 
        } );
        this.lineObj = new THREE.Line( this.curveGeometry, this.lineMaterial );
        this.lineObj.position.set(position.x,position.y,position.z);
        this.add( this.lineObj );
        
        
    
    }

    drawHull(position, points) {
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        let line = new THREE.Line(geometry, this.hullMaterial);
        // set initial position
        line.position.set(position.x, position.y, position.z);
        this.add(line);
    }
}

MySpring.prototype.isGroup = true;

export { MySpring };
