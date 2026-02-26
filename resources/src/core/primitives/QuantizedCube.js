import { FileLoader } from "../io/FileLoader.js";
import { QuantizedGeometryLoader } from "../io/QuantizedGeometryLoader.js";
import { QuantizedGeometry } from "../resources/QuantizedGeometry.js";

const rawPositions = new Float32Array([
    // Front face
    -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5,
    -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5,

    // Back face
    -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5,
    -0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5,

    // Top face
    -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5,
    -0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5,

    // Bottom face
    -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5,
    -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5,

    // Right face
    0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5,
    0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5,

    // Left face
    -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5,
    -0.5, -0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5
]);


let QUANTIZED_CUBE = null;

async function loadBunny() {
    if (!QUANTIZED_CUBE) QUANTIZED_CUBE = await QuantizedGeometryLoader.loadAndParseOBJ(NL_PATH + "/bunny.obj");
    // if (!QUANTIZED_CUBE) QUANTIZED_CUBE = QuantizedGeometry.quantize(rawPositions);
    QUANTIZED_CUBE.UUID = "QUANTIZED_CUBE";
}

export { QUANTIZED_CUBE, loadBunny };