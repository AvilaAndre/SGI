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


        let points = [
            new THREE.Vector3( -0.6, 0.0, 0.9 ), // starting point
            new THREE.Vector3( -0.3,  0.6, 0.3 ), 
            new THREE.Vector3( 0.0, 0.0, 0.0 ),
            new THREE.Vector3( 0.3, -0.6, 0.3 ),
            new THREE.Vector3( 0.6,  0.0, 1.2 ), 
            new THREE.Vector3(  0.9, 0.6, 0.3 ),
            new THREE.Vector3( 1.2, 0.0, 0.0 )
        ]
            let position = new THREE.Vector3(0,0,0)
            this.drawHull(position, points);
    
        let curve =
            new THREE.CatmullRomCurve3( points)
        // sample a number of points on the curve
        let sampledPoints = curve.getPoints( 16 );
        this.curveGeometry =
                new THREE.BufferGeometry().setFromPoints( sampledPoints )
        this.lineMaterial = new THREE.LineBasicMaterial( { color: 0xffff00 } )
        this.lineObj = new THREE.Line( this.curveGeometry, this.lineMaterial )
        this.lineObj.position.set(position.x,position.y,position.z)
        this.add( this.lineObj );
        
        
    
    }

    drawHull(position, points) {
       
        const geometry = new THREE.BufferGeometry().setFromPoints( points );
        let line = new THREE.Line( geometry, this.hullMaterial );
        // set initial position
        line.position.set(position.x,position.y,position.z)
        this.add( line );
    }



}

MySpring.prototype.isGroup = true;

export { MySpring };
