export class WhiteTexture {
    static get(gl) {
        if (!this.whiteTexture) {
            this.whiteTexture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, this.whiteTexture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
        }

        return this.whiteTexture;
    }
}