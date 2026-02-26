import { AudioClip } from "../resources/AudioClip.js";
import { FileExplorer } from "./FileExplorer.js";

export class AudioClipLoader {
    /**
         * @param {string} filename 
         */
    static async load(filename = "tmp") {
        try {
            const binaryData = await Neutralino.filesystem.readBinaryFile(NL_PATH + '/assets/' + filename + '.clip');

            const uuidLength = 36; // Standard UUID length
            const offset = binaryData.byteLength - uuidLength;

            const uuidBytes = binaryData.slice(offset);
            const decoder = new TextDecoder();
            const uuid = decoder.decode(uuidBytes);

            const audioData = binaryData.slice(0, binaryData.byteLength - uuidLength);
            const audioclip = new AudioClip(audioData);
            audioclip.UUID = uuid;
            return audioclip;
        } catch (error) {
            console.error(error.message);
        }
    }

    /**
     * @param {AudioClip} audioclip 
     * @param {string} filename 
     */
    static async save(audioclip, filename = "tmp") {
        try {
            const arrayBuffer = audioclip.buffer.slice(0);

            const encoder = new TextEncoder();
            const uuidBytes = encoder.encode(audioclip.UUID);

            const combined = new Uint8Array(arrayBuffer.byteLength + uuidBytes.length);
            combined.set(new Uint8Array(arrayBuffer), 0);
            combined.set(uuidBytes, arrayBuffer.byteLength);

            await Neutralino.filesystem.writeBinaryFile(NL_PATH + '/assets/' + filename + '.clip', combined);
        } catch (error) {
            console.error(error.message);
        }
    }

    static async open() {
        const path = await FileExplorer.openFile("Import audio file", "Audio (.mp3)", ["mp3"]);

        if (path) {
            const data = await Neutralino.filesystem.readBinaryFile(path);
            const arrayBuffer = data.slice(0);
            return new AudioClip(arrayBuffer);
        }
    }
}