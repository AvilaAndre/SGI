import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { MyTeapot } from './MyTeapot.js';
import { MyPlane } from './MyPlane.js';
import { MyShader } from './MyShader.js';

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

		// additional texture will have to be bound to texture unit 1 later, 
        // when using the shader, with "this.texture2.bind(1);"
    
        // shader code panels references
		this.shadersDiv = document.getElementById("shaders");
        this.shaderDescription = document.getElementById("shader-description");
		this.vShaderDiv = document.getElementById("vshader");
		this.fShaderDiv = document.getElementById("fshader");
        this.selectedShaderIndex = 0;

        // Object interface variables
        this.selectedObject = null;
        this.selectedObjectIndex = null;
		this.oldSelectedObjectIndex = null;
		this.objectList = {
			'Teapot': 0,
			'Plane': 1
		}

        // initial configuration of interface
		this.showShaderCode = false;
		this.scaleFactor = -0.0;
        this.blendFactor = 0.5;
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

        // update camera
        let camera = this.app.activeCamera
        camera.position.set(10, 10, 10)
        camera.lookAt(new THREE.Vector3(0,0,0))

        // add a point light on top of the model
        const pointLight1 = new THREE.PointLight( 0xffaaaa, 20);
        pointLight1.position.set( -5, 10, 5 )
        this.app.scene.add( pointLight1 );

        // add a point light helper for the previous point light
        const sphereSize = 0.5;
        const pointLightHelper = new THREE.PointLightHelper( pointLight1, sphereSize );
        this.app.scene.add( pointLightHelper );

        // add a directional light
        const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
        directionalLight.position.set( 10,10,-10 );
        this.app.scene.add( directionalLight );

        // add a directional light helper for the previous directional light
        const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight,3);
        this.app.scene.add( directionalLightHelper );

        // add an ambient light
        const ambientLight = new THREE.AmbientLight( 0x030303 );
        this.app.scene.add( ambientLight );
    
        // the available objects
        this.objects = [
			new MyTeapot(this.app),
			new MyPlane(this.app, 10,10, 50)
		]
        this.selectedObjectIndex = 1

        // Materials and textures initialization
        const texture1 = new THREE.TextureLoader().load('textures/texture.jpg' )
        texture1.wrapS = THREE.RepeatWrapping;
        texture1.wrapT = THREE.RepeatWrapping;
        
        // load second texture
        const texture2 = new THREE.TextureLoader().load('textures/waterMap.jpg' )

        // shaders initialization
        this.shaders = [
			new MyShader(this.app, "Flat Shading", "Uses a constant  color to shade the object",
                "shaders/flat.vert", "shaders/flat.frag", { 
                }),
            new MyShader(this.app, "Color mix shading", "Uses two flat colors and color mix to shade the object",
                "shaders/colormix.vert", "shaders/colormix.frag", {
                    colorB: {type: 'vec3', value: new THREE.Color(1,0,0)},
                    colorA: {type: 'vec3', value: new THREE.Color(0,1,0)}
            }),
            new MyShader(this.app, "Normal color shading", "uses vertex normal vector as fragment color", 
                "shaders/normal.vert", "shaders/normal.frag", {            
            }),
            new MyShader(this.app, "Scaled normal color shading", "uses vertex normal vector as color. Vertex position is discplaced by a user-defined scale factor ", 
                "shaders/scaled-normal.vert", "shaders/normal.frag", {
                    normScale: {type: 'f', value: 0.1 },
                    displacement: {type: 'f', value: 0.0 },
                    normalizationFactor: {type: 'f', value: 1 },
            }),
            new MyShader(this.app, "Conditional color shading", "Shades differently depending on vertex position", 
                "shaders/conditional-if.vert", "shaders/conditional-if.frag", {
                normScale: {type: 'f', value: 0.1 },
                displacement: {type: 'f', value: 0.0 },
                normalizationFactor: {type: 'f', value: 1 },
            }),
			new MyShader(this.app, 'Simple texture', "load a texture", "shaders/texture1.vert", "shaders/texture1.frag", {
                uSampler: {type: 'sampler2D', value: texture1 },
                normScale: {type: 'f', value: 0.1 },
                displacement: {type: 'f', value: 0.0 },
                normalizationFactor: {type: 'f', value: 1 },
            }),
            new MyShader(this.app, 'Blend textures', "load two texture and blend them   ", "shaders/texture1.vert", "shaders/texture2.frag", {
                uSampler1: {type: 'sampler2D', value: texture1 },
                uSampler2: {type: 'sampler2D', value: texture2 },
                normScale: {type: 'f', value: 0.1 },
                displacement: {type: 'f', value: 0.0 },
                normalizationFactor: {type: 'f', value: 1 },
                blendScale: {type: 'f', value: 0.5 },
            }),
            new MyShader(this.app, 'Blend textures animated', "load two texture and blend them. Displace them by time   ", "shaders/texture1.vert", "shaders/texture3anim.frag", {
                uSampler1: {type: 'sampler2D', value: texture1 },
                uSampler2: {type: 'sampler2D', value: texture2 },
                normScale: {type: 'f', value: 0.1 },
                displacement: {type: 'f', value: 0.0 },
                normalizationFactor: {type: 'f', value: 1 },
                blendScale: {type: 'f', value: 0.5 },
                timeFactor: {type: 'f', value: 0.0 },
                
            })
			
		];

        this.waitForShaders()
    }
   
    waitForShaders() {
        for (let i=0; i<this.shaders.length; i++) {
            if (this.shaders[i].ready === false) {
                setTimeout(this.waitForShaders.bind(this), 100)
                return;
            }
        }
         // set initial object
         this.onSelectedObjectChanged()
        
         // set initial shader
         this.onSelectedShaderChanged(this.selectedShaderIndex);
 
         // set initial shader details visualization
         this.onShaderCodeVizChanged(this.showShaderCode);
    }

    fromShaderList() {
        let list = {}
        for (var i=0; i<this.shaders.length; i++) { 
            list[this.shaders[i].name]=i
        }
        return list;
    }
    // Interface event handlers

	// Show/hide shader code
	onShaderCodeVizChanged(v) {
		if (v)
			this.shadersDiv.style.display = "block";
		else
			this.shadersDiv.style.display = "none";
	}

	// Called when selected shader changes
	onSelectedShaderChanged(index) {
        this.selectedShaderIndex = index
        this.currentShader = this.shaders[this.selectedShaderIndex]
        this.setCurrentShader(this.currentShader)
    }  

    setCurrentShader(shader) {
        if (shader === null || shader === undefined) {
            return
        }
        console.log("Selected shader '" + shader.name + "'")

        if (this.selectedObject !== null) {
            this.selectedObject.mesh.material = shader.material
            this.selectedObject.mesh.material.needsUpdate = true
        }
        // update shader code
        this.shaderDescription.innerHTML = "<xmp>" + shader.name + ": "+ shader.description + "</xmp>";
        this.vShaderDiv.innerHTML = "<xmp>" + shader.vertexShader + "</xmp>";
        this.fShaderDiv.innerHTML = "<xmp>" + shader.fragmentShader + "</xmp>";

         this.onScaleFactorChanged(this.scaleFactor)
     }

    // called when a new object is selected
	onSelectedObjectChanged() {

        if (this.selectedObjectIndex !== this.oldSelectedObjectIndex) {
            if (this.oldSelectedObjectIndex !== null) {
                this.app.scene.remove(this.objects[this.oldSelectedObjectIndex].mesh)
                this.selectedObject = null
            }
        
            if (this.selectedObjectIndex == 0) {
                this.showTeapot()
                this.setCurrentShader(this.currentShader)
               
            }
            else
            if (this.selectedObjectIndex == 1) {
                this.showPlane()
                this.setCurrentShader(this.currentShader)
            }
            this.oldSelectedObjectIndex = this.selectedObjectIndex
        }
	}

	onScaleFactorChanged(v) {
        if (this.currentShader !== undefined && this.currentShader !== null) {
            this.currentShader.updateUniformsValue("normScale", this.scaleFactor );
        }
        
	}

    onBlendFactorChanged(v) {
        if (this.currentShader !== undefined && this.currentShader !== null) {
            this.currentShader.updateUniformsValue("blendScale", this.blendFactor );
        }
	}

    showTeapot() {
        this.selectedObject = this.objects[0]
        this.app.scene.add(this.selectedObject.mesh)
    }

    showPlane() {       
        this.selectedObject = this.objects[1]
        this.app.scene.add(this.selectedObject.mesh)
    }
    /**
     * updates the contents
     * this method is called from the render method of the app
     * 
     */
    update() {
        let t = this.app.clock.getElapsedTime()
        if (this.currentShader !== undefined && this.currentShader !== null) {
            if (this.currentShader.hasUniform("timeFactor")) {
                this.currentShader.updateUniformsValue("timeFactor", t  );
            }
        }
    }
}

export { MyContents };