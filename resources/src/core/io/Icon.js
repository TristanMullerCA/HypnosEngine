export class Icon {
    static async convertPngToIco(inputPath, outputPath) {
        try {
            // 1. Read the PNG file as a binary array
            let data = await Neutralino.resources.readBinaryFile(inputPath);
            let pngBuffer = new Uint8Array(data);
            let size = pngBuffer.length;

            // 2. Create the ICO Header (6 bytes)
            const header = new Uint8Array([
                0, 0,           // Reserved (must be 0)
                1, 0,           // Type (1 for Icon)
                1, 0            // Number of images (1)
            ]);

            // 3. Create the Icon Directory Entry (16 bytes)
            // We'll assume the image is 256x256 or less for simplicity
            const entry = new Uint8Array([
                0,              // Width (0 means 256px)
                0,              // Height (0 means 256px)
                0,              // Color palette (0 if not used)
                0,              // Reserved
                1, 0,           // Color planes (1)
                32, 0,          // Bits per pixel (32)
                ...this.int32ToBytes(size),     // Size of the image data
                ...this.int32ToBytes(22)        // Offset of the data (6 + 16 = 22)
            ]);

            // 4. Combine all parts
            let icoFile = new Uint8Array(header.length + entry.length + pngBuffer.length);
            icoFile.set(header, 0);
            icoFile.set(entry, header.length);
            icoFile.set(pngBuffer, header.length + entry.length);

            // 5. Write the file
            await Neutralino.filesystem.writeBinaryFile(outputPath, icoFile.buffer);
            console.debug("ICO created successfully!");
        } catch (err) {
            console.error("Conversion failed:", err);
        }
    }

    /** * Helper to convert a number to a 4-byte Little Endian array
     */
    static int32ToBytes(num) {
        return [
            num & 0xFF,
            (num >> 8) & 0xFF,
            (num >> 16) & 0xFF,
            (num >> 24) & 0xFF
        ];
    }
}