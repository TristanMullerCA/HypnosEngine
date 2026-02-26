export class FileBinaryLoader {
    /**
     * @param {string} filePath 
     * @returns {Promise<string>}
     */
    static async read(filePath) {
        try {
            const data = await Neutralino.filesystem.readFile(filePath);
            return data;
        } catch (error) {
            console.error(error.message);
        }
    }

    /**
     * @param {string} filePath 
     * @param {string} data 
     */
    static async write(filePath, data) {
        await Neutralino.filesystem.writeFile(filePath, data);
    }
}