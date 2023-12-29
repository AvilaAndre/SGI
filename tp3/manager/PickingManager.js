import * as THREE from "three";

/**
 *  This class contains the contents of out application
 */
class PickingManager {
    /**
     * constructs the object
     */
    constructor(contents, pickableObjIds) {
        this.contents = contents;
        this.pickableObjIds = pickableObjIds || [];

        //picking: read documentation of THREE.Raycaster

        this.raycaster = new THREE.Raycaster();
        this.raycaster.near = 1;
        this.raycaster.far = 200;

        this.pointer = new THREE.Vector2();
        this.intersectedObj = null;
        this.pickingColor = "0xD2E3D1";

        this.notPickableObjIds = [
            "floor",
            "stone-wall_1",
            "Fence_Cylinder",
            "Mesh_tree_simple_dark",
            "Mesh_grandStand",
            "PrototypePete_head",
            "PrototypePete_body",
            "PrototypePete_armLeft",
            "PrototypePete_armRight",
        ];

        // define the objects ids that are not to be pickeable
        // NOTICE: not a ThreeJS facility
    }

    /**
     * initializes the contents
     */
    init() {}

    /*
     * Update the color of selected object
     *
     */
    updatePickingColor(value) {
        this.pickingColor = value.replace("#", "0x");
    }

    /*
     * Change the color of the first intersected object
     *
     */
    changeColorOfFirstPickedObj(obj) {
        if (this.lastPickedObj !== obj) {
            if (
                this.lastPickedObj &&
                this.lastPickedObj.material &&
                this.lastPickedObj.material.color
            ) {
                // Ensure the object has a material and a color before setting the color
                this.lastPickedObj.material.color.setHex(
                    this.lastPickedObj.currentHex
                );
            }

            this.lastPickedObj = obj;

            if (
                this.lastPickedObj &&
                this.lastPickedObj.material &&
                this.lastPickedObj.material.color
            ) {
                // Store the current color
                this.lastPickedObj.currentHex =
                    this.lastPickedObj.material.color.getHex();

                // Convert the picking color to a hexadecimal value if necessary
                const colorHex =
                    typeof this.pickingColor === "string"
                        ? parseInt(this.pickingObjColor, 16)
                        : this.pickingColor;

                // Set the new color
                this.lastPickedObj.material.color.setHex(0x8FCB8C);
            }
        }
    }

    /*
     * Restore the original color of the intersected object
     *
     */
    restoreColorOfFirstPickedObj() {
        if (this.lastPickedObj)
            this.lastPickedObj.material.color.setHex(
                this.lastPickedObj.currentHex
            );
        this.lastPickedObj = null;
    }

    /*
     * Helper to visualize the intersected object
     *
     */
    pickingHelper(intersects) {
        if (intersects.length > 0) {
            const obj = intersects[0].object;

            // Check if obj.name includes any of the words in notPickableObjIds
            const isNotPickable = this.notPickableObjIds.some((id) =>
                obj.name.includes(id)
            );

            if (isNotPickable) {
                this.restoreColorOfFirstPickedObj();
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
        let wantedIntersection = null;

        for (var i = 0; i < intersects.length; i++) {
            intersects[i].object.traverseAncestors((elem) => {
                if (
                    wantedIntersection != intersects[i] &&
                    (wantedIntersection == null ||
                        intersects[i].distance < wantedIntersection.distance)
                )
                    if (this.pickableObjIds.includes(elem.name)) {
                        wantedIntersection = intersects[i];
                        wantedIntersection.pickable = elem;
                    }
            });

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

        return wantedIntersection == null ? null : wantedIntersection.pickable;
    }

    onPointerMove(event) {
        // calculate pointer position in normalized device coordinates
        // (-1 to +1) for both components

        //of the screen is the origin
        this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

        //2. set the picking ray from the camera position and mouse coordinates
        this.raycaster.setFromCamera(
            this.pointer,
            this.contents.app.getActiveCamera()
        );

        //3. compute intersections
        const intersects = this.raycaster.intersectObjects(
            this.contents.pickables,
            true
        );

        this.pickingHelper(intersects);
    }

    getNearestObject(event) {
        // calculate pointer position in normalized device coordinates
        // (-1 to +1) for both components

        //of the screen is the origin
        this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

        //2. set the picking ray from the camera position and mouse coordinates
        this.raycaster.setFromCamera(
            this.pointer,
            this.contents.app.getActiveCamera()
        );

        //3. compute intersections
        const intersects = this.raycaster.intersectObjects(
            this.contents.pickables,
            true
        );

        return this.transverseRaycastProperties(intersects);
    }
}

export { PickingManager };
