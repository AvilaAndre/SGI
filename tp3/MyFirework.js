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
        this.explosionTime = 0;
        
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
        
        this.velocities = [] // Array of velocity vectors for each particle


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

        let initialUpwardVelocity = 30; //Initial velocity that the particle is launched with
        let ran = THREE.MathUtils.randInt( -5, 5);
        this.velocities.push(new THREE.Vector3(ran, initialUpwardVelocity, ran));

        //Adding all points to the scene
        this.app.scene.add( this.points );  
    }

    /**
     * compute explosion
     * @param {*} vector
     */
    explode(origin, n, rangeBegin, rangeEnd) {

        this.exploded = true;
        this.counterOfExplosions++;
        this.explosionTime = 0;
        

        this.app.scene.remove(this.points);
        this.points.geometry.dispose();
    

        let vertices = [];
        this.dest = [];
        let angleStep = (Math.PI * 2) / n;

        //The points should be in a circle around the origin, but have a random trajectory to be like real-life fireworks
        for (let i = 0; i < n; i++) {
            vertices.push(origin[0], origin[1], origin[2]);
            let angle = angleStep * i;
            let radius = THREE.MathUtils.randFloat(rangeBegin, rangeEnd);
            let x = origin[0] + radius * Math.cos(angle);
            let y = origin[1] + radius * Math.sin(angle);
            let z = origin[2];
    
            this.dest.push(x, y, z);

        }

        
        let color = new THREE.Color()
        color.setHSL( THREE.MathUtils.randFloat( 0.1, 0.9 ), 1, 0.9 )
        let colors = [ color.r, color.g, color.b ]
        this.geometry = new THREE.BufferGeometry()
        this.geometry.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array(vertices), 3 ) );
        this.geometry.setAttribute( 'color', new THREE.BufferAttribute( new Float32Array(colors), 3 ) );
        this.points = new THREE.Points( this.geometry, this.material )
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
    update(delta) {

        

        if( this.points && this.geometry ){

            let verticesAtribute = this.geometry.getAttribute( 'position' )
            let vertices = verticesAtribute.array
            let count = verticesAtribute.count

            // only one particle?
            if (count === 1 && !this.exploded) {

        
                const gravity = new THREE.Vector3(0, -9.81, 0); 
                
                verticesAtribute.needsUpdate = true
                for( let i = 0; i < vertices.length; i+=3 ) {
                    let index = i / 3;
    
                    // Update the velocity of each particle
                    this.velocities[index].addScaledVector(gravity, delta);
        
                    // Update the position of each particle based on its velocity
                    vertices[i] += this.velocities[index].x * delta;
                    vertices[i + 1] += this.velocities[index].y * delta;
                    vertices[i + 2] += this.velocities[index].z * delta;
    
                    if (this.velocities[index].y < 0) {
                        // The particle is descending
                        this.isDescending = true;
                    }
    
                    // Check if the firework has descended 5 units below after reaching the destination, to give the effect of gravity
                    if (this.isDescending && vertices[i+1] <= 31) {
                        this.explode(vertices, 80, 0, 12);
                        this.exploded = true;
                        return;
                    }
                }
            }

            if (this.exploded) {
                // Increase explosion time and calculate progress
                this.explosionTime += delta;
                this.progress = this.explosionTime / 10;
        
                // Update particle positions towards their destinations
                let positions = this.geometry.getAttribute('position');
                let vertices = positions.array;
        
                for (let i = 0; i < vertices.length; i += 3) {
                    // Use lerp to move particles towards their destinations
                    vertices[i] = THREE.MathUtils.lerp(vertices[i], this.dest[i], this.progress);
                    vertices[i + 1] = THREE.MathUtils.lerp(vertices[i + 1], this.dest[i + 1], this.progress);
                    vertices[i + 2] = THREE.MathUtils.lerp(vertices[i + 2], this.dest[i + 2], this.progress);
                }
                verticesAtribute.needsUpdate = true
        
                // Fade out the explosion particles
                let material = this.points.material;
                material.opacity -= 0.002; 
                material.needsUpdate = true;
        

                if (this.progress >= 1) {
                    this.completelyExploded = true;
                    this.reset();
                    this.done = true;
                    return;
                }
            }


            
            
        }
    }
}

export { MyFirework }