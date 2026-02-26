import { QuantizedGeometry } from "../resources/QuantizedGeometry.js";
import { FileLoader } from "./FileLoader.js";

export class QuantizedGeometryLoader {
    /**
     * @param {string} url 
     * @returns {Promise<QuantizedGeometry>}
     */
    static async loadAndParseOBJ(url) {
        const data = await FileLoader.read(url);

        const positions = []; // Temp storage for 'v' lines
        const rawPositions = []; // Final flat array for processMesh

        const lines = data.split('\n');

        for (let line of lines) {
            const parts = line.trim().split(/\s+/);
            if (parts[0] === 'v') {
                // It's a vertex: v x y z
                positions.push([
                    parseFloat(parts[1]),
                    parseFloat(parts[2]),
                    parseFloat(parts[3])
                ]);
            } else if (parts[0] === 'f') {
                // It's a face: f v1 v2 v3 (Note: OBJ indices start at 1)
                for (let i = 1; i <= 3; i++) {
                    const vIdx = parseInt(parts[i].split('/')[0]) - 1;
                    rawPositions.push(...positions[vIdx]);
                }
            }
        }

        return QuantizedGeometry.quantize(new Float32Array(rawPositions));
    }
}