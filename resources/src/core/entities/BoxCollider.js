import { getOrLoadResource } from "../DataPool.js";
import { Mat4 } from "../math/Mat4.js";
import { Vec3 } from "../math/Vec3.js";
import { Wirecube } from "../primitives/Wirecube.js";
import { Geometry } from "../resources/Geometry.js";
import { IncludedShaders } from "../resources/IncludedShaders.js";
import { Shader } from "../resources/Shader.js";
import { Collider } from "./Collider.js";

export class BoxCollider extends Collider {
    /**
     * @param {Vec3} size La taille totale (largeur, hauteur, profondeur)
     */
    constructor(size = new Vec3(1, 1, 1)) {
        super();
        this.size = size;
    }

    updateTransformations() {
        if (this.static == false || !this.modelMatrix) {
            this.translationMatrix = Mat4.translation(this.position.x, this.position.y, this.position.z);
            this.scaleMatrix = Mat4.scale(this.size.x, this.size.y, this.size.z);
            let mMat = Mat4.multiply(this.translationMatrix, this.scaleMatrix);
            if (this.parent) {
                mMat = Mat4.multiply(this.parent.modelMatrix, mMat);
                const data = mMat.data;
                const sx = Math.sqrt(data[0] ** 2 + data[1] ** 2 + data[2] ** 2);
                const sy = Math.sqrt(data[4] ** 2 + data[5] ** 2 + data[6] ** 2);
                const sz = Math.sqrt(data[8] ** 2 + data[9] ** 2 + data[10] ** 2);
                data[0] = sx; data[1] = 0; data[2] = 0;
                data[4] = 0; data[5] = sy; data[6] = 0;
                data[8] = 0; data[9] = 0; data[10] = sz;
                mMat.data = data;
            }
            this.modelMatrix = mMat;
            const wm = mMat.data;
            this.worldPosition = new Vec3(wm[12], wm[13], wm[14]);
        }

        for (const child of this.children) {
            child.updateTransformations();
        }
    }

    get min() {
        return new Vec3(
            this.worldPosition.x - this.size.x / 2,
            this.worldPosition.y - this.size.y / 2,
            this.worldPosition.z - this.size.z / 2
        );
    }

    get max() {
        return new Vec3(
            this.worldPosition.x + this.size.x / 2,
            this.worldPosition.y + this.size.y / 2,
            this.worldPosition.z + this.size.z / 2
        );
    }

    /**
     * @param {WebGL2RenderingContext} gl 
     */
    init(gl) {
        getOrLoadResource(Shader.name, IncludedShaders.color.UUID, gl);
        getOrLoadResource(Geometry.name, Wirecube.UUID, gl);
    }

    /**
     * @param {WebGL2RenderingContext} gl 
     * @param {Mat4} vpMatrix 
     * @param {Vec3} viewPosition 
     */
    render(gl, vpMatrix, viewPosition) {
        const shader = getOrLoadResource(Shader.name, IncludedShaders.color.UUID, gl);
        shader.use(gl);

        const uVPMatrix = gl.getUniformLocation(shader.program, "uVPMatrix");
        const uModel = gl.getUniformLocation(shader.program, "uModelMatrix");
        const uColor = gl.getUniformLocation(shader.program, "uColor");

        gl.uniformMatrix4fv(uVPMatrix, false, vpMatrix.data);
        gl.uniformMatrix4fv(uModel, false, this.modelMatrix.data);

        let color = new Float32Array(this.color);
        gl.uniform4fv(uColor, color);

        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.disable(gl.CULL_FACE);
        gl.frontFace(gl.CW);

        const geometry = getOrLoadResource(Geometry.name, Wirecube.UUID, gl);
        geometry.bind(gl);
        geometry.draw(gl);
    }

    /**
     * Obtenir la normale (le vecteur qui pointe vers l'extérieur de la face touchée)
     * @param {AABB} other 
     */
    getCollisionNormal(other) {
        // Distance entre les centres
        const dx = other.position.x - this.position.x;
        const dy = other.position.y - this.position.y;
        const dz = other.position.z - this.position.z;

        // Calcul du chevauchement combiné sur chaque axe
        const combinedHalfWidth = (this.size.x + other.size.x) / 2;
        const combinedHalfHeight = (this.size.y + other.size.y) / 2;
        const combinedHalfDepth = (this.size.z + other.size.z) / 2;

        // Calcul de la pénétration sur chaque axe
        const overlapX = combinedHalfWidth - Math.abs(dx);
        const overlapY = combinedHalfHeight - Math.abs(dy);
        const overlapZ = combinedHalfDepth - Math.abs(dz);

        // La normale est sur l'axe où la pénétration est la plus FAIBLE
        if (overlapX < overlapY && overlapX < overlapZ) {
            return new Vec3(dx > 0 ? 1 : -1, 0, 0);
        } else if (overlapY < overlapZ) {
            return new Vec3(0, dy > 0 ? 1 : -1, 0);
        } else {
            return new Vec3(0, 0, dz > 0 ? 1 : -1);
        }
    }
}