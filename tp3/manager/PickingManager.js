import * as THREE from "three";


/**
 *  This class contains the contents of out application
 */
class PickingManager {
    /**
         constructs the object
      */
    constructor(contents, data) {


        this.contents = contents;
        this.data = data;

        //picking: read documentation of THREE.Raycaster

        this.raycaster = new THREE.Raycaster()
        this.raycaster.near = 1
        this.raycaster.far = 200

        this.pointer = new THREE.Vector2()
        this.intersectedObj = null
        this.pickingColor = "0x00ff00"


        
        this.onPointerMove = this.onPointerMove.bind(this);

        console.log("this.contents.nodes:", this.contents.nodes);

        //this.notPickableObjIds = [];
        this.notPickableObjIds = ["floor", "stone-wall_1", "Fence_Cylinder", "Mesh_tree_simple_dark", "Mesh_grandStand", "PrototypePete_head", "PrototypePete_body", "PrototypePete_armLeft", "PrototypePete_armRight"];


        console.log("currentState no constructor do Picking Managerc:", this.currentState);

        this.activeStates = ["pickingPlayer", "pickingOpponent", "pickingObstacle"];
        this.currentState = null; // You'll need to set this based on your application's state

        // define the objects ids that are not to be pickeable
        // NOTICE: not a ThreeJS facility
        
        
    }

    /**
     * initializes the contents
     */
    init() {



    }




    /*
    * Update the color of selected object
    *
    */
    updatePickingColor(value) {
        this.pickingColor = value.replace('#', '0x');
    }

    /*
    * Change the color of the first intersected object
    *
    */
    changeColorOfFirstPickedObj(obj) {
        if (this.lastPickedObj !== obj) {
            if (this.lastPickedObj && this.lastPickedObj.material && this.lastPickedObj.material.color) {
                // Ensure the object has a material and a color before setting the color
                this.lastPickedObj.material.color.setHex(this.lastPickedObj.currentHex);
            }
    
            this.lastPickedObj = obj;
    
            if (this.lastPickedObj && this.lastPickedObj.material && this.lastPickedObj.material.color) {
                // Store the current color
                this.lastPickedObj.currentHex = this.lastPickedObj.material.color.getHex();
    
                // Convert the picking color to a hexadecimal value if necessary
                const colorHex = (typeof this.pickingColor === 'string') ? parseInt(this.pickingObjColor, 16) : this.pickingColor;
    
                // Set the new color
                this.lastPickedObj.material.color.setHex(0x4fba97);
            }
        }
    }
    

    /*
     * Restore the original color of the intersected object
     *
     */
    restoreColorOfFirstPickedObj() {
        if (this.lastPickedObj)
            this.lastPickedObj.material.color.setHex(this.lastPickedObj.currentHex);
        this.lastPickedObj = null;
    }

    /*
    * Helper to visualize the intersected object
    *
    */
    pickingHelper(intersects) {
        console.log("intersects:", intersects);
        if (intersects.length > 0) {
            const obj = intersects[0].object;
            console.log("Object picked:", obj);
    
            // Check if obj.name includes any of the words in notPickableObjIds
            const isNotPickable = this.notPickableObjIds.some(id => obj.name.includes(id));
    
            if (isNotPickable) {
                this.restoreColorOfFirstPickedObj();
                console.log("Object cannot be picked:", obj.name);
            } else {
                this.changeColorOfFirstPickedObj(obj);
            }
        } else {
            this.restoreColorOfFirstPickedObj();
        }
    }
    
    


    /**
     * Print to console information about the intersected objects
     */
    transverseRaycastProperties(intersects) {
        for (var i = 0; i < intersects.length; i++) {

            console.log(intersects[i]);

            /*
            An intersection has the following properties :
                - object : intersected object (THREE.Mesh)
                - distance : distance from camera to intersection (number)
                - face : intersected face (THREE.Face3)
                - faceIndex : intersected face index (number)
                - point : intersection point (THREE.Vector3)
                - uv : intersection point in the object's UV coordinates (THREE.Vector2)
            */
        }
    }

    // Call this method to update the state
    setState(newState) {
        this.currentState = newState;
    }


    onPointerMove(event) {


        console.log("currentState no onPointerMove:", this.currentState);

        if (!this.activeStates.includes(this.currentState)) {
            console.log("not one of the active states");
            // If not, return early and do nothing
            return;
        }

        // calculate pointer position in normalized device coordinates
        // (-1 to +1) for both components

        //of the screen is the origin
        this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

        console.log("Position x: " + this.pointer.x + " y: " + this.pointer.y);

        //2. set the picking ray from the camera position and mouse coordinates
        this.raycaster.setFromCamera(this.pointer, this.contents.app.getActiveCamera());

        //3. compute intersections
        //var intersects = this.raycaster.intersectObjects(this.data.nodes);

        const nodesArray = Object.values(this.contents.nodes);

        const intersects = this.raycaster.intersectObjects(nodesArray, true);

        //var intersects = this.raycaster.intersectObjects(this.contents.nodes, true);


        this.pickingHelper(intersects)

        this.transverseRaycastProperties(intersects)
    }


    /**
     * updates the contents
     * this method is called from the render method of the app
     *
     */
    update() {
    }
}

export { PickingManager };
