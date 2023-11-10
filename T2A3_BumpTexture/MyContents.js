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

        /* Textures from: https://www.shadedrelief.com/natural3/pages/textures.html */


        this.texture = new THREE.TextureLoader().load('textures/4_no_ice_clouds_mts_8k.jpg')
        this.texture.generateMipmaps = false
        this.texture.repeat.set(1, 1)
        this.texture.wrapS = this.texture.wrapT = THREE.RepeatWrapping
        this.showTexture = true

        this.bumpTexture = new THREE.TextureLoader().load('textures/elev_bump_16k.jpg')
        this.bumpTexture.generateMipmaps = false
        this.bumpTexture.repeat.set(1, 1)
        this.bumpTexture.wrapS = this.texture.wrapT = THREE.RepeatWrapping
        this.showBumpTexture = true

        this.specularTexture = new THREE.TextureLoader().load('textures/spec.jpg')
        this.specularTexture.generateMipmaps = false
        this.specularTexture.repeat.set(1, 1)
        this.specularTexture.wrapS = this.texture.wrapT = THREE.RepeatWrapping

        // this.skyTexture = new THREE.TextureLoader().load('textures/storm_clouds_8k.jpg')
     
        this.diffuseColor = new THREE.Color(0xffffff)

        this.specularColor = new THREE.Color(0x888888)

        this.shininess = 30

        this.scale = 1.0

        this.bumpScale = 0.03

        this.earthMaterial = new THREE.MeshPhongMaterial({
            color: this.diffuseColor,
            map: this.texture,
            bumpMap: this.bumpTexture,
            bumpScale:   this.bumpScale * this.scale,
            specular: this.specularColor,
            // specularMap: this.specularTexture,
            shininess: this.shininess,      
        })

        this.earthMesh = null

        this.group = null

        this.init()
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

        this.app.activeCamera.position.set(1.031, 0.871, -0.29)
        this.app.scene.add(new THREE.AmbientLight(0x333333));

        var light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5,3,5);
        this.app.scene.add(light);

        let geom = new THREE.SphereGeometry(1, 128, 128);

        this.earthMesh = new THREE.Mesh(geom, this.earthMaterial);
        this.earthMesh.scale.set(this.scale, this.scale, this.scale)
               
        this.group = new THREE.Group()
        this.group.add(this.earthMesh)
        this.app.scene.add(this.group)
    }
    
    /**
     * updates the diffuse plane color and the material
     * @param {THREE.Color} value 
     */
    updateDiffuseColor(value) {
        this.diffuseColor = value
        this.earthMaterial.color.set(this.diffuseColor)
    }
    /**
     * updates the specular plane color and the material
     * @param {THREE.Color} value 
     */
    updateSpecularColor(value) {
        this.specularColor = value
        this.earthMaterial.specular.set(this.specularColor)
    }
    /**
     * updates the plane shininess and the material
     * @param {number} value 
     */
    updateShininess(value) {
        this.shininess = value
        this.earthMaterial.shininess = this.shininess
    }
    

    updateBumpScale(value) {
        this.bumpScale = value
        this.earthMaterial.bumpScale = this.bumpScale * this.scale
    }

    updateShowTexture(value) {
        this.showTexture = value
        this.earthMaterial.map = this.showTexture ? this.texture : null
        this.earthMaterial.needsUpdate = true
    }

    updateShowBumpTexture(value) {
        this.showBumpTexture = value
        this.earthMaterial.bumpMap = this.showBumpTexture ? this.bumpTexture : null
        this.earthMaterial.needsUpdate = true
    }
    /**
     * updates the contents
     * this method is called from the render method of the app
     * 
     */
    update() {
        let elapsed = 0
        this.texture.offset.x += 0.0001 * elapsed
        this.bumpTexture.offset.x += 0.0001 * elapsed
        this.specularTexture.offset.x += 0.0001 * elapsed
    }

}

export { MyContents };