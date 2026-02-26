import { Vec3 } from "./Vec3.js";

export class Mat4 {
    constructor() {
        this.data = new Float32Array(16);
    }

    static from(data) {
        const mat = new Mat4();
        mat.data = new Float32Array(data);
        return mat;
    }

    // Multiplication de deux matrices (A * B)
    static multiply(a, b) {
        const out = new Float32Array(16);
        for (let i = 0; i < 4; i++) { // Ligne
            for (let j = 0; j < 4; j++) { // Colonne
                out[j * 4 + i] =
                    a.data[0 * 4 + i] * b.data[j * 4 + 0] +
                    a.data[1 * 4 + i] * b.data[j * 4 + 1] +
                    a.data[2 * 4 + i] * b.data[j * 4 + 2] +
                    a.data[3 * 4 + i] * b.data[j * 4 + 3];
            }
        }
        return Mat4.from(out);
    }

    static identity() {
        return Mat4.from(new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]));
    }

    static inverse(matrix) {
        const m = matrix.data;
        const out = new Float32Array(16);

        // 1. Extract and Transpose the 3x3 Rotation part
        const m00 = m[0], m01 = m[1], m02 = m[2];
        const m10 = m[4], m11 = m[5], m12 = m[6];
        const m20 = m[8], m21 = m[9], m22 = m[10];

        out[0] = m00; out[1] = m10; out[2] = m20; out[3] = 0;
        out[4] = m01; out[5] = m11; out[6] = m21; out[7] = 0;
        out[8] = m02; out[9] = m12; out[10] = m22; out[11] = 0;

        // 2. Get World Translation (the camera's world position)
        const tx = m[12];
        const ty = m[13];
        const tz = m[14];

        // 3. Calculate new translation: -dot(Row, Translation)
        // This effectively moves the world relative to the camera's orientation
        out[12] = -(m00 * tx + m01 * ty + m02 * tz);
        out[13] = -(m10 * tx + m11 * ty + m12 * tz);
        out[14] = -(m20 * tx + m21 * ty + m22 * tz);
        out[15] = 1;

        return Mat4.from(out);
    }

    static translation(tx, ty, tz) {
        let m = Mat4.identity().data;
        m[12] = tx; m[13] = ty; m[14] = tz;
        return Mat4.from(m);
    }

    static rotationX(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        return Mat4.from(new Float32Array([
            1, 0, 0, 0,
            0, c, s, 0,
            0, -s, c, 0,
            0, 0, 0, 1
        ]));
    }

    static rotationY(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        return Mat4.from(new Float32Array([
            c, 0, -s, 0,
            0, 1, 0, 0,
            s, 0, c, 0,
            0, 0, 0, 1
        ]));
    }

    static rotationZ(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        return Mat4.from(new Float32Array([
            c, s, 0, 0,
            -s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]));
    }

    static rotationXYZ(x, y, z) {
        const mX = Mat4.rotationX(x);
        const mY = Mat4.rotationY(y);
        const mZ = Mat4.rotationZ(z);

        // Multiplication : Resultat = Z * Y * X
        let tmp = Mat4.multiply(mZ, mY);
        return Mat4.multiply(tmp, mX);
    }

    static scale(x, y, z) {
        const out = new Float32Array(16);
        out[0] = x; out[1] = 0; out[2] = 0; out[3] = 0;
        out[4] = 0; out[5] = y; out[6] = 0; out[7] = 0;
        out[8] = 0; out[9] = 0; out[10] = z; out[11] = 0;
        out[12] = 0; out[13] = 0; out[14] = 0; out[15] = 1;
        return Mat4.from(out);
    }


    /**
     * Generates a look-at matrix.
     * @param {Vec3} eye - Camera position [x, y, z]
     * @param {Vec3} target - Where the camera is looking [x, y, z]
     * @param {Vec3} up - The 'up' direction (usually [0, 1, 0])
     * @returns {Mat4} this - For chaining
    */
    static lookAt(eye, target, up) {
        // 1. Calculate Z axis (Forward)
        let z0 = eye.x - target.x;
        let z1 = eye.y - target.y;
        let z2 = eye.z - target.z;

        // Normalize Z
        let len = Math.hypot(z0, z1, z2);

        if (len === 0) {
            z0 = 0; z1 = 0; z2 = 0;
        }
        else {
            len = 1 / len;
            z0 *= len; z1 *= len; z2 *= len;
        }

        // 2. Calculate X axis (Right): Up cross Z
        let x0 = up.y * z2 - up.z * z1;
        let x1 = up.z * z0 - up.x * z2;
        let x2 = up.x * z1 - up.y * z0;

        // Normalize X
        len = Math.hypot(x0, x1, x2);
        if (len === 0) { x0 = 0; x1 = 0; x2 = 0; } else {
            len = 1 / len;
            x0 *= len; x1 *= len; x2 *= len;
        }

        // 3. Calculate Y axis (Up): Z cross X
        let y0 = z1 * x2 - z2 * x1;
        let y1 = z2 * x0 - z0 * x2;
        let y2 = z0 * x1 - z1 * x0;

        // 4. Set Matrix values (Column-Major)
        // Indices:
        // 0  4  8  12
        // 1  5  9  13
        // 2  6  10 14
        // 3  7  11 15

        const out = new Float32Array(16); // Assuming your class stores data in this.data
        out[0] = x0;
        out[1] = y0;
        out[2] = z0;
        out[3] = 1;
        out[4] = x1;
        out[5] = y1;
        out[6] = z2; // Corrected Z alignment
        out[7] = 1;
        out[8] = x2;
        out[9] = y2;
        out[10] = z2;
        out[11] = 1;

        // Translation part: -dot(axis, eye)
        out[12] = -(x0 * eye.x + x1 * eye.y + x2 * eye.z);
        out[13] = -(y0 * eye.x + y1 * eye.y + y2 * eye.z);
        out[14] = -(z0 * eye.x + z1 * eye.y + z2 * eye.z);
        out[15] = 1;

        return Mat4.from(out);
    }

    static perspective(fov, aspect, near, far) {
        let f = 1.0 / Math.tan(fov / 2);
        let rangeInv = 1.0 / (near - far);
        let m = new Float32Array(16);
        m[0] = f / aspect;
        m[5] = f;
        m[10] = (far + near) * rangeInv;
        m[11] = -1;
        m[14] = (2 * far * near) * rangeInv;
        return Mat4.from(m);
    }
}