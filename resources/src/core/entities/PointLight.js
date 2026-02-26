import { Entity } from "./Entity.js";

export class PointLight extends Entity {
    constructor() {
        super();
        this.data = new Float32Array([1, 1]); // [intensity, radius]
    }

    get intensity() { return this.data[0]; }
    set intensity(val) { this.data[0] = val; }

    get radius() { return this.data[1]; }
    set radius(val) { this.data[1] = val; }
}