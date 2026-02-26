import { getOrLoadResource } from "../DataPool.js";
import { Mat4 } from "../math/Mat4.js";
import { Vec3 } from "../math/Vec3.js";
import { IncludedShaders } from "../resources/IncludedShaders.js";
import { QuantizedGeometry } from "../resources/QuantizedGeometry.js";
import { Shader } from "../resources/Shader.js";
import { Entity } from "./Entity.js";

export class NaniteRenderer extends Entity {
    /**
     * @param {string} quantizedGeometryUUID 
     */
    constructor(quantizedGeometryUUID) {
        super();
        this.quantizedGeometryUUID = quantizedGeometryUUID;
        this.shaderUUID = IncludedShaders.nanite.UUID;
    }

    /**
     * @param {WebGL2RenderingContext} gl 
     */
    init(gl) {
        getOrLoadResource(QuantizedGeometry.name, this.quantizedGeometryUUID, gl);
        getOrLoadResource(Shader.name, this.shaderUUID, gl);
    }

    /**
     * @param {WebGL2RenderingContext} gl 
     * @param {Vec3} cameraPos 
     * @param {Mat4} cameraFrustum 
     */
    render(gl, cameraPos, cameraFrustum, vpMatrix) {
        /** @type {QuantizedGeometry} */
        const geometry = getOrLoadResource(QuantizedGeometry.name, this.quantizedGeometryUUID, gl);

        /** @type {Shader} */
        const shader = getOrLoadResource(Shader.name, this.shaderUUID, gl);

        if (geometry && shader) {
            const visibleOffsets = [];

            // const planes = NaniteRenderer.extractPlanes(cameraFrustum.data);

            for (let i = 0; i < geometry.clusters.length; i++) {
                const cluster = geometry.clusters[i];

                // if (NaniteRenderer.isSphereInFrustum(cluster.sphere, planes)) {
                    visibleOffsets.push(cluster.indexOffset);
                // }
            }

            shader.use(gl);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, geometry.vertexData.texture);

            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, geometry.indexData.texture);

            // Set uniforms for the samplers
            const uVertexTexLoc = gl.getUniformLocation(shader.program, "u_vertexData");
            gl.uniform1i(uVertexTexLoc, 0);
            const uIndexTexLoc = gl.getUniformLocation(shader.program, "u_indexData");
            gl.uniform1i(uIndexTexLoc, 1);

            const u_vTexSize = gl.getUniformLocation(shader.program, "u_vTexSize");
            gl.uniform2ui(u_vTexSize, geometry.vertexData.width, geometry.vertexData.height);
            const u_iTexSize = gl.getUniformLocation(shader.program, "u_iTexSize");
            gl.uniform2ui(u_iTexSize, geometry.indexData.width, geometry.indexData.height);

            const uVPMatrix = gl.getUniformLocation(shader.program, "uVPMatrix");
            gl.uniformMatrix4fv(uVPMatrix, false, vpMatrix.data);
            const uModelMatrix = gl.getUniformLocation(shader.program, "uModelMatrix");
            gl.uniformMatrix4fv(uModelMatrix, false, this.modelMatrix.data);

            const u_meshMin = gl.getUniformLocation(shader.program, "u_meshMin");
            gl.uniform3fv(u_meshMin, geometry.min);
            const u_meshSize = gl.getUniformLocation(shader.program, "u_meshSize");
            gl.uniform3fv(u_meshSize, geometry.size);

            // 4. Update the dynamic buffer and draw
            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LEQUAL);
            gl.disable(gl.CULL_FACE);
            gl.cullFace(gl.BACK);
            gl.frontFace(gl.CCW);

            gl.bindVertexArray(geometry.vao);
            gl.bindBuffer(gl.ARRAY_BUFFER, geometry.instanceBuffer);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Uint32Array(visibleOffsets));
            gl.drawArraysInstanced(gl.TRIANGLES, 0, 384, visibleOffsets.length);
        }
    }

    static extractPlanes(m) {
        // m is your 4x4 View-Projection Matrix
        const planes = new Float32Array(24); // 6 planes * 4 coefficients (A, B, C, D)

        // Left Plane
        planes[0] = m[3] + m[0]; planes[1] = m[7] + m[4]; planes[2] = m[11] + m[8]; planes[3] = m[15] + m[12];
        // Right Plane
        planes[4] = m[3] - m[0]; planes[5] = m[7] - m[4]; planes[6] = m[11] - m[8]; planes[7] = m[15] - m[12];
        // Bottom Plane
        planes[8] = m[3] + m[1]; planes[9] = m[7] + m[5]; planes[10] = m[11] + m[9]; planes[11] = m[15] + m[13];
        // Top Plane
        planes[12] = m[3] - m[1]; planes[13] = m[7] - m[5]; planes[14] = m[11] - m[9]; planes[15] = m[15] - m[13];
        // Near Plane
        planes[16] = m[3] + m[2]; planes[17] = m[7] + m[6]; planes[18] = m[11] + m[10]; planes[19] = m[15] + m[14];
        // Far Plane
        planes[20] = m[3] - m[2]; planes[21] = m[7] - m[6]; planes[22] = m[11] - m[10]; planes[23] = m[15] - m[14];

        // Normalize each plane for accurate distance calculations
        for (let i = 0; i < 6; i++) {
            const offset = i * 4;
            const length = Math.sqrt(planes[offset] ** 2 + planes[offset + 1] ** 2 + planes[offset + 2] ** 2);
            planes[offset] /= length;
            planes[offset + 1] /= length;
            planes[offset + 2] /= length;
            planes[offset + 3] /= length;
        }
        return planes;
    }

    static isSphereInFrustum(sphere, planes) {
        const r = sphere.radius;
        const { x, y, z } = sphere.center;

        for (let i = 0; i < 6; i++) {
            const offset = i * 4;
            // Dot product of plane normal (A, B, C) and sphere center (x, y, z) + D
            const distance = planes[offset] * x + planes[offset + 1] * y + planes[offset + 2] * z + planes[offset + 3];

            if (distance < -r) {
                return false; // Fully outside one of the planes
            }
        }
        
        return true; // Partially or fully inside the frustum
    }
}