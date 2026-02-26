import { DATA_POOL } from "./DataPool.js";
import { Behaviour } from "./entities/Behaviour.js";
import { BoxCollider } from "./entities/BoxCollider.js";
import { Camera } from "./entities/Camera.js";
import { Physics } from "./entities/Physics.js";
import { ReflectionProbe } from "./entities/ReflectionProbe.js";
import { Renderer } from "./entities/Renderer.js";
import { Rigidbody } from "./entities/Rigidbody.js";
import { SphereCollider } from "./entities/SphereCollider.js";
import { Input } from "./inputs/Input.js";
import { Vec3 } from "./math/Vec3.js";

export class HEngine {
    /**
     * @param {HTMLCanvasElement} canvas 
     */
    constructor(canvas) {
        this.canvas = canvas;
        /** @type {WebGL2RenderingContext} */
        this.gl = canvas.getContext("webgl2", {
            alpha: false,
            antialias: false,
            depth: true,
            desynchronized: true,
            failIfMajorPerformanceCaveat: true,
            premultipliedAlpha: true,
            preserveDrawingBuffer: true,
            stencil: false
        });
        this.loseCtxExt = this.gl.getExtension('WEBGL_lose_context');
        canvas.addEventListener('webglcontextlost', (event) => {
            event.preventDefault();
            console.warn("GPU Context Lost! Freezing engine logic...");

            // 1. Stop your requestAnimationFrame loop
            // 2. Show a "Loading" or "Recovering" UI to the user
            this.loseCtxExt.restoreContext();
        }, false);

        canvas.addEventListener('webglcontextrestored', async () => {
            console.log("GPU Context Restored! Rebuilding resources...");

            // 1. RE-INITIALIZE ALL YOUR BUFFERS, TEXTURES, AND SHADERS
            // (Because they were all deleted from VRAM)
            await this.load(this.scene);

            // 2. Restart your render loop
            // requestAnimationFrame(renderLoop);
        }, false);
        this.lastTime = performance.now();
        this.fixedLastTime = performance.now();
        this.scene = null;
        /** @type {(() => void)[]} */
        this.extraProcesses = [];
        this.input = new Input(this.canvas);
    }

    /**
     * @param {Entity} root 
     */
    async load(root) {
        const gl = this.gl;

        if (this.scene) {
            // unload
            DATA_POOL.clear();
            // console.log('CLEAR DATA POOL');
        }

        for (const element of root.getAllChildren()) {
            DATA_POOL.addResource(element);
        }

        root.updateTransformations();

        this.resize();

        for (const renderer of DATA_POOL.getResourcesByType(Renderer.name)) {
            renderer.init(gl);
        }

        for (const collider of DATA_POOL.getResourcesByType(BoxCollider.name)) {
            collider.init(gl);
        }

        for (const collider of DATA_POOL.getResourcesByType(SphereCollider.name)) {
            collider.init(gl);
        }

        for (const reflectionProbe of DATA_POOL.getResourcesByType(ReflectionProbe.name)) {
            reflectionProbe.init(gl);
            reflectionProbe.bake(gl);
        }

        for (const behaviour of DATA_POOL.getResourcesByType(Behaviour.name)) {
            await behaviour.start();
        }

        this.scene = root;
    }

    render() {
        const gl = this.gl;
        const delta = this.delta;

        // Update collisions
        const colliders = [
            ...DATA_POOL.getResourcesByType(BoxCollider.name),
            ...DATA_POOL.getResourcesByType(SphereCollider.name)
        ];

        for (let i = 0; i < colliders.length; i++) {
            const colliderA = colliders[i];

            for (let j = i + 1; j < colliders.length; j++) {
                const colliderB = colliders[j];

                // Perform the math once and get the manifold (null if no hit)
                const collision = Physics.getCollision(colliderA, colliderB);

                if (collision) {
                    // Push to A (relative to A)
                    const collisionA = collision;
                    collisionA.collider = colliderB;
                    colliderA.collisions.push(collisionA);

                    // Push to B (Flip the normal for B!)
                    const collisionB = collision;
                    collisionB.collider = colliderA;
                    collisionB.normal = Vec3.mulScalar(collisionB.normal, -1);
                    colliderB.collisions.push(collisionB);
                }
            }
        }

        // Update behaviours
        for (const behaviour of DATA_POOL.getResourcesByType(Behaviour.name)) {
            behaviour.update(delta, this.input);
        }

        // Update rigidbodies
        const GRAVITY = -9.81;

        for (const rb of DATA_POOL.getResourcesByType(Rigidbody.name)) {
            if (rb.isStatic) continue;

            // Apply Gravity
            if (rb.useGravity) {
                rb.applyForce(new Vec3(0, GRAVITY * rb.mass, 0));
            }

            rb.update(delta);
        }

        // Render scene with cameras
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        for (const camera of Array.from(DATA_POOL.getResourcesByType(Camera.name)).sort((a, b) => b.zIndex - a.zIndex)) {
            camera.render(gl);
        }

        // Do extra stuffs (editor)
        while (this.extraProcesses.length > 0) {
            this.extraProcesses.shift().call();
        }

        // Clear collisions
        for (const collider of colliders) {
            collider.collisions = [];
        }

        // Clear inputs state
        this.input.mouse.clear();
    }

    update() {
        const delta = this.fixedDelta;

        for (const rb of DATA_POOL.getResourcesByType(Rigidbody.name)) {
            if (rb.isStatic) continue;

            // Apply Gravity
            if (rb.useGravity) {
                rb.applyForce(new Vec3(0, -9.81 * rb.mass, 0));
            }

            rb.update(delta);
        }

        const colliders = [
            ...DATA_POOL.getResourcesByType(BoxCollider.name),
            ...DATA_POOL.getResourcesByType(SphereCollider.name)
        ];

        // Clear collisions
        for (const collider of colliders) {
            collider.collisions = [];
        }
    }

    resize() {
        if (!this.canvas) return;

        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;

        for (const camera of DATA_POOL.getResourcesByType(Camera.name)) {
            camera.resize(this.canvas.width, this.canvas.height);
        }
    }

    get delta() {
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        return deltaTime;
    }

    get fixedDelta() {
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.fixedLastTime) / 1000;
        this.fixedLastTime = currentTime;
        return deltaTime;
    }
}