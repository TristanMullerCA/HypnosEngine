import { Shader } from "./Shader.js";

export class IncludedShaders {
    static #UNLIGHT_SHADER;
    static #BAKE_SHADER;
    static #LIGHTMAP_SHADER;
    static #COLOR_SHADER;
    static #POSITION_SHADER;
    static #NANITE_SHADER;

    static async load() {
        IncludedShaders.#UNLIGHT_SHADER = await Shader.load(
            "/resources/assets/shaders/unlight/unlight.vs.glsl",
            "/resources/assets/shaders/unlight/unlight.fs.glsl",
        );
        IncludedShaders.#UNLIGHT_SHADER.UUID = "UNLIGHT_SHADER";

        IncludedShaders.#BAKE_SHADER = await Shader.load(
            "/resources/assets/shaders/bake/bake.vs.glsl",
            "/resources/assets/shaders/bake/bake.fs.glsl",
        );
        IncludedShaders.#BAKE_SHADER.UUID = "BAKE_SHADER";

        IncludedShaders.#LIGHTMAP_SHADER = await Shader.load(
            "/resources/assets/shaders/lightmap/lightmap.vs.glsl",
            "/resources/assets/shaders/lightmap/lightmap.fs.glsl",
        );
        IncludedShaders.#LIGHTMAP_SHADER.UUID = "LIGHTMAP_SHADER";

        IncludedShaders.#COLOR_SHADER = await Shader.load(
            "/resources/assets/shaders/color/color.vs.glsl",
            "/resources/assets/shaders/color/color.fs.glsl",
        );
        IncludedShaders.#COLOR_SHADER.UUID = "COLOR_SHADER";

        IncludedShaders.#POSITION_SHADER = await Shader.load(
            "/resources/assets/shaders/position/position.vs.glsl",
            "/resources/assets/shaders/position/position.fs.glsl",
        );
        IncludedShaders.#POSITION_SHADER.UUID = "POSITION_SHADER";

        IncludedShaders.#NANITE_SHADER = await Shader.load(
            "/resources/assets/shaders/nanite/nanite.vs.glsl",
            "/resources/assets/shaders/nanite/nanite.fs.glsl",
        );
        IncludedShaders.#NANITE_SHADER.UUID = "NANITE_SHADER";
    }

    /**
     * @type {Shader}
     */
    static get unlight() {
        return IncludedShaders.#UNLIGHT_SHADER;
    }

    /**
     * @type {Shader}
     */
    static get bake() {
        return IncludedShaders.#BAKE_SHADER;
    }

    /**
     * @type {Shader}
     */
    static get lightmap() {
        return IncludedShaders.#LIGHTMAP_SHADER;
    }

    /**
     * @type {Shader}
     */
    static get color() {
        return IncludedShaders.#COLOR_SHADER;
    }

    /**
     * @type {Shader}
     */
    static get position() {
        return IncludedShaders.#POSITION_SHADER;
    }

    /**
     * @type {Shader}
     */
    static get nanite() {
        return IncludedShaders.#NANITE_SHADER;
    }
}