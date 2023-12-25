import * as THREE from 'three'

class MyFirework {

    constructor(app, contents) {
        this.app = app
        this.contents = contents

        this.done     = false 
        this.dest     = [] 
        
        this.vertices = null
        this.colors   = null
        this.geometry = null
        this.points   = null
        
        //Different colors for the fireworks
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
                size: 0.5,
                color: color,
                opacity: 1,
                transparent: true,
                depthTest: false,
            })
        );
        
        this.height = 20
        this.speed = 70
        
        this.velocities = [] // Array of velocity vectors for each particle

        this.reachedDestination = false; // Flag to track reaching the destination

        this.isDescending = false;


        this.completelyExploded = false;

        this.counterOfExplosions = 0;

        this.exploded = false;

        this.launch() 

    }

    /**
     * compute particle launch
     */

    launch() {

        // Random material (color of the particle is chosen randomly)
        let materialIndex = Math.floor(Math.random() * this.materials.length);
        this.material = this.materials[materialIndex];

        let color = new THREE.Color()
        color.setHSL( THREE.MathUtils.randFloat( 0.1, 0.9 ), 1, 0.9 )
        let colors = [ color.r, color.g, color.b ]

        // Random position within the specified square (where the particle is going to go, basically its final destination)
        let x = THREE.MathUtils.randInt(-45, 45);
        let y = THREE.MathUtils.randInt( 20, 45);
        let z = THREE.MathUtils.randInt( -45, 45); 

        let xInc = THREE.MathUtils.randInt( -10, 10);
        let zInc = THREE.MathUtils.randInt( -15, 15);

        this.dest.push(x + xInc, 20, z + zInc);  // Destination is now based on this random starting point
        let vertices = [x, 0, z];  // Starting position of the particle
        
        this.geometry = new THREE.BufferGeometry()
        this.geometry.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array(vertices), 3 ) );
        this.geometry.setAttribute( 'color', new THREE.BufferAttribute( new Float32Array(colors), 3 ) );
        this.points = new THREE.Points( this.geometry, this.material )
        this.points.castShadow = true;
        this.points.receiveShadow = true;

        let initialUpwardVelocity = 30; // Adjust these values as needed
        let ran = THREE.MathUtils.randInt( -5, 5);
        this.velocities.push(new THREE.Vector3(ran, initialUpwardVelocity, ran));

        //Adding all points to the scene
        this.app.scene.add( this.points );  
        // console.log("firework launched");
    }

    /**
     * compute explosion
     * @param {*} vector
     */
    explode(origin, n, rangeBegin, rangeEnd) {

        this.exploded = true;

        this.counterOfExplosions++;
        this.app.scene.remove(this.points);
        this.points.geometry.dispose();
    
        let explosionVertices = [];
        let explosionColors = [];
    
        for (let i = 0; i < n; i++) {
            let theta = Math.random() * 2 * Math.PI;
            let phi = Math.acos(2 * Math.random() - 1);
            let r = THREE.MathUtils.randFloat(rangeBegin, rangeEnd);
    
            let x = r * Math.sin(phi) * Math.cos(theta) + origin.x;
            let y = r * Math.sin(phi) * Math.sin(theta) + origin.y;
            let z = r * Math.cos(phi) + origin.z;
    
            explosionVertices.push(x, y, z);
    
            let color = new THREE.Color();
            color.setHSL(Math.random(), 1, 0.5);
            explosionColors.push(color.r, color.g, color.b);
        }
    
        let explosionGeometry = new THREE.BufferGeometry();
        explosionGeometry.setAttribute('position', new THREE.Float32BufferAttribute(explosionVertices, 3));
        explosionGeometry.setAttribute('color', new THREE.Float32BufferAttribute(explosionColors, 3));

        let explosionMaterial = new THREE.PointsMaterial({
            size: 1,
            color: this.material.color, // use the same color as the original material
            opacity: 0.8, // start with high opacity
            transparent: true,
            depthTest: false,
        });
    
        this.points = new THREE.Points(explosionGeometry, explosionMaterial);
        this.app.scene.add(this.points);


    }
    
    
    /**
     * cleanup
     */
    reset() {
        // console.log("firework reseted")
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



        
        
        // do only if objects exist (if there are points and they all have a geometry)
        if( this.points && this.geometry ){
            // each vertex represents the position of a particle.
            let verticesAtribute = this.geometry.getAttribute( 'position' )
            //array containing the actual coordinate of each particle 
            //the first three elements of the array represent the x, y, and z coordinates of the first particle, 
            //the next three elements represent the coordinates of the second particle, and so on
            let vertices = verticesAtribute.array
            //how many sets of coordinates are
            let count = verticesAtribute.count


            /*console.log("no início this.exploded: ", this.exploded);
            if(this.exploded && this.completelyExploded){
                // console.log("exploded and ready to be cleaned")
                this.reset();
                return;
            }*/

            // console.log("count antes do check: ", count)
            // console.log("this.exploded:", this.exploded)
            if( this.exploded ){ 
                
                // console.log("dentro do if this.material.opacity: ", this.material.opacity);
                this.material.opacity -= 0.02; 
                this.material.needsUpdate = true;
                
                // remove, reset and stop animating 
                if( this.material.opacity <= 0 )
                {
                    this.completelyExploded = true;
                    this.reset(); 
                    this.done = true; 
                    return; 
                }
            }

            // lerp particle positions 
            let j = 0
            // Define gravity and deltaTime outside the update function
            const gravity = new THREE.Vector3(0, -9.81, 0); // Gravity vector pointing downwards
            const deltaTime = 1 / 70; // Assuming 80 updates per second
            //updates each particle's position. It moves the particle a fraction of the distance towards its destination
            for( let i = 0; i < vertices.length; i+=3 ) {
                let index = i / 3;

                // Update the velocity of each particle
                this.velocities[index].addScaledVector(gravity, deltaTime);
    
                // Update the position of each particle based on its velocity
                vertices[i] += this.velocities[index].x * deltaTime;
                vertices[i + 1] += this.velocities[index].y * deltaTime;
                vertices[i + 2] += this.velocities[index].z * deltaTime;

                if (this.velocities[index].y < 0) {
                    // The particle is descending
                    // console.log("Particle is descending");
                    this.isDescending = true;
                }

                // Check if the firework has descended 5 units below after reaching the destination
                if (this.isDescending && vertices[i+1] <= 31){
                    let origin = new THREE.Vector3(vertices[0], vertices[1], vertices[2]);
                    this.explode(origin, 80, 0, 12);
                    this.exploded = true;
                    return;
                }
            }
            //position data has been updated and needs to be re-processed.
            verticesAtribute.needsUpdate = true
            
            // only one particle?
            if (count === 1 && !this.reachedDestination) {
                if (vertices[1] >= this.dest[1]) {
                    this.reachedDestination = true; // Mark that it reached the destination
                }
            }

            
        }
    }
}

export { MyFirework }