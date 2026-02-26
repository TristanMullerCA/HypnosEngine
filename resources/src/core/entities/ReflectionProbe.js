import { DATA_POOL } from "../DataPool.js";
import { Mat4 } from "../math/Mat4.js";
import { Mathf } from "../math/Mathf.js";
import { Vec3 } from "../math/Vec3.js";
import { Entity } from "./Entity.js";
import { LightmapBaker } from "./LightmapBaker.js";
import { Renderer } from "./Renderer.js";

export class ReflectionProbe extends Entity {
    /**
     * @param {number} resolution 
     */
    constructor(resolution = 512) {
        super();
        this.data = new Uint32Array([resolution]);
    }

    get resolution() { return this.data[0] }
    set resolution(value) { this.data[0] = value }

    /**
     * @param {WebGL2RenderingContext} gl 
     */
    init(gl) {
        this.cubemap = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.cubemap);

        for (let i = 0; i < 6; i++) {
            gl.texImage2D(
                gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
                0, gl.RGBA, this.resolution, this.resolution, 0,
                gl.RGBA, gl.UNSIGNED_BYTE, null
            );
        }

        // Set filtering (Linear is usually best for reflections)
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        this.fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);

        this.depthBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT24, this.resolution, this.resolution);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.depthBuffer);

        // 3. Define Face Views (Target, Up)
        const angle = Mathf.Deg2Rad(90);

        // this.faceConfigs = [
        //     new Vec3(1, 0, 0),
        //     new Vec3(-1, 0, 0),
        //     new Vec3(0, -1, 0),
        //     new Vec3(0, 1, 0),
        //     new Vec3(0, 0, 1),
        //     new Vec3(0, 0, -1)
        // ];

        this.faceConfigs = [
            new Vec3(0, -angle, 0),
            new Vec3(0, angle, 0),
            new Vec3(-angle, 0, 0),
            new Vec3(angle, 0, 0),
            new Vec3(0, 0, 0),
            new Vec3(0, angle*2, 0)
        ];
    }

    /**
     * @param {WebGL2RenderingContext} gl 
     */
    bake(gl) {
        if (!this.cubemap) this.init(gl);

        const projectionMatrix = Mat4.perspective(Math.PI / 2, 1, 0.01, 1000); // 90-degree FOV

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
        gl.viewport(0, 0, this.resolution, this.resolution);

        const debugColors = [
            [1, 0, 0, 1],
            [0, 1, 0, 1],
            [0, 0, 1, 1],
            [0, 1, 1, 1],
            [1, 1, 0, 1],
            [1, 0, 1, 1],
        ]

        this.faceConfigs.forEach((config, i) => {
            // const target = Vec3.add(this.worldPosition, config.target);
            // const viewMatrix = Mat4.lookAt(this.worldPosition, target, config.up);
            const viewMatrix = Mat4.rotationXYZ(config.x, config.y, config.z);
            console.log(config);
            const vpMatrix = Mat4.multiply(projectionMatrix, viewMatrix);

            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
                gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, this.cubemap, 0);

            // gl.clearColor(debugColors[i][0], debugColors[i][1], debugColors[i][2], debugColors[i][3]);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            // Draw renderers
            /** @type {Renderer[]} */
            const renderers = Array.from(DATA_POOL.getResourcesByType(Renderer.name));

            for (const renderer of renderers) {
                renderer.render(gl, vpMatrix, this.worldPosition, false);
            }
        });

        // Generate mipmaps for rough reflections
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.cubemap);
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    }

    /**
     * @param {WebGL2RenderingContext} gl 
     * @param {WebGLTexture} cubemap 
     * @param {number} resolution 
     */
    static async exportCubemap(gl, cubemap, resolution) {
        // 1. Create a helper Framebuffer
        const fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

        // 2. Prepare a 2D canvas to handle the conversion to PNG
        const canvas2d = document.createElement('canvas');
        canvas2d.width = resolution;
        canvas2d.height = resolution;
        const ctx2d = canvas2d.getContext('2d');

        const faceNames = ['posx', 'negx', 'posy', 'negy', 'posz', 'negz'];

        faceNames.forEach(async (name, i) => {
            // 3. Attach the specific face to the FBO
            gl.framebufferTexture2D(
                gl.FRAMEBUFFER,
                gl.COLOR_ATTACHMENT0,
                gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
                cubemap,
                0
            );

            // 4. Read the pixels from the GPU
            const pixels = new Uint8Array(resolution * resolution * 4);
            gl.readPixels(0, 0, resolution, resolution, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

            // 5. WebGL pixels are bottom-to-top, but Canvas is top-to-bottom. 
            // We need to flip the rows or use a vertical flip in our draw logic.
            const imageData = ctx2d.createImageData(resolution, resolution);

            // Flip rows while copying
            for (let y = 0; y < resolution; y++) {
                for (let x = 0; x < resolution; x++) {
                    const iwebgl = ((resolution - 1 - y) * resolution + x) * 4;
                    const icanvas = (y * resolution + x) * 4;
                    imageData.data[icanvas] = pixels[iwebgl];     // R
                    imageData.data[icanvas + 1] = pixels[iwebgl + 1]; // G
                    imageData.data[icanvas + 2] = pixels[iwebgl + 2]; // B
                    imageData.data[icanvas + 3] = pixels[iwebgl + 3]; // A
                }
            }

            ctx2d.putImageData(imageData, 0, 0);

            // 3. Convertir en base64 puis en ArrayBuffer
            const dataUrl = canvas2d.toDataURL('image/png');
            const base64Data = dataUrl.split(',')[1]; // On ne garde que ce qui est après la virgule

            // 4. Sauvegarder sur le PC de l'utilisateur
            await Neutralino.filesystem.writeBinaryFile(`${NL_PATH}/${i}_cubemap_${name}.png`,
                LightmapBaker.convertBase64ToArrayBuffer(base64Data)
            );

        });

        // Cleanup
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.deleteFramebuffer(fbo);

        canvas2d.remove();

        console.debug("Reflection probe exported");
    }
}