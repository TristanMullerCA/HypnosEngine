import { DrawMode, Geometry } from "../resources/Geometry.js";

function createWireSphere(radius, rings = 16, slices = 16) {
    const vertices = [];
    const indices = [];

    // 1. Generate Vertices
    for (let r = 0; r <= rings; r++) {
        // phi goes from 0 to PI (top to bottom)
        const phi = (r * Math.PI) / rings;
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);

        for (let s = 0; s <= slices; s++) {
            // theta goes from 0 to 2PI (around the sphere)
            const theta = (s * 2 * Math.PI) / slices;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);

            const x = radius * sinPhi * cosTheta;
            const y = radius * cosPhi;
            const z = radius * sinPhi * sinTheta;

            vertices.push(x, y, z);
        }
    }

    // 2. Generate Indices (Grid Lines)
    for (let r = 0; r < rings; r++) {
        for (let s = 0; s < slices; s++) {
            const first = r * (slices + 1) + s;
            const second = first + slices + 1;

            // Horizontal lines (rings)
            indices.push(first, first + 1);

            // Vertical lines (slices)
            indices.push(first, second);
        }
    }

    return {
        vertices: new Float32Array(vertices),
        indices: new Uint16Array(indices)
    };
}

const generated = createWireSphere(1, 16, 16);
export const WireSphere = new Geometry(generated.vertices, [], [], generated.indices);
WireSphere.UUID = "WIRESPHERE";
WireSphere.mode = DrawMode.LINES;