import { Vec3 } from "../math/Vec3.js";

export class Mouse {
    /**
     * @param {HTMLCanvasElement} canvas 
     */
    constructor(canvas) {
        this.x = 0; this.y = 0;
        this.dx = 0; this.dy = 0;
        this.isDown = false;
        this.isLock = false;

        canvas.addEventListener('mousemove', e => {
            // Movement delta for "Pointer Lock" camera rotation
            this.dx = e.movementX;
            this.dy = e.movementY;

            // NDC coordinates (-1 to +1) for raycasting/picking
            this.x = (e.clientX / canvas.clientWidth) * 2 - 1;
            this.y = -(e.clientY / canvas.clientHeight) * 2 + 1;
        });

        canvas.addEventListener('mousedown', () => this.isDown = true);
        window.addEventListener('mouseup', () => this.isDown = false);

        canvas.addEventListener('click', () => {
            canvas.requestPointerLock({
                unadjustedMovement: this.isLock,
            });
        });
    }

    /**
     * Get mouse position in NDC coordinates  (-1 to +1).
     */
    get viewportPosition() {
        return new Vec3(this.x, this.y, 0);
    }

    /**
     * Get mouse delta position (0 to width / 0 to height)
     */
    get screenPosition() {
        return new Vec3(this.dx, this.dy, 0);
    }

    // Call this at the end of your frame to reset deltas
    clear() {
        this.dx = 0;
        this.dy = 0;
    }

    lock() {
        this.isLock = true;
    }

    unlock() {
        this.isLock = false;
    }
}