import { getOrLoadResource } from "../DataPool.js";
import { Mat4 } from "../math/Mat4.js";
import { Geometry } from "../resources/Geometry.js";
import { IncludedShaders } from "../resources/IncludedShaders.js";
import { Shader } from "../resources/Shader.js";

export class LightmapBaker {
    /**
     * 
     * @param {WebGL2RenderingContext} gl 
     * @param {number} size 
     * @returns 
     */
    static generateFrameBuffer(gl, size) {
        const framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

        const targetTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, targetTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, targetTexture, 0);

        // gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        return framebuffer;
    }

    /**
     * @param {WebGL2RenderingContext} gl 
     * @param {number} size 
     * @param {Geometry} geometry 
     * @param {Mat4} modelMatrix 
     * @param {Mat4} normalMatrix 
     * @param {number[]} staticLightPos 
     * @param {number[]} staticLightPos 
     * @returns {Uint8Array<ArrayBuffer>} pixels
     */
    static bake(gl, size, geometry, modelMatrix, normalMatrix, staticLightPos, staticLightRadius) {
        if (!this.framebuffer) {
            console.debug("Generate lightmap framebuffer");
            this.framebuffer = this.generateFrameBuffer(gl, size);
        }

        // 1. Activer le framebuffer
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        gl.viewport(0, 0, size, size); // Taille de ta future texture
        gl.clearColor(0.0, 0.0, 0.0, 1.0); // Le 1.0 est crucial ici
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Use baking shader
        const shader = getOrLoadResource(Shader.name, IncludedShaders.bake.UUID, gl);
        shader.use(gl);

        const uModel = gl.getUniformLocation(shader.program, "uModelMatrix");
        const uNormalMatrix = gl.getUniformLocation(shader.program, "uNormalMatrix");
        const uLightPosLoc = gl.getUniformLocation(shader.program, "uLightPos");
        const uLightRadiusLoc = gl.getUniformLocation(shader.program, "uLightRadius");

        gl.uniformMatrix4fv(uModel, false, modelMatrix.data);
        gl.uniformMatrix4fv(uNormalMatrix, false, normalMatrix.data);
        gl.uniform3fv(uLightPosLoc, new Float32Array(staticLightPos));
        gl.uniform1fv(uLightRadiusLoc, new Float32Array(staticLightRadius));

        // Draw geometry flat
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);

        geometry.bind(gl);
        geometry.draw(gl);

        // Read pixels
        const pixels = new Uint8Array(size * size * 4);

        function flipPixels(pixels, width, height) {
            const flippedPixels = new Uint8Array(pixels.length);
            const rowSize = width * 4;
            for (let y = 0; y < height; y++) {
                const sourceRow = (height - 1 - y) * rowSize;
                const targetRow = y * rowSize;
                flippedPixels.set(pixels.subarray(sourceRow, sourceRow + rowSize), targetRow);
            }
            return flippedPixels;
        }

        gl.readPixels(0, 0, size, size, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        return flipPixels(pixels, size, size);
    }

    static async exportTexture(pixels, width, height, outputName) {
        // 1. Créer un canvas temporaire pour convertir les pixels en PNG
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const ctx = tempCanvas.getContext('2d');

        // 2. Mettre les pixels WebGL dans le canvas 2D
        const imageData = ctx.createImageData(width, height, {
            colorSpace: "srgb"
        });
        imageData.data.set(pixels);
        ctx.putImageData(imageData, 0, 0);

        // 3. Convertir en base64 puis en ArrayBuffer
        const dataUrl = tempCanvas.toDataURL('image/png');
        const base64Data = dataUrl.split(',')[1]; // On ne garde que ce qui est après la virgule

        // 4. Sauvegarder sur le PC de l'utilisateur
        await Neutralino.filesystem.writeBinaryFile(NL_PATH + '/' + outputName + '.png',
            this.convertBase64ToArrayBuffer(base64Data)
        );

        console.log("Texture exportée avec succès !");

        tempCanvas.remove();
    }

    static convertBase64ToArrayBuffer(base64) {
        // 1. On décode la chaîne base64 en une chaîne binaire brute
        const binaryString = window.atob(base64);
        const len = binaryString.length;

        // 2. On crée un buffer de la taille exacte des données
        const bytes = new Uint8Array(len);

        // 3. On remplit le buffer octet par octet
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        // 4. On retourne le buffer sous-jacent (ArrayBuffer)
        return bytes.buffer;
    }
}