import * as THREE from "three";

/**
 * This class contains methods to check collisions for an Oriented Bounding Box
 * Uses the Separating Axis Theorem!
 */
class OBB {
    /**
     * Checks if two boxes overlap using the Separating Axis Theorem
     * @param {RectangleCollider} rectangleA
     * @param {RectangleCollider} rectangleB
     * @returns {boolean} if intersects
     */
    static SatWithRectangle(rectangleA, rectangleB) {
        const normals = [];

        // four normals p1-p2 p2-p3
        normals.push([rectangleA.p2, rectangleA.p1]);
        normals.push([rectangleA.p3, rectangleA.p2]);
        normals.push([rectangleB.p2, rectangleB.p1]);
        normals.push([rectangleB.p3, rectangleB.p2]);

        for (let n = 0; n < normals.length; n++) {
            if (
                !this.SatTest(
                    ...normals[n],
                    Array.from([
                        rectangleA.p1.clone(),
                        rectangleA.p2.clone(),
                        rectangleA.p3.clone(),
                        rectangleA.p4.clone(),
                    ]),
                    Array.from([
                        rectangleB.p1.clone(),
                        rectangleB.p2.clone(),
                        rectangleB.p3.clone(),
                        rectangleB.p4.clone(),
                    ])
                )
            )
                return false;
        }

        return true;
    }

    /**
     *
     * @param {THREE.Vector2} edgePt1
     * @param {THREE.Vector2} edgePt2
     * @param {[Vector2]} pointsA
     * @param {[Vector2]} pointsB
     */
    static SatTest(edgePt1, edgePt2, pointsA, pointsB) {
        let normal = edgePt1.clone().sub(edgePt2); // no need to normalize as it would be unnecessary operations

        let rectAMin;
        let rectAMax;
        let rectBMin;
        let rectBMax;

        pointsA.forEach((point) => {
            const projectedPoint = normal
                .clone()
                .multiplyScalar(
                    normal.x * point.sub(edgePt2).x +
                        normal.y * point.sub(edgePt2).y
                );

            const value =
                projectedPoint.x * projectedPoint.x +
                projectedPoint.y * projectedPoint.y;

            if (!rectAMin || value < rectAMin) rectAMin = value;
            if (!rectAMax || value > rectAMax) rectAMax = value;
        });

        pointsB.forEach((point) => {
            const projectedPoint = normal
                .clone()
                .multiplyScalar(
                    normal.x * point.sub(edgePt2).x +
                        normal.y * point.sub(edgePt2).y
                );

            const value =
                projectedPoint.x * projectedPoint.x +
                projectedPoint.y * projectedPoint.y;

            if (!rectBMin || value < rectBMin) rectBMin = value;
            if (!rectBMax || value > rectBMax) rectBMax = value;
        });

        // if do not overlap
        if (rectAMax < rectBMin || rectAMin > rectBMax) {
            return false;
        } else {
            return true;
        }
    }
}

export { OBB };
