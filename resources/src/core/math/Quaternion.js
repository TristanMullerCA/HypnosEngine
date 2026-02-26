export class Quaternion {
    #data;

    constructor() {
        this.#data = new Float32Array([0,0,0,1]); // x, y, z, w
    }

    /**
     * Convert Euler (degrees) to Quaternion
     * @param {number} x 
     * @param {number} y 
     * @param {number} z
     * @returns {Quaternion}
     */
    fromEuler(x, y, z) {
        const toRad = Math.PI / 180;
        const c1 = Math.cos(x * toRad / 2);
        const s1 = Math.sin(x * toRad / 2);
        const c2 = Math.cos(y * toRad / 2);
        const s2 = Math.sin(y * toRad / 2);
        const c3 = Math.cos(z * toRad / 2);
        const s3 = Math.sin(z * toRad / 2);

        // XYZ order (can be changed based on preference)
        this.data[0] = s1 * c2 * c3 + c1 * s2 * s3;
        this.data[1] = c1 * s2 * c3 - s1 * c2 * s3;
        this.data[2] = c1 * c2 * s3 + s1 * s2 * c3;
        this.data[3] = c1 * c2 * c3 - s1 * s2 * s3;
        
        return this.normalize();
    }

    /**
     * @returns {Quaternion}
     */
    normalize() {
        let [x, y, z, w] = this.data;
        const len = Math.sqrt(x * x + y * y + z * z + w * w);
        if (len > 0) {
            const invLen = 1 / len;
            this.data[0] *= invLen;
            this.data[1] *= invLen;
            this.data[2] *= invLen;
            this.data[3] *= invLen;
        }
        return this;
    }

    get data() { return this.#data };
}