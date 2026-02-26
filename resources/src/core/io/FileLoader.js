const isNeutralino = typeof NL_MODE !== 'undefined';

export class FileLoader {
    /**
     * @param {string} filePath 
     * @returns {Promise<ArrayBuffer>}
     */
    static async read(filePath) {
        if (isNeutralino) {
            try {
                console.log("read file " + filePath);
                const file = await Neutralino.filesystem.readFile(filePath);
                console.log("file " + filePath + " successfully read");
                return file;
            } catch (error) {
                console.error(error);
            }
        } else {
            const response = await fetch(filePath);
            if (!response.ok) throw new Error('File not found');
            const data = await response.arrayBuffer();
            return data;
        }
    }

    /**
     * @param {string} filePath 
     * @param {ArrayBuffer} buffer 
     */
    static async write(filePath, buffer) {
        if (isNeutralino) {
            await Neutralino.filesystem.writeFile(filePath, buffer);
        } else {
            const blob = new Blob([buffer], { type: 'text/plain' });
            const link = document.createElement('a');

            link.href = URL.createObjectURL(blob);
            link.download = filePath;
            link.click();

            // Clean up memory
            URL.revokeObjectURL(link.href);
        }
    }
}