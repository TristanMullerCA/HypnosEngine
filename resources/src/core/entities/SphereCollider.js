import { getOrLoadResource } from "../DataPool.js";
import { Vec3 } from "../math/Vec3.js";
import { WireSphere } from "../primitives/WireSphere.js";
import { Geometry } from "../resources/Geometry.js";
import { IncludedShaders } from "../resources/IncludedShaders.js";
import { Shader } from "../resources/Shader.js";
import { Collider } from "./Collider.js";

export class SphereCollider extends Collider {
    /**
     * @param {number} radius 
     */
    constructor(radius = 0.5) {
        super();
        this.radius = radius;
    }

    updateTransformations() {
        this.rotation = new Vec3();
        this.scale = new Vec3(this.radius, this.radius, this.radius);
        super.updateTransformations();
    }

    /**
         * @param {WebGL2RenderingContext} gl 
         */
    init(gl) {
        getOrLoadResource(Shader.name, IncludedShaders.color.UUID, gl);
        getOrLoadResource(Geometry.name, WireSphere.UUID, gl);
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

        const geometry = getOrLoadResource(Geometry.name, WireSphere.UUID, gl);
        geometry.bind(gl);
        geometry.draw(gl);
    }
}