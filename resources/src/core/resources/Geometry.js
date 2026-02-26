import { Resource } from "../Resource.js";

export const DrawMode = {
    TRIANGLE: 4,
    LINES: 1,
    LINESTRIP: 3,
};

export class Geometry extends Resource {
    /**
     * @param {Float32Array} vertices
     * @param {Float32Array} uvs
     * @param {Float32Array} normals
     * @param {Int32Array} indices
     */
    constructor(vertices, uvs, normals, indices) {
        super();
        this.vertices = vertices;
        this.uvs = uvs;
        this.normals = normals;
        this.indices = indices;
        this.mode = DrawMode.TRIANGLE;
        this.faces = indices.length;
    }

    /**
     * @param {WebGL2RenderingContext} gl 
     */
    init(gl) {
        if (this.vao) return;

        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        // VBO (Positions)
        const vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

        this.vertices = null; // clean up

        // VBO (UVs)
        const vboUV = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vboUV);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.uvs), gl.STATIC_DRAW);
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(1);

        this.uvs = null; // clean up

        // VBO (Normals)
        const vboNormal = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vboNormal);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW);
        gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0); // Location 2
        gl.enableVertexAttribArray(2);

        this.normals = null; // clean up

        // IBO (Indices)
        const ibo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int32Array(this.indices), gl.STATIC_DRAW);

        this.indices = null; // clean up

        console.debug("Geometry initialized");
    }

    /**
     * @param {WebGL2RenderingContext} gl 
     */
    bind(gl) {
        if (!this.vao) return;
        gl.bindVertexArray(this.vao);
    }

    unbind(gl) {
        gl.bindVertexArray(null);
    }

    /**
     * @param {WebGL2RenderingContext} gl 
     */
    draw(gl) {
        if (!this.vao) return;
        gl.drawElements(this.mode, this.faces, gl.UNSIGNED_INT, 0);
    }

    /**
     * @param {WebGL2RenderingContext} gl 
     * @param {number} instanceCount
     */
    drawInstanced(gl, instanceCount) {
        gl.drawElementsInstanced(this.mode, this.faces, gl.UNSIGNED_INT, 0, instanceCount);
    }
}