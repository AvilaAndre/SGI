import * as THREE from 'three';
import { TeapotGeometry } from 'three/addons/geometries/TeapotGeometry.js';

class MyTeapot {	

	constructor(app) {
		this.app = app
		this.mesh = null
		this.initTeapot()
	}

	initTeapot() {
		if ( this.mesh !== null ) {
			this.mesh.geometry.dispose();
			this.app.scene.remove( this.mesh);
		}

		this.geometry = new TeapotGeometry( 1,
			15, // tessellation,
			true,
			true,
			true,
			true,
			! true );

		this.material = new THREE.MeshPhongMaterial( { side: THREE.DoubleSide } ); 
		this.mesh = new THREE.Mesh( this.geometry, this.material );
		this.mesh.position.set(0,0,0)
		this.mesh.scale.set(5,5,5)
		this.setFillMode() 
	}

	setFillMode() { 
		this.material.wireframe = false
		this.material.needsUpdate = true
	}

	setLineMode() { 
		this.material.wireframe = true
		this.material.needsUpdate = true
	}

	setWireframe(value) {
		if (value) {
			this.setLineMode()
		} else {
			this.setFillMode()
		}
	}
}


export { MyTeapot }