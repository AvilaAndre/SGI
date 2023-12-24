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

        const Ap1 = rectangleA.p1.clone();
        const Ap2 = rectangleA.p2.clone();
        const Ap3 = rectangleA.p3.clone();
        const Ap4 = rectangleA.p4.clone();

        const Bp1 = rectangleB.p1.clone();
        const Bp2 = rectangleB.p2.clone();
        const Bp3 = rectangleB.p3.clone();
        const Bp4 = rectangleB.p4.clone();

        // four normals p1-p2 p2-p3
        normals.push([Ap2, Ap1]);
        normals.push([Ap3, Ap2]);
        normals.push([Ap4, Ap3]);
        normals.push([Ap1, Ap4]);
        normals.push([Bp2, Bp1]);
        normals.push([Bp3, Bp2]);
        normals.push([Bp4, Bp3]);
        normals.push([Bp1, Bp4]);

        for (let n = 0; n < normals.length; n++) {
            if (
                !this.SatTest(
                    ...normals[n],
                    Array.from([Ap1, Ap2, Ap3, Ap4]),
                    Array.from([Bp1, Bp2, Bp3, Bp4])
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
        const v = edgePt2.clone().sub(edgePt1);
        const normal = new THREE.Vector2(v.y, -v.x);
        normal.normalize();

        let rectAMin = undefined;
        let rectAMax = undefined;
        let rectBMin = undefined;
        let rectBMax = undefined;

        pointsA.forEach((point) => {
            const p = point.clone().sub(edgePt1);
            const value = p.x * normal.x + p.y * normal.y;

            if (rectAMin === undefined || value < rectAMin) rectAMin = value;
            if (rectAMax === undefined || value > rectAMax) rectAMax = value;
        });

        pointsB.forEach((point) => {
            const p = point.clone().sub(edgePt1);
            const value = p.x * normal.x + p.y * normal.y;

            if (rectBMin === undefined || value < rectBMin) rectBMin = value;
            if (rectBMax === undefined || value > rectBMax) rectBMax = value;
        });

        let distance = rectAMin - rectBMax;
        if (rectAMin < rectBMin) {
            distance = rectBMin - rectAMax;
        }

        // if do not overlap
        if (distance > 0) {
            return false;
        } else {
            return true;
        }
    }
}

export { OBB };
