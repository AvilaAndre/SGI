import * as THREE from 'three';

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

        // object initialization
        this.texture1 = null
        this.texture2 = null
        this.scene1 = null
        this.scene2 = null
        
        // options for textures and dat.gui
        this.options = {
            minFilters: {
                'NearestFilter': THREE.NearestFilter,
                'NearestMipMapLinearFilter': THREE.NearestMipMapLinearFilter,
                'NearestMipMapNearestFilter': THREE.NearestMipMapNearestFilter,
                'LinearFilter ': THREE.LinearFilter,
                'LinearMipMapLinearFilter (Default)': THREE.LinearMipMapLinearFilter,
                'LinearMipmapNearestFilter': THREE.LinearMipmapNearestFilter,
            },
            magFilters: {
                'NearestFilter': THREE.NearestFilter,
                'LinearFilter (Default)': THREE.LinearFilter,
            },
        }      
    }
    /**
     * initializes the contents
     */
    init() {
        // two scenes created
        this.scene1 = new THREE.Scene()
        this.scene2 = new THREE.Scene()

        // manual mipmaps
        this.texture1 = new THREE.TextureLoader().load("textures/caravaggio.jpg")
        // texture 1 mipmaps will be manually defined
        this.texture1.generateMipmaps = false
        // DO NOT DEFINE minFilter AND magFilter as mipmaps will control the filtering
        this.loadMipmap(this.texture1, 0, "textures/caravaggio.256.jpg")    // .1024
        this.loadMipmap(this.texture1, 1, "textures/caravaggio.128.jpg")    // .512
        //this.loadMipmap(this.texture1, 2, "textures/caravaggio.256.jpg")
        //this.loadMipmap(this.texture1, 3, "textures/caravaggio.128.jpg")
        //this.loadMipmap(this.texture1, 4, "textures/caravaggio.64.jpg")
        //this.loadMipmap(this.texture1, 5, "textures/caravaggio.32.jpg")
        //this.loadMipmap(this.texture1, 6, "textures/caravaggio.16.jpg")
        //this.loadMipmap(this.texture1, 7, "textures/caravaggio.8.jpg")

        this.texture1.needsUpdate = true
        this.material1 = new THREE.MeshBasicMaterial({ map: this.texture1 })
        this.plane1 = new THREE.Mesh(new THREE.PlaneGeometry(), this.material1)
        this.scene1.add(this.plane1)
        
        // automatic mipmaps
        this.texture2 = this.texture1.clone()
        this.texture2.generateMipmaps = true
        this.texture2.minFilter = THREE.LinearMipMapLinearFilter
        this.texture2.magFilter = THREE.NearestFilter
        this.texture2.needsUpdate = true
        
        this.material2 = new THREE.MeshBasicMaterial({ map: this.texture2 })
        this.plane2 = new THREE.Mesh(new THREE.PlaneGeometry(), this.material2)
        this.scene2.add(this.plane2)

        // set the camera position to a proper perspective
        this.app.activeCamera.position.set(0,0,0.8)
    }
    
    /**
     * load an image and create a mipmap to be added to a texture at the defined level.
     * In between, add the image some text and control squares. These items become part of the picture
     * 
     * @param {*} parentTexture the texture to which the mipmap is added
     * @param {*} level the level of the mipmap
     * @param {*} path the path for the mipmap image
    // * @param {*} size if size not null inscribe the value in the mipmap. null by default
    // * @param {*} color a color to be used for demo
     */
    loadMipmap(parentTexture, level, path)
    {
        // load texture. On loaded call the function to create the mipmap for the specified level 
        new THREE.TextureLoader().load(path, 
            function(mipmapTexture)  // onLoad callback
            {
                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d')
                ctx.scale(1, 1);
                
                // const fontSize = 48
                const img = mipmapTexture.image         
                canvas.width = img.width;
                canvas.height = img.height

                // first draw the image
                ctx.drawImage(img, 0, 0 )
                             
                // set the mipmap image in the parent texture in the appropriate level
                parentTexture.mipmaps[level] = canvas
            },
            undefined, // onProgress callback currently not supported
            function(err) {
                console.error('Unable to load the image ' + path + ' as mipmap level ' + level + ".", err)
            }
        )
    }

    // currently not being used. Method credits: https://sbcode.net/threejs/custom-mipmaps/
    mipmap(size, color) {
        const imageCanvas = document.createElement('canvas')
        const context = imageCanvas.getContext('2d')
        imageCanvas.width = size
        imageCanvas.height = size
        context.fillStyle = '#888888'
        context.fillRect(0, 0, size, size)
        context.fillStyle = color
        context.fillRect(0, 0, size / 2, size / 2)
        context.fillRect(size / 2, size / 2, size / 2, size / 2)
        return imageCanvas
    }

    updateMinFilter(value) {
        this.texture2.minFilter = value
        this.texture2.needsUpdate = true
    }


    updateMagFilter(value) {
        this.texture2.magFilter = value
        this.texture2.needsUpdate = true
    }

    /**
     * updates the contents
     * this method is called from the render method of the app
     * 
     */
    update() {

        let renderer = this.app.renderer
        let camera = this.app.activeCamera

        // enable scissor
        // When this is enabled, only the pixels within the defined scissor 
        // area will be affected by further renderer actions. 
        renderer.setScissorTest(true)

        // select left square part of the canvas
        // sets the scissor region from (x, y) to (x + width, y + height).
        renderer.setScissor(0, 0, window.innerWidth / 2 - 2, window.innerHeight)

        // render the first scene  
        renderer.render(this.scene1, camera)

        // select right square part of the canvas
        // sets the scissor region from (x, y) to (x + width, y + height).
        renderer.setScissor(
            window.innerWidth / 2,
            0,
            window.innerWidth / 2 - 2,
            window.innerHeight
        )
        // render the second scene
        renderer.render(this.scene2, camera)

        // disable scissor
        renderer.setScissorTest(false)
    }

}

export { MyContents };