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
                size: 1,
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

        this.animationDuration = 2.0; // Duration of the explosion in seconds
        this.explodeTime = 0; // Time since the explosion started
        this.explosionDestinations = []; // Destinations for each particle 

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
        this.dest = []; // Clear the previous destinations
        
        let explosionVertices = [];
        let explosionColors = [];
        let angleStep = (Math.PI * 2) / n; // Full circle divided by the number of particles

        for (let i = 0; i < n; i++) {
            let angle = angleStep * i;
            let x = origin.x + (rangeEnd/2) * Math.cos(angle);
            let y = origin.y + (rangeEnd/2) * Math.sin(angle);
            let z = origin.z; // Z remains the same for a flat circle
            
            this.dest.push(new THREE.Vector3(x, y, z)); // Add the destination for each particle
            
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
    update(deltaTime) {

        
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

            // only one particle?
            if (count === 1 && !this.reachedDestination) {
                if (vertices[1] >= this.dest[1]) {
                    this.reachedDestination = true; // Mark that it reached the destination
                    return;
                }
            }

            if( this.exploded ){ 
                

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

            
        let positions = this.geometry.getAttribute('position');
        let vertices2 = positions.array;

        // Gravity will affect the particles each frame
        const gravity = new THREE.Vector3(0, -9.81, 0);

        // Loop through each particle vertex
        for (let i = 0; i < vertices2.length; i += 3) {
            let index = i / 3;
            let particleDestination = this.dest[index];

            // If the particle has exploded, animate towards the destination
            if (this.exploded) {
                    // Calculate progress of the explosion animation
                    let progress = Math.min(this.explodeTime / this.animationDuration, 1);
                    let currentPos = new THREE.Vector3(vertices2[i], vertices2[i + 1], vertices2[i + 2]);

                    // Interpolate between the current position and the final destination
                    currentPos.lerp(particleDestination, progress);
                    
                    // Update the vertices in the array
                    vertices2[i] = currentPos.x;
                    vertices2[i + 1] = currentPos.y;
                    vertices2[i + 2] = currentPos.z;

                    // If animation progress is 100%, mark as completely exploded
                    if (progress === 1) {
                        this.completelyExploded = true;
                    }
                } else {
                    // If not exploded yet, particles should go up
                    this.velocities[index].addScaledVector(gravity, deltaTime);
                    vertices2[i] += this.velocities[index].x * deltaTime;
                    vertices2[i + 1] += this.velocities[index].y * deltaTime;
                    vertices2[i + 2] += this.velocities[index].z * deltaTime;
                    
                    // Check if it's time to explode (e.g., based on some condition like reaching certain height)
                    if (this.isDescending && vertices2[i+1] <= 31) {
                        this.explode(origin, 80, 0, 12);
                    }
                    
                }
            }

            // Update the explosion time and geometry
            this.explodeTime += deltaTime;
            positions.needsUpdate = true;
        }   
    }
}

export { MyFirework }