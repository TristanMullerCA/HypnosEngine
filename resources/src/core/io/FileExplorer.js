export class FileExplorer {
    /**
     * Opens a native file picker with custom filters
     * @param {string} description - The label for the file type (e.g., 'Source Code')
     * @param {string} mimeType - The primary MIME type (e.g., 'text/javascript')
     * @param {string[]} extensions - Array of extensions (e.g., ['.js', '.ts'])
     * @returns {Promise<string>}
     */
    static async openFile(description = "Files", mymeType = "*/*", extensions = ['.*']) {
        try {
            let entry = await Neutralino.os.showOpenDialog(description, {
                filters: [{ name: mymeType, extensions: extensions }]
            });
            const filePath = entry[0];
            return filePath;
        } catch (err) {
            console.error("User cancelled or error occurred:", err);
        }
    }
}