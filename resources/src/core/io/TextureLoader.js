import { Texture } from "../resources/Texture.js";
import { ImageLoader } from "./ImageLoader.js";

export class TextureLoader {
    /**
     * @param {string} filename 
     */
    static async load(filename = "tmp") {
        try {
            const binaryData = await Neutralino.filesystem.readBinaryFile(NL_PATH + '/assets/' + filename + '.map');
            
            const arrayBuffer = binaryData;
            const uuidLength = 36; // Standard UUID length
            const offset = arrayBuffer.byteLength - uuidLength;
            
            const uuidBytes = arrayBuffer.slice(offset);
            const decoder = new TextDecoder();
            const uuid = decoder.decode(uuidBytes);
            
            const imageData = binaryData.slice(0, binaryData.byteLength - uuidLength);
            const blob = new Blob([imageData], { type: 'image/png' });
            const bitmap = await ImageLoader.load(blob);

            const texture = new Texture(bitmap);
            texture.UUID = uuid;
            return texture;
        } catch (error) {
            console.error(error.message);
        }
    }

    /**
     * @param {Texture} texture 
     * @param {string} filename 
     */
    static async save(texture, filename = "tmp") {
        try {
            const canvas = new OffscreenCanvas(texture.bitmap.width, texture.bitmap.height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(texture.bitmap, 0, 0);
            const blob = await canvas.convertToBlob({ type: 'image/png' });
            const arrayBuffer = await blob.arrayBuffer();

            const encoder = new TextEncoder();
            const uuidBytes = encoder.encode(texture.UUID);

            const combined = new Uint8Array(arrayBuffer.byteLength + uuidBytes.length);
            combined.set(new Uint8Array(arrayBuffer), 0);
            combined.set(uuidBytes, arrayBuffer.byteLength);

            await Neutralino.filesystem.writeBinaryFile(NL_PATH + '/assets/' + filename + '.map', combined);
        } catch (error) {
            console.error(error.message);
        }
    }
}