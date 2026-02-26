import { Vec3 } from "../math/Vec3.js";

export class Collision {
    /**
     * @param {Collider} collider 
     * @param {Vec3} point 
     * @param {Vec3} normal 
     */
    constructor(collider, depth = 1, point = new Vec3(), normal = new Vec3()) {
        this.collider = collider;
        this.depth = depth;
        this.point = point;
        this.normal = normal;
    }
}