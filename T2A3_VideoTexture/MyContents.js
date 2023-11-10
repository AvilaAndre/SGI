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
        this.boxMesh = null
        this.boxMeshSize = 1.0
        this.boxEnabled = true
        this.lastBoxEnabled = null
        this.boxDisplacement = new THREE.Vector3(0,2,0)

        this.boxTexture = new THREE.TextureLoader().load('textures/feup_entry.jpg');
        this.boxTexture.wrapS = THREE.ClampToEdgeWrapping;
        this.boxTexture.wrapT = THREE.ClampToEdgeWrapping;
        this.boxMaterial = new THREE.MeshLambertMaterial({ map : this.boxTexture });
        
        this.planeMaterial = null;
        // plane related attributes
        this.wrapSmode = "Repeat"
        this.wrapTmode = "Repeat"      
        this.repeatS = 1.0
        this.repeatT = 1.0
        this.rotation = 0.0
        this.createTexture();

        // material
        this.diffusePlaneColor =  "rgb(255,255,255)"
        this.specularPlaneColor = "rgb(0,0,0)"
        this.planeShininess = 0
        
        // relating texture and material: two alternatives with different results
        this.planeMaterial = new THREE.MeshPhongMaterial({ color: this.diffusePlaneColor,
                map : this.planeTexture });

        // spotlight
        this.spotLight = null;
        this.spotangle = 35;
    }

    /**
     * builds the box mesh with material assigned
     */
    buildBox() {    

        // Create a Cube Mesh with basic material
        var box = new THREE.BoxGeometry(  this.boxMeshSize,  this.boxMeshSize,  this.boxMeshSize );
        this.boxMesh = new THREE.Mesh( box, this.boxMaterial );
        this.boxMesh.rotation.x = -Math.PI / 2;
        this.boxMesh.position.y = this.boxDisplacement.y;
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

        this.spotangleRadians = Math.PI * this.spotangle / 180;
        this.spotLight = new THREE.SpotLight(0xffffff, 20, 10, this.spotangleRadians, 0.160, 0);
        this.spotLight.position.set( 2, 7, 1 );
        this.spotLight.target.position.set(1,0,1);
        this.app.scene.add( this.spotLight );
        this.app.scene.add( this.spotLight.target ); 
       
        // const spot_target = new THREE.Object3D();    // NÃO ESTÀ A FUNCIONAR
        // spot_target.set = (-10, 0,-10);
        // this.app.scene.add( spot_target );

        // add a point light helper for the previous point light
        const sphereSize = 0.5;
        this.spotLightHelper = new THREE.SpotLightHelper( this.spotLight);
        this.app.scene.add( this.spotLightHelper );

        // add a point light on top of the model
        /*
        const pointLight = new THREE.PointLight(0xffffff, 5, 0, 0);
        pointLight.position.set( 0, 20, 0 );        
        this.app.scene.add( pointLight );

        // add a point light helper for the previous point light
        const sphereSize = 0.5;
        const pointLightHelper = new THREE.PointLightHelper( pointLight, sphereSize );
        this.app.scene.add( pointLightHelper );
        */

        // add an ambient light
        const ambientLight = new THREE.AmbientLight( 0x555555, 4 );
        this.app.scene.add( ambientLight );

/*
        const light1 = new THREE.DirectionalLight( 0xffffff, 3 );
        light1.position.set( 0, 200, 0 );
        this.app.scene.add( light1 );

        const light2 = new THREE.DirectionalLight( 0xffffff, 1 );
        light2.position.set( -5, 10, -2 );
        this.app.scene.add( light2 );

        const light3 = new THREE.DirectionalLight( 0xffffff, 3 );
        light3.position.set( - 100, - 200, - 100 );
        this.app.scene.add( light3 );
                
        // add light source helpers
        const helper1 = new THREE.DirectionalLightHelper( light1, 5 );
        this.app.scene.add( helper1 ); 

        const helper2 = new THREE.DirectionalLightHelper( light2, 1 );
        this.app.scene.add( helper2 );

        const helper3 = new THREE.DirectionalLightHelper( light3, 5 );
        this.app.scene.add( helper3 );
        */ 

        // Create phong material for the cube

        // var boxMaterial = new THREE.MeshBasicMaterial({ color: "#ffffff"})

        this.buildBox()


        
        // Create a Plane Mesh with basic material
        let planeSizeU = 10;
        let planeSizeV = 7;
        let planeUVRate = planeSizeV / planeSizeU;

        //let textureUVRate = this.texture.width / this.texture.height;   <<--- N~consigo que funcionae...
        let planeTextureUVRate = 3354 / 2385;        
        let planeTextureRepeatU = 2;
        let planeTextureRepeatV = planeTextureRepeatU * planeUVRate * planeTextureUVRate;
        this.planeTexture.repeat.set( planeTextureRepeatU, planeTextureRepeatV );

        var plane = new THREE.PlaneGeometry( planeSizeU, planeSizeV );
        this.planeMesh = new THREE.Mesh( plane, this.planeMaterial );
        this.planeMesh.rotation.x = -Math.PI / 2;
        this.planeMesh.position.y = -0;
        this.app.scene.add( this.planeMesh );
    }
    
    /**
     * updates the diffuse plane color and the material
     * @param {THREE.Color} value 
     */
    updateDiffusePlaneColor(value) {
        this.diffusePlaneColor = value
        this.planeMaterial.color.set(this.diffusePlaneColor)
    }
    /**
     * updates the specular plane color and the material
     * @param {THREE.Color} value 
     */
    updateSpecularPlaneColor(value) {
        this.specularPlaneColor = value
        this.planeMaterial.specular.set(this.specularPlaneColor)
    }
    /**
     * updates the plane shininess and the material
     * @param {number} value 
     */
    updatePlaneShininess(value) {
        this.planeShininess = value
        this.planeMaterial.shininess = this.planeShininess
    }
    
    /**
     * rebuilds the box mesh if required
     * this method is called from the gui interface
     */
    rebuildBox() {
        // remove boxMesh if exists
        if (this.boxMesh !== undefined && this.boxMesh !== null) {  
            this.app.scene.remove(this.boxMesh)
        }
        this.buildBox();
        this.lastBoxEnabled = null
    }
    
    /**
     * updates the box mesh if required
     * this method is called from the render method of the app
     * updates are trigered by boxEnabled property changes
     */
    updateBoxIfRequired() {
        if (this.boxEnabled !== this.lastBoxEnabled) {
            this.lastBoxEnabled = this.boxEnabled
            if (this.boxEnabled) {
                this.app.scene.add(this.boxMesh)
            }
            else {
                this.app.scene.remove(this.boxMesh)
            }
        }
    }

    /**
     * updates the contents
     * this method is called from the render method of the app
     * 
     */
    update() {
        // check if box mesh needs to be updated
        this.updateBoxIfRequired()

        // sets the box mesh position based on the displacement vector
        this.boxMesh.position.x = this.boxDisplacement.x
        this.boxMesh.position.y = this.boxDisplacement.y
        this.boxMesh.position.z = this.boxDisplacement.z
        
    }

    disposeAndCreateTexture() {
        this.planeTexture.dispose();
        this.createTexture();
        this.planeMaterial.map = this.planeTexture;
        this.planeMaterial.needsUpdate = true;  
    }

    createTexture() {
        //this.planeTexture = new THREE.TextureLoader().load('textures/feup_b.jpg');
        const video = document.getElementById( 'some-video' );
        this.planeTexture = new THREE.VideoTexture( video );
        this.planeTexture.colorSpace = THREE.SRGBColorSpace;
    }
    updateWrapSMode() {
        console.log("wrapSmode: " + this.wrapSmode);
        if (this.wrapSmode === 'Clamp to edge')
            this.planeTexture.wrapS = THREE.ClampToEdgeWrapping;
        else
        if (this.wrapSmode === 'Repeat')
            this.planeTexture.wrapS = THREE.RepeatWrapping;        
        else
        if (this.wrapSmode === 'Mirrored repeat') 
            this.planeTexture.wrapS = THREE.MirroredRepeatWrapping;

        if (this.planeMaterial !== null)
            this.planeMaterial.needsUpdate = true;  

    }

    updateWrapTMode() {    
        console.log("wrapTmode: " + this.wrapTmode);
        if (this.wrapTmode === 'Clamp to edge')
            this.planeTexture.wrapT = THREE.ClampToEdgeWrapping;
        else
        if (this.wrapTmode === 'Repeat')
            this.planeTexture.wrapT = THREE.RepeatWrapping;        
        else
        if (this.wrapTmode === 'Mirrored repeat') 
            this.planeTexture.wrapT = THREE.MirroredRepeatWrapping;

        if (this.planeMaterial !== null)
            this.planeMaterial.needsUpdate = true;  
      }

    updateRepeatST() {
        console.log("repeatST: (" + this.repeatS + "," + this.repeatT + ")"	); 
        this.planeTexture.repeat.set(this.repeatS, this.repeatT);
        this.planeTexture.updateMatrix();
    }

    updateSpotAngle() {
        this.spotLight.angle = Math.PI * this.spotangle / 180;
        this.spotLightHelper.update();
    }
    
    updateRotation() {
        this.planeTexture.rotation = Math.PI * this.rotation / 180;

    }

    updateOffset() {
        this.planeTexture.updateMatrix();
    }
}

export { MyContents };