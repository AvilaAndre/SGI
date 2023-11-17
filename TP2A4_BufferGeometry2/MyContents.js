import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';

/**
 *  This class contains the contents of out application
 */
class MyContents  {

    /**
       constructs the object
       @param {MyApp} app The application object
    */ 
    constructor(app) {
        this.app = app
        this.axis = null

        // box related attributes
        // this.boxMesh = null
        // this.boxMeshSize = 1.0
        // this.boxEnabled = true
        // this.lastBoxEnabled = null
        // this.boxDisplacement = new THREE.Vector3(0,2,0)

        // plane related attributes
        this.diffusePlaneColor = "#00ffff"
        this.specularPlaneColor = "#777777"
        this.planeShininess = 30
        this.planeMaterial = new THREE.MeshPhongMaterial({ color: this.diffusePlaneColor, 
            specular: this.diffusePlaneColor, emissive: "#000000", shininess: this.planeShininess })

        this.triangles = 1000
        this.boxSize = 500
        this.triangleSize = 8
        this.mapSize = 4096
        this.cubeMesh = null
    } 

    /**
     * initializes the contents
     */
    init() {
       
        // create once 
        if (this.axis === null) {
            // create and attach the axis to the scene
            this.axis = new MyAxis(this)
            this.app.scene.add(this.axis)
        }
   
        // creates a directional light
        const light1 = new THREE.DirectionalLight( 0xffffff, 1.5 );
        light1.position.set( 0, 25, 0 );
        light1.castShadow = true;
        light1.shadow.mapSize.width = this.mapSize; 
        light1.shadow.mapSize.height = this.mapSize; 
        light1.shadow.camera.near = 0.5; 
        light1.shadow.camera.far = 25; 
        this.app.scene.add( light1 );

        // creates a helper for the light
        const helper1 = new THREE.DirectionalLightHelper( light1, 5 );
        this.app.scene.add( helper1 );

        // creates a point light
        const light2 = new THREE.PointLight( 0xffffff, 1.5, 0, 0 );
        light2.position.set( 15, 15, 15 );
        light2.castShadow = true;
        light2.shadow.mapSize.width = this.mapSize; 
        light2.shadow.mapSize.height = this.mapSize; 
        light2.shadow.camera.near = 0.5; 
        light2.shadow.camera.far = 50; 
        this.app.scene.add( light2 );

        // creates a helper for the light
        const helper2 = new THREE.PointLightHelper( light2, 1 );
        this.app.scene.add( helper2 );

        // creates a cub with a considerable number of triangles
        this.buildCube()

        // creates a floor
        this.buildFloorBox()

        // creates a floating box
        this.buildFloatingBox();

    }
    
    /**
     * builds a floating box
     */

    buildFloatingBox() {

        let box = new THREE.BoxGeometry(1,1,1);
        let mesh = new THREE.Mesh( box, new THREE.MeshStandardMaterial({ color: "#ffffff" }) );
        mesh.position.set(0,5,0)

        // cast and receives shadows
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        this.app.scene.add( mesh );
    }

    /**
     * builds a floor box
     */
    buildFloorBox() {    
        // Create a cube Mesh with basic material
        let box = new THREE.BoxGeometry( 30, 0.01, 30 );
        let mesh = new THREE.Mesh( box, new THREE.MeshStandardMaterial({ color: "#ffffff" }) );
        mesh.rotation.x = 0;
        mesh.position.y = 0
        // cast and receives shadows
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        this.app.scene.add( mesh );
    }

    /**
     * rebuilds the cube
     */
    rebuildCube() {
        if (this.cubeMesh !== null) {
            this.app.scene.remove(this.cubeMesh)
        }
        this.buildCube()
    }

    /**
     *  builds a cube with a considerable number of triangles
     *  inspired in threejs.org examples
     */

    buildCube() {

        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const normals = [];
        const colors = [];

        const color = new THREE.Color();
        const n = this.boxSize, n2 = n / 2;	// triangles spread in the cube
        const d = this.triangleSize, d2 = d / 2;	// individual triangle size

        const pA = new THREE.Vector3();
        const pB = new THREE.Vector3();
        const pC = new THREE.Vector3();

        const cb = new THREE.Vector3();
        const ab = new THREE.Vector3();

        for ( let i = 0; i < this.triangles; i ++ ) {

            // positions
            const x = Math.random() * n - n2;
            const y = Math.random() * n - n2;
            const z = Math.random() * n - n2;

            const ax = x + Math.random() * d - d2;
            const ay = y + Math.random() * d - d2;
            const az = z + Math.random() * d - d2;

            const bx = x + Math.random() * d - d2;
            const by = y + Math.random() * d - d2;
            const bz = z + Math.random() * d - d2;

            const cx = x + Math.random() * d - d2;
            const cy = y + Math.random() * d - d2;
            const cz = z + Math.random() * d - d2;

            positions.push( ax, ay, az );
            positions.push( bx, by, bz );
            positions.push( cx, cy, cz );

            // flat face normals
            pA.set( ax, ay, az );
            pB.set( bx, by, bz );
            pC.set( cx, cy, cz );

            cb.subVectors( pC, pB );
            ab.subVectors( pA, pB );
            cb.cross( ab );

            cb.normalize();

            const nx = cb.x;
            const ny = cb.y;
            const nz = cb.z;

            normals.push( nx, ny, nz );
            normals.push( nx, ny, nz );
            normals.push( nx, ny, nz );

            // colors
            const vx = ( x / n ) + 0.5;
            const vy = ( y / n ) + 0.5;
            const vz = ( z / n ) + 0.5;

            color.setRGB( vx, vy, vz );

            const alpha = Math.random();

            colors.push( color.r, color.g, color.b, alpha );
            colors.push( color.r, color.g, color.b, alpha );
            colors.push( color.r, color.g, color.b, alpha );

        }

        function disposeArray() {
            this.array = null;
        }

        geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ).onUpload( disposeArray ) );
        geometry.setAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ).onUpload( disposeArray ) );
        geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 4 ).onUpload( disposeArray ) );

        geometry.computeBoundingSphere();

        const material = new THREE.MeshStandardMaterial( {
            color: 0xffffff, side: THREE.DoubleSide, vertexColors: true, transparent: false
        } );

        let mesh = new THREE.Mesh( geometry, material );
        // cast and receives shadows
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // set position the cube    
        mesh.position.set(0,5,0)

        // cube is huge. make it smaller
        mesh.scale.set(0.015,0.015,0.015)

        this.app.scene.add( mesh );

        // keep it for rebuild
        this.cubeMesh = mesh;
    }

    /**
     * TODO: updates the shadow map
     */
    updateShadowMap() {
      
    }
    /**
     * updates the contents
     * this method is called from the render method of the app
     * 
     */
    update() {
        
    }

}

export { MyContents };