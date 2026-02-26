export class Vec3 {
    #data;

    constructor(x = 0, y = 0, z = 0) {
        this.#data = new Float32Array([x, y, z]);
    }

    // Accesseurs pour le confort de codage
    get x() { return this.#data[0]; }
    set x(val) { this.#data[0] = val; }

    get y() { return this.#data[1]; }
    set y(val) { this.#data[1] = val; }

    get z() { return this.#data[2]; }
    set z(val) { this.#data[2] = val; }

    get data() { return this.#data }

    /**
     * @param {Vec3} v1 
     * @param {Vec3} v2 
     * @returns {Vec3}
     */
    static add(v1, v2) {
        return new Vec3(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
    }

    /**
     * @param {Vec3} v1 
     * @param {Vec3} v2 
     * @returns {Vec3}
     */
    static sub(v1, v2) {
        return new Vec3(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
    }

    /**
     * @param {Vec3} v1 
     * @param {Vec3} v2 
     * @returns {number}
     */
    static dot(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    }

    /**
     * @param {Vec3} v 
     * @param {number} s
     * @returns {Vec3}
     */
    static mulScalar(v, s) {
        return new Vec3(v.x * s, v.y * s, v.z * s);
    }

    /**
     * @param {Vec3} v 
     * @param {number} s
     * @returns {Vec3}
     */
    static divScalar(v, s) {
        return new Vec3(v.x / s, v.y / s, v.z / s);
    }

    /**
     * @param {Vec3} v 
     * @returns {Vec3}
     */
    static normalize(v) {
        const len = v.magnitude;
        if (len > 0) {
            v.x /= len;
            v.y /= len;
            v.z /= len;
        }
        return v;
    }

    /**
     * @returns {number}
     */
    get magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }
}