import { Resource } from "../Resource.js";

export class Texture extends Resource {
    /**
     * @param {ImageBitmap} bitmap 
     */
    constructor(bitmap) {
        super();
        this.bitmap = bitmap;
        this.textureId;
    }

    /**
     * @param {WebGL2RenderingContext} gl 
     */
    init(gl) {
        if (this.textureId) return;
        
        if (!this.bitmap) {
            console.warn("No image bitmap");
            return;
        }

        // Create the texture object
        const texture = gl.createTexture();

        // Bind it (make it the "active" texture)
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Set parameters (Essential for non-power-of-two images)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        // Upload the pixels to the GPU
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,                // Level of detail (0 is base)
            gl.RGBA,          // Internal format
            gl.RGBA,          // Format of source data
            gl.UNSIGNED_BYTE, // Data type
            this.bitmap             // The actual Image/Canvas/Video element
        );

        this.textureId = texture;
    }

    /**
     * @param {WebGL2RenderingContext} gl 
     */
    bind(gl) {
        if (!this.textureId) this.init(gl);
        gl.bindTexture(gl.TEXTURE_2D, this.textureId);
    }

    /**
     * @param {WebGL2RenderingContext} gl 
     */
    unbind(gl) {
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
}