import { Resource } from "../Resource.js";

export class Shader extends Resource {
    /**
     * @param {string} vsSource 
     * @param {string} fsSource 
     */
    constructor(vsSource, fsSource, name) {
        super();
        this.vsSource = vsSource;
        this.fsSource = fsSource;
        this.program = null;
        this.name = name;
    }

    /**
     * Charge et compile le programme complet
     * @param {string} vsPath 
     * @param {string} fsPath 
     */
    static async load(vsPath = "/resources/assets/shaders/unlight/unlight.vs.glsl", fsPath = "/resources/assets/shaders/unlight/unlight.fs.glsl") {
        const vsSource = await Neutralino.resources.readFile(vsPath);
        const fsSource = await Neutralino.resources.readFile(fsPath);
        const path = vsPath.split('/');
        return new Shader(vsSource, fsSource, path[path.length - 1]);
    }

    /**
     * @param {WebGL2RenderingContext} gl 
     */
    init(gl) {
        if (!this.program) {
            const vertexShader = this.#compile(gl, gl.VERTEX_SHADER, this.vsSource);
            const fragmentShader = this.#compile(gl, gl.FRAGMENT_SHADER, this.fsSource);

            this.program = gl.createProgram();
            gl.attachShader(this.program, vertexShader);
            gl.attachShader(this.program, fragmentShader);
            gl.linkProgram(this.program);

            if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
                throw new Error('Erreur Linker : ' + gl.getProgramInfoLog(this.program));
            }

            console.debug("Shader initialized");
        } else {
            console.debug("Shader already initialized");
        }
    }

    /**
     * @param {WebGL2RenderingContext} gl 
     * @param {number} type 
     * @param {string} source 
     * @returns {WebGLShader}
     */
    #compile(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const msg = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            throw new Error(`Erreur compilation (${type === gl.VERTEX_SHADER ? 'Vertex' : 'Fragment'}): ` + msg);
        }

        return shader;
    }

    /**
     * @param {WebGL2RenderingContext} gl 
     */
    use(gl) {
        if (!this.program) return;
        gl.useProgram(this.program);
    }
}