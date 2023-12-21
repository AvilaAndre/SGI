import * as THREE from "three";

/**
 * This class represents an Oriented Bounding Box Collider
 */
class OBB {
    /**
     *
     * @param {number} minX
     * @param {number} maxX
     * @param {number} minY
     * @param {number} maxY
     */
    constructor(minX, maxX, minY, maxY) {
        this.minX = minX;
        this.maxX = maxX;
        this.minY = minY;
        this.maxY = maxY;
    }

    /**
     *
     * @param {THREE.Vector2} point
     * @returns
     */
    isPointInside(point) {
        return (
            point.x >= this.minX &&
            point.x <= this.maxX &&
            point.y >= this.minY &&
            point.y <= this.maxY
        );
    }

    /**
     * Checks if two boxes overlap
     * @param {AABB} box
     */
    static intersect(box) {
        return (
            this.minX <= box.maxX &&
            this.maxX >= box.minX &&
            this.minY <= box.maxY &&
            this.maxY >= box.minY
        );
    }
}

export { Collider };
