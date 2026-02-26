import { DATA_POOL, getOrLoadResource } from "../DataPool.js";
import { Vec3 } from "../math/Vec3.js";
import { Cube } from "../primitives/Cube.js";
import { Geometry } from "../resources/Geometry.js";
import { IncludedShaders } from "../resources/IncludedShaders.js";
import { Shader } from "../resources/Shader.js";
import { Texture } from "../resources/Texture.js";
import { Entity } from "./Entity.js";
import { LightmapBaker } from "./LightmapBaker.js";
import { PointLight } from "./PointLight.js";
import { ReflectionProbe } from "./ReflectionProbe.js";

export class Renderer extends Entity {
    /**
     * @param {Geometry} geometry 
     * @param {Image} image 
     */
    constructor(geometry = Cube, texture = null) {
        super();
        this.geometryUUID = geometry.UUID;
        this.textureUUID = texture ? texture.UUID : null;
        this.lightMap;
        this.roughness = 1;
        this.lightmapResolution = 1024;
    }

    /**
     * @param {WebGL2RenderingContext} gl 
     */
    init(gl) {
        const geometry = getOrLoadResource(Geometry.name, this.geometryUUID, gl);

        if (this.static) {
            getOrLoadResource(Shader.name, IncludedShaders.lightmap.UUID, gl);
            this.bakeLightmap(gl, geometry);
        } else {
            getOrLoadResource(Shader.name, IncludedShaders.unlight.UUID, gl);
        }

        if (this.textureUUID) {
            getOrLoadResource(Texture.name, this.textureUUID, gl);
        }

        console.debug("Renderer initialized");
    }

    bakeLightmap(gl, geometry) {
        /** @type {PointLight[]} */
        let pointLights = Array.from(DATA_POOL.getResourcesByType(PointLight.name));
        pointLights = pointLights.sort((a, b) => {
            const aD = Vec3.sub(this.position, a.position).magnitude;
            const bD = Vec3.sub(this.position, b.position).magnitude;
            return aD - bD;
        });
        const staticLightPos = [];
        const staticLightRadius = [];
        for (const pointLight of pointLights) {
            if (pointLight.static) {
                staticLightPos.push(pointLight.position.x, pointLight.position.y, pointLight.position.z);
                staticLightRadius.push(pointLight.radius);
                if (staticLightPos.length >= (32 * 3)) break;
            }
        }
        for (let index = 0; index < (32 - staticLightPos.length / 3); index++) {
            staticLightPos.push(0, 0, 0);
            staticLightRadius.push(0);
        }
        const pixels = LightmapBaker.bake(gl, this.lightmapResolution, geometry, this.modelMatrix, this.normalMatrix, staticLightPos, staticLightRadius);

        if (!this.lightMap) this.lightMap = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.lightMap);

        // Envoyer le bitmap au GPU
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.lightmapResolution, this.lightmapResolution, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

        // Paramètres de filtrage (important pour que l'image ne soit pas floue)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        return pixels;
    }

    /**
     * @param {WebGL2RenderingContext} gl 
     * @param {Mat4} vpMatrix
     * @param {Vec3} viewPos
     * @param {boolean} reflections
     */
    render(gl, vpMatrix, viewPos, reflections = true) {
        let geometry = getOrLoadResource(Geometry.name, this.geometryUUID, gl);

        let cubemap = null;
        let cubemapResolution = 1;

        if (reflections) {
            for (const element of DATA_POOL.getResourcesByType(ReflectionProbe.name).sort((a, b) => {
                const dA = Vec3.sub(this.worldPosition, a.worldPosition).magnitude;
                const dB = Vec3.sub(this.worldPosition, b.worldPosition).magnitude;
                return dA - dB;
            })) {
                cubemap = element.cubemap;
                cubemapResolution = element.resolution;
                break;
            }
        }

        if (this.static) {
            IncludedShaders.lightmap.use(gl);

            const uVPMatrix = gl.getUniformLocation(IncludedShaders.lightmap.program, "uVPMatrix");
            gl.uniformMatrix4fv(uVPMatrix, false, vpMatrix.data);
            const uModelMatrix = gl.getUniformLocation(IncludedShaders.lightmap.program, "uModelMatrix");
            gl.uniformMatrix4fv(uModelMatrix, false, this.modelMatrix.data);

            const uViewPosLoc = gl.getUniformLocation(IncludedShaders.lightmap.program, "uViewPos");
            const uLightmapLoc = gl.getUniformLocation(IncludedShaders.lightmap.program, "uLightmap");
            const uColorMapLoc = gl.getUniformLocation(IncludedShaders.lightmap.program, "uColorMap");
            const uReflectionCubemapLoc = gl.getUniformLocation(IncludedShaders.lightmap.program, "uCubeMap");
            const uUseReflectionLoc = gl.getUniformLocation(IncludedShaders.lightmap.program, "uUseReflection");
            const uRoughnessLoc = gl.getUniformLocation(IncludedShaders.lightmap.program, "uRoughness");

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.lightMap);
            gl.uniform1i(uLightmapLoc, 0);

            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, null);
            if (this.textureUUID) {
                const texture = getOrLoadResource(Texture.name, this.textureUUID, gl);

                if (texture) {
                    texture.bind(gl);
                }
            }
            gl.uniform1i(uColorMapLoc, 1);

            gl.activeTexture(gl.TEXTURE2);
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemap);
            gl.uniform1i(uReflectionCubemapLoc, 2);

            gl.uniform3f(uViewPosLoc, viewPos.x, viewPos.y, viewPos.z);
            gl.uniform1i(uUseReflectionLoc, 1);
            gl.uniform1f(uRoughnessLoc, this.roughness * Math.floor(Math.log2(cubemapResolution)));

            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LEQUAL);
            gl.enable(gl.CULL_FACE);
            gl.cullFace(gl.BACK);
            gl.frontFace(gl.CW);

            geometry.bind(gl);
            geometry.draw(gl);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, null);

            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, null);

            gl.activeTexture(gl.TEXTURE2);
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
        } else {
            let shader = getOrLoadResource(Shader.name, IncludedShaders.unlight.UUID, gl);
            shader.use(gl);

            const uVPMatrix = gl.getUniformLocation(shader.program, "uVPMatrix");
            gl.uniformMatrix4fv(uVPMatrix, false, vpMatrix.data);

            const uModelMatrix = gl.getUniformLocation(shader.program, "uModelMatrix");
            gl.uniformMatrix4fv(uModelMatrix, false, this.modelMatrix.data);

            const uColorMapLoc = gl.getUniformLocation(shader.program, "uColorMap");
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, null);
            if (this.textureUUID) {
                const texture = getOrLoadResource(Texture.name, this.textureUUID, gl);

                if (texture) {
                    texture.bind(gl);
                }
            }
            gl.uniform1i(uColorMapLoc, 0);

            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LEQUAL);
            gl.enable(gl.CULL_FACE);
            gl.cullFace(gl.BACK);
            gl.frontFace(gl.CW);

            geometry.bind(gl);
            geometry.draw(gl);
        }
    }
}