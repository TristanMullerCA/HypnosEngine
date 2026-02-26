const r2d = 180 / Math.PI;
const d2r = Math.PI / 180;

export class Mathf {
    /**
     * @param {number} v 
     * @returns {number}
     */
    static Rad2Deg(v) {
        return v * r2d;
    }

    /**
     * @param {number} v 
     * @returns {number}
     */
    static Deg2Rad(v) {
        return v * d2r;
    }
}