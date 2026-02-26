import { Geometry } from "../resources/Geometry.js";
import { JSONEncoder } from "./JSONEncoder.js";

export class GeometryLoader {
    /**
     * @param {string} filename 
     */
    static async load(filename = "tmp") {
        try {
            const binaryData = await Neutralino.filesystem.readBinaryFile(NL_PATH + '/assets/' + filename + '.geo');
            const json = JSONEncoder.decode(new Uint8Array(binaryData));

            const geometry = new Geometry(json.vertices, json.uvs, json.normals, json.indices);
            geometry.UUID = json.UUID;
            geometry.mode = json.mode;
            return geometry;
        } catch (error) {
            console.error(error.message);
        }
    }

    /**
     * @param {Geometry} geometry 
     * @param {string} filename 
     */
    static async save(geometry, filename = "tmp") {
        try {
            const json = {
                UUID: geometry.UUID,
                vertices: geometry.vertices,
                normals: geometry.normals,
                uvs: geometry.uvs,
                indices: geometry.indices,
                mode: geometry.mode
            };

            const encoded = JSONEncoder.encode(json);
            await Neutralino.filesystem.writeBinaryFile(NL_PATH + '/assets/' + filename + '.geo', encoded.buffer);
        } catch (error) {
            console.error(error.message);
        }
    }
}