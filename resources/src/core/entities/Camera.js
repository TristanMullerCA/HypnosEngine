import { DATA_POOL } from "../DataPool.js";
import { Mat4 } from "../math/Mat4.js";
import { BoxCollider } from "./BoxCollider.js";
import { Collider } from "./Collider.js";
import { Entity } from "./Entity.js";
import { NaniteRenderer } from "./NaniteRenderer.js";
import { Renderer } from "./Renderer.js";
import { SphereCollider } from "./SphereCollider.js";

export class Camera extends Entity {
    constructor(zIndex = 0, fov = 60, near = 0.1, far = 100) {
        super();
        this.data = new Float32Array([zIndex, fov, near, far]);
    }

    get zIndex() { return this.data[0]; }
    set zIndex(val) { this.data[0] = val; }

    get fov() { return this.data[1]; }
    set fov(val) { this.data[1] = val; }

    get near() { return this.data[2]; }
    set near(val) { this.data[2] = val; }

    get far() { return this.data[3]; }
    set far(val) { this.data[3] = val; }

    resize(width, height) {
        this.width = width;
        this.height = height;
        this.projectionMatrix = Mat4.perspective(this.fov * (Math.PI / 180), width / height, this.near, this.far);
    }

    /**
     * @param {WebGL2RenderingContext} gl 
     */
    render(gl) {
        // Clear image
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, this.width, this.height);
        gl.clear(gl.DEPTH_BUFFER_BIT);

        // Set view matrix
        const viewMatrix = Mat4.inverse(this.modelMatrix);
        const projectionMatrix = this.projectionMatrix;
        const vpMatrix = Mat4.multiply(projectionMatrix, viewMatrix);

        // Draw renderers
        for (const renderer of DATA_POOL.getResourcesByType(Renderer.name)) {
            if (renderer instanceof Renderer) {
                renderer.render(gl, vpMatrix, this.worldPosition);
            }
        }

        for (const renderer of DATA_POOL.getResourcesByType(NaniteRenderer.name)) {
            if (renderer instanceof NaniteRenderer) {
                renderer.render(gl, this.worldPosition, projectionMatrix, vpMatrix);
            }
        }

        // Draw colliders
        /** @type {Collider[]} */
        const colliders = [
            ...DATA_POOL.getResourcesByType(BoxCollider.name),
            ...DATA_POOL.getResourcesByType(SphereCollider.name)
        ];

        for (const collider of colliders) {
            if (collider.collisions.length > 0) {
                collider.color = [1,0,0,1];
            } else {
                collider.color = [0,1,0,1];
            }

            collider.render(gl, vpMatrix, this.worldPosition);
        }
    }
}