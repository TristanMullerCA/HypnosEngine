import { ClassRegistry } from "./ClassRegistry.js";
import { JSONEncoder } from "./JSONEncoder.js";

export class SceneLoader {
    static async load(filename = "tmp") {
        try {
            // Read the file (returns a string)
            const binaryData = await Neutralino.filesystem.readBinaryFile(NL_PATH + '/assets/' + filename + '.scene');

            // Decode binary file content and back into a JS object
            const json = JSONEncoder.decode(new Uint8Array(binaryData));

            // Convert JSON object to an Entity class
            if (json) {
                const classRegistryEntry = ClassRegistry[json.type];

                if (classRegistryEntry) {
                    const TargetClass = classRegistryEntry.type;
                    const entity = new TargetClass();
                    const loader = classRegistryEntry.loader;
                    await loader.parse(entity, json);
                    return entity;
                } else {
                    console.warn(`Class type '${json.type}' not recognized`);
                }
            }

            return null;
        } catch (err) {
            // Handle case where file doesn't exist or is corrupted
            console.error("Could not read file:", err);
        }
    }

    static async save(root, filename = "tmp") {
        try {
            const classRegistryEntry = ClassRegistry[root.constructor.name];

            if (classRegistryEntry) {
                const loader = classRegistryEntry.loader;

                // Convert entity to a JSON object
                const json = loader.toJSON(root);

                // Encode to binary
                const encoded = JSONEncoder.encode(json);

                // Write to the filesystem
                await Neutralino.filesystem.writeBinaryFile(NL_PATH + '/assets/' + filename + '.scene', encoded.buffer);

                console.log("File saved successfully!");
            }
        } catch (err) {
            console.error("Failed to save file:", err);
        }
    }
}