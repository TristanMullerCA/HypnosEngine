import { Vec3 } from "../math/Vec3.js";
import { BoxCollider } from "./BoxCollider.js";
import { Collision } from "./Collision.js";
import { SphereCollider } from "./SphereCollider.js";

export class Physics {
    /**
     * @param {Collider} colA 
     * @param {Collider} colB 
     */
    static getCollision(colA, colB) {
        if (colA.UUID == colB.UUID) return null;

        if (colA instanceof BoxCollider) {
            if (colB instanceof BoxCollider) {
                return this.getAABBAABBCollision(colA, colB);
            } else if (colB instanceof SphereCollider) {
                return this.getSphereAABBCollision(colB, colA);
            }
        } else if (colA instanceof SphereCollider) {
            if (colB instanceof BoxCollider) {
                return this.getSphereAABBCollision(colA, colB);
            } else if (colB instanceof SphereCollider) {
                return this.getSphereSphereCollision(colA, colB);
            }
        }

        return null;
    }

    /**
     * @param {SphereCollider} sA 
     * @param {SphereCollider} sB 
     * @returns {Collision}
     */
    static getSphereSphereCollision(sA, sB) {
        const delta = Vec3.sub(sB.worldPosition, sA.worldPosition);
        const distance = delta.magnitude;
        const sumRadii = sA.radius + sB.radius;

        if (distance > sumRadii) return null; // No collision

        const normal = Vec3.normalize(delta);

        return new Collision(
            sB,
            sumRadii - distance,
            Vec3.add(sA.worldPosition, normal),
            normal,
        );
    }

    /**
     * @param {BoxCollider} a 
     * @param {BoxCollider} b 
     * @returns {Collision}
     */
    static getAABBAABBCollision(a, b) {
        const diffMin = Vec3.sub(a.max, b.min); // Overlap on "positive" side
        const diffMax = Vec3.sub(b.max, a.min); // Overlap on "negative" side

        // We find the smallest overlap among all 6 faces (x, y, z)
        const overlaps = [diffMin.x, diffMax.x, diffMin.y, diffMax.y, diffMin.z, diffMax.z];
        let minOverlap = Infinity;
        let axisIndex = 0;

        for (let i = 0; i < 6; i++) {
            if (overlaps[i] < minOverlap) {
                minOverlap = overlaps[i];
                axisIndex = i;
            }
        }

        if (minOverlap < 0) return null;

        const normals = [
            new Vec3(1, 0, 0), new Vec3(-1, 0, 0),
            new Vec3(0, 1, 0), new Vec3(0, -1, 0),
            new Vec3(0, 0, 1), new Vec3(0, 0, -1)
        ];

        return new Collision(
            b,
            minOverlap,
            Vec3.mulScalar(Vec3.add(a.position, b.position), 0.5),
            normals[axisIndex],
        );
    }

    /**
     * @param {SphereCollider} sphere 
     * @param {BoxCollider} aabb 
     * @returns {Collision}
     */
    static getSphereAABBCollision(sphere, aabb) {
        // 1. Find closest point on AABB to sphere center
        const closest = new Vec3(
            Math.max(aabb.min.x, Math.min(sphere.worldPosition.x, aabb.max.x)),
            Math.max(aabb.min.y, Math.min(sphere.worldPosition.y, aabb.max.y)),
            Math.max(aabb.min.z, Math.min(sphere.worldPosition.z, aabb.max.z))
        );

        const delta = Vec3.sub(sphere.worldPosition, closest);
        const distSq = Math.pow(delta.magnitude, 2);

        if (distSq > (sphere.radius * sphere.radius)) return null;

        const dist = Math.sqrt(distSq);

        // Handle the case where the sphere center is exactly on the AABB edge
        const normal = dist > 0.0001 ? Vec3.divScalar(delta, dist) : new Vec3(0, 1, 0);

        return new Collision(
            aabb,
            sphere.radius - dist,
            closest,
            normal,
        );
    }
}