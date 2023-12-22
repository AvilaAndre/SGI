import * as THREE from 'three'

class MyFirework {

    constructor(app, scene) {
        this.app = app
        this.scene = scene

        this.done     = false 
        this.dest     = [] 
        
        this.vertices = null
        this.colors   = null
        this.geometry = null
        this.points   = null
        
        this.materialColors = [
            new THREE.Color(0x0000FF), // Blue
            new THREE.Color(0xFF0000), // Red
            new THREE.Color(0x00FF00), // Green
            new THREE.Color(0xFFFF00), // Yellow
            new THREE.Color(0xFFA500)  // Orange
        ];


        // Create an array to store materials
        this.materials = this.materialColors.map(color => 
            new THREE.PointsMaterial({
                size: 0.1,
                color: color,
                opacity: 1,
                transparent: true,
                depthTest: false,
            })
        );
        
        this.height = 20
        this.speed = 60

        this.launch() 

    }

    /**
     * compute particle launch
     */

    launch() {

        let materialIndex = Math.floor(Math.random() * this.materials.length);
        this.material = this.materials[materialIndex];

        let color = new THREE.Color()
        color.setHSL( THREE.MathUtils.randFloat( 0.1, 0.9 ), 1, 0.9 )
        let colors = [ color.r, color.g, color.b ]

        let x = THREE.MathUtils.randFloat( -5, 5 ) 
        let y = THREE.MathUtils.randFloat( this.height * 0.9, this.height * 1.1)
        let z = THREE.MathUtils.randFloat( -5, 5 ) 
        this.dest.push( x, y, z ) 
        let vertices = [0,0,0]
        
        this.geometry = new THREE.BufferGeometry()
        this.geometry.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array(vertices), 3 ) );
        this.geometry.setAttribute( 'color', new THREE.BufferAttribute( new Float32Array(colors), 3 ) );
        this.points = new THREE.Points( this.geometry, this.material )
        this.points.castShadow = true;
        this.points.receiveShadow = true;
        this.app.scene.add( this.points )  
        console.log("firework launched")
    }

    /**
     * compute explosion
     * @param {*} vector 
     */
    explode(origin, n, rangeBegin, rangeEnd) {

        console.log("removing point")
        this.app.scene.remove( this.points )
        this.points.geometry.dispose()

        // Create new vertices and colors arrays for the explosion particles
        let vertices = [];
        let colors = [];

        // Create explosion particles
        for (let i = 0; i < n; i++) {
            // Generate random position within a sphere
            let theta = Math.random() * 2 * Math.PI;
            let phi = Math.acos(2 * Math.random() - 1);
            let r = THREE.MathUtils.randFloat(rangeBegin, rangeEnd);

            let x = r * Math.sin(phi) * Math.cos(theta) + origin.x;
            let y = r * Math.sin(phi) * Math.sin(theta) + origin.y;
            let z = r * Math.cos(phi) + origin.z;

            vertices.push(x, y, z);

            // Assign random colors (or you can use a fixed color scheme)
            let color = new THREE.Color();
            color.setHSL(Math.random(), 1, 0.5);
            colors.push(color.r, color.g, color.b);
        }

        // Create new geometry and set vertices and colors
        let newGeometry = new THREE.BufferGeometry();
        newGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        newGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        // Create new points for the explosion
        this.points = new THREE.Points(newGeometry, this.material);
        console.log("adding point")
        this.app.scene.add(this.points);
       
        

        
    }
    
    /**
     * cleanup
     */
    reset() {
        console.log("firework reseted")
        this.app.scene.remove( this.points )  
        this.dest     = [] 
        this.vertices = null
        this.colors   = null 
        this.geometry = null
        this.points   = null
    }

    /**
     * update firework
     * @returns 
     */
    update() {
        
        // do only if objects exist
        if( this.points && this.geometry )
        {
            let verticesAtribute = this.geometry.getAttribute( 'position' )
            let vertices = verticesAtribute.array
            let count = verticesAtribute.count

            // lerp particle positions 
            let j = 0
            for( let i = 0; i < vertices.length; i+=3 ) {
                vertices[i  ] += ( this.dest[i  ] - vertices[i  ] ) / this.speed
                vertices[i+1] += ( this.dest[i+1] - vertices[i+1] ) / this.speed
                vertices[i+2] += ( this.dest[i+2] - vertices[i+2] ) / this.speed
            }
            verticesAtribute.needsUpdate = true
            
            // only one particle?
            if( count === 1 ) {
                //is YY coordinate higher close to destination YY? 
                if( Math.ceil( vertices[1] ) > ( this.dest[1] * 0.95 ) ) {
                    // add n particles departing from the location at (vertices[0], vertices[1], vertices[2])
                    this.explode(vertices, 80, this.height * 0.05, this.height * 0.8) 
                    return 
                }
            }
            
            // are there a lot of particles (aka already exploded)?
            if( count > 1 ) {
                // fade out exploded particles 
                this.material.opacity -= 0.015 
                this.material.needsUpdate = true
            }
            
            // remove, reset and stop animating 
            if( this.material.opacity <= 0 )
            {
                this.reset() 
                this.done = true 
                return 
            }
        }
    }
}

export { MyFirework }