import * as THREE from "three";
import { Collider } from "./Collider.js";
import { AABB } from "./AABB.js";
import { OBB } from "./OBB.js";

/**
 * This class represents a base collider
 */
class RectangleCollider extends Collider {
    /**
     * Creates a collider in the shape of a 2D rectangle
     * @param {THREE.Object3D} parent the parent's position
     * @param {THREE.Vector2} center the collider position
     * @param {number} width
     * @param {number} depth
     */
    constructor(parent, center, width, depth) {
        super(parent, new THREE.Vector3(center.x, 0, center.y));

        this.width = width;
        this.depth = depth;

        this.aabb = new AABB(0, width, 0, depth);
        this.computePoints();

        this.type = "rectangle";
    }

    /**
     * Checks if this collides with another collider
     * @param {Collider} collider
     */
    collide(otherCollider) {
        if (otherCollider == this) {
            console.error("Checking collisions for the same colliders");
            return null;
        }
        switch (otherCollider.type) {
            case "rectangle": {
                // Check AABB first
                if (this.aabb.intersect(otherCollider.aabb)) {
                    if (OBB.SatWithRectangle(this, otherCollider)) return this;
                }

                return null;
            }
            case "pttree":
            case "ptnode": {
                return otherCollider.collide(this);
            }

            default: {
                console.warn(
                    "RectangleCollider does not collide with",
                    otherCollider.type
                );
                return null;
            }
        }
    }

    /**
     * Calculates the limits of this collider, calculating the 2D bounding box that contains it
     */
    computePoints() {
        const parentWorldPosition = new THREE.Vector3();

        this.parent.getWorldPosition(parentWorldPosition);

        // ROTATE THEN TRANSLATE
        this.p1 = new THREE.Vector2(
            -this.width / 2 + this.center.x,
            this.depth / 2 + this.center.z
        );
        // rotate this.p1
        this.p1.set(
            this.p1.x * Math.cos(-this.parent.rotation.y) -
                this.p1.y * Math.sin(-this.parent.rotation.y),
            this.p1.x * Math.sin(-this.parent.rotation.y) +
                this.p1.y * Math.cos(-this.parent.rotation.y)
        );
        this.p1.add(
            new THREE.Vector2(this.parent.position.x, this.parent.position.z)
        );

        this.p2 = new THREE.Vector2(
            this.width / 2 + this.center.x,
            this.depth / 2 + this.center.z
        );
        // rotate this.p2
        this.p2.set(
            this.p2.x * Math.cos(-this.parent.rotation.y) -
                this.p2.y * Math.sin(-this.parent.rotation.y),
            this.p2.x * Math.sin(-this.parent.rotation.y) +
                this.p2.y * Math.cos(-this.parent.rotation.y)
        );
        this.p2.add(
            new THREE.Vector2(this.parent.position.x, this.parent.position.z)
        );

        this.p3 = new THREE.Vector2(
            this.width / 2 + this.center.x,
            -this.depth / 2 + this.center.z
        );
        // rotate this.p3
        this.p3.set(
            this.p3.x * Math.cos(-this.parent.rotation.y) -
                this.p3.y * Math.sin(-this.parent.rotation.y),
            this.p3.x * Math.sin(-this.parent.rotation.y) +
                this.p3.y * Math.cos(-this.parent.rotation.y)
        );
        this.p3.add(
            new THREE.Vector2(this.parent.position.x, this.parent.position.z)
        );

        this.p4 = new THREE.Vector2(
            -this.width / 2 + this.center.x,
            -this.depth / 2 + this.center.z
        );
        // rotate this.p4
        this.p4.set(
            this.p4.x * Math.cos(-this.parent.rotation.y) -
                this.p4.y * Math.sin(-this.parent.rotation.y),
            this.p4.x * Math.sin(-this.parent.rotation.y) +
                this.p4.y * Math.cos(-this.parent.rotation.y)
        );
        this.p4.add(
            new THREE.Vector2(this.parent.position.x, this.parent.position.z)
        );

        let minX;
        let maxX;
        let minY;
        let maxY;

        [this.p1, this.p2, this.p3, this.p4].forEach((point) => {
            if (!minX || point.x < minX) minX = point.x;
            if (!maxX || point.x > maxX) maxX = point.x;
            if (!minY || point.y < minY) minY = point.y;
            if (!maxY || point.y > maxY) maxY = point.y;
        });

        this.aabb.set(minX, maxX, minY, maxY);
    }

    update() {
        this.computePoints();
    }

    /**
     * Returns a visual representation of the collider, for DEBUG purposes only
     * @returns {THREE.Object3D}
     */
    getDebugObject() {
        if (this.debugObject) {
            return this.debugObject;
        }

        this.debugObject = new THREE.Object3D();

        this.p1Obj = new THREE.Mesh(
            new THREE.SphereGeometry(0.05),
            new THREE.MeshBasicMaterial({
                color: new THREE.Color(0.75, 0.75, 1),
                opacity: 0.6,
                transparent: true,
            })
        );
        this.p2Obj = new THREE.Mesh(
            new THREE.SphereGeometry(0.05),
            new THREE.MeshBasicMaterial({
                color: new THREE.Color(0.5, 0.5, 1),
                opacity: 0.6,
                transparent: true,
            })
        );
        this.p3Obj = new THREE.Mesh(
            new THREE.SphereGeometry(0.05),
            new THREE.MeshBasicMaterial({
                color: new THREE.Color(0.25, 0.25, 1),
                opacity: 0.6,
                transparent: true,
            })
        );
        this.p4Obj = new THREE.Mesh(
            new THREE.SphereGeometry(0.05),
            new THREE.MeshBasicMaterial({
                color: new THREE.Color(0, 0, 1),
                opacity: 0.6,
                transparent: true,
            })
        );

        this.debugObject.add(this.p1Obj);
        this.debugObject.add(this.p2Obj);
        this.debugObject.add(this.p3Obj);
        this.debugObject.add(this.p4Obj);

        this.p1ObjAABB = new THREE.Mesh(
            new THREE.SphereGeometry(0.05),
            new THREE.MeshBasicMaterial({
                color: new THREE.Color(0, 0.5, 1),
                opacity: 0.6,
                transparent: true,
            })
        );
        this.p2ObjAABB = new THREE.Mesh(
            new THREE.SphereGeometry(0.05),
            new THREE.MeshBasicMaterial({
                color: new THREE.Color(0, 0.5, 1),
                opacity: 0.6,
                transparent: true,
            })
        );
        this.p3ObjAABB = new THREE.Mesh(
            new THREE.SphereGeometry(0.05),
            new THREE.MeshBasicMaterial({
                color: new THREE.Color(0, 0.5, 1),
                opacity: 0.6,
                transparent: true,
            })
        );
        this.p4ObjAABB = new THREE.Mesh(
            new THREE.SphereGeometry(0.05),
            new THREE.MeshBasicMaterial({
                color: new THREE.Color(0, 0.5, 1),
                opacity: 0.6,
                transparent: true,
            })
        );

        this.debugObject.add(this.p1ObjAABB);
        this.debugObject.add(this.p2ObjAABB);
        this.debugObject.add(this.p3ObjAABB);
        this.debugObject.add(this.p4ObjAABB);

        return this.debugObject;
    }

    updateDebugObject() {
        if (this.debugObject) {
            if (this.p1Obj) this.p1Obj.position.set(this.p1.x, 2, this.p1.y);
            if (this.p2Obj) this.p2Obj.position.set(this.p2.x, 2, this.p2.y);
            if (this.p3Obj) this.p3Obj.position.set(this.p3.x, 2, this.p3.y);
            if (this.p4Obj) this.p4Obj.position.set(this.p4.x, 2, this.p4.y);

            if (this.p1ObjAABB)
                this.p1ObjAABB.position.set(
                    this.aabb.minX,
                    2.2,
                    this.aabb.minY
                );
            if (this.p2ObjAABB)
                this.p2ObjAABB.position.set(
                    this.aabb.minX,
                    2.2,
                    this.aabb.maxY
                );
            if (this.p3ObjAABB)
                this.p3ObjAABB.position.set(
                    this.aabb.maxX,
                    2.2,
                    this.aabb.minY
                );
            if (this.p4ObjAABB)
                this.p4ObjAABB.position.set(
                    this.aabb.maxX,
                    2.2,
                    this.aabb.maxY
                );
        }
    }
}

export { RectangleCollider };
