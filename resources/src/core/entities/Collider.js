import { Entity } from "./Entity.js";

export class Collider extends Entity {
    constructor() {
        super();
        /** @type {Collision[]} */
        this.collisions = [];
        this.color = [1, 1, 0, 1];
    }

    /**
     * @param {WebGL2RenderingContext} gl 
     */
    init(gl) {}

    /**
     * @param {WebGL2RenderingContext} gl 
     * @param {Mat4} vpMatrix 
     * @param {Vec3} viewPosition 
     */
    render(gl, vpMatrix, viewPosition) {}
}