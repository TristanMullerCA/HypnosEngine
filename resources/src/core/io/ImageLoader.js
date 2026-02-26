import { FileExplorer } from "./FileExplorer.js";

export class ImageLoader {
    /**
     * @returns {Promise<ImageBitmap>}
     */
    static async open() {
        const filePath = await FileExplorer.openFile("Images", "images/*", ["png", "jpg"]);
        const buffer = await Neutralino.filesystem.readBinaryFile(filePath);
        const type = filePath.endsWith('.png') ? 'image/png' : 'image/jpeg';
        const blob = new Blob([buffer], { type: type });
        return filePath ? this.load(blob) : null;
    }

    /**
     * @param {Blob} blob 
     * @returns {Promise<ImageBitmap>}
     */
    static async load(blob) {
        return await createImageBitmap(blob, {
            colorSpaceConversion: 'none',
            premultiplyAlpha: 'none'
        });
    }
}