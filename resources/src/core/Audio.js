/** @type {AudioContext} */
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

window.addEventListener('click', () => {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
});

export class Audio {
    /**
     * returns {AudioContext}
     */
    static get context() {
        return audioCtx;
    }

    /**
     * @param {number} duration 
     * @returns 
     */
    static generateImpulseResponse(duration) {
        const sampleRate = audioCtx.sampleRate;
        const length = sampleRate * duration;
        const buffer = audioCtx.createBuffer(2, length, sampleRate);

        // As duration gets smaller, we can slightly boost the volume 
        // to compensate for the loss of energy (Empirical compensation)
        const boost = 1.0 / Math.sqrt(duration);

        for (let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                let noise = (Math.random() * 2 - 1);
                let envelope = Math.pow(1 - i / length, 2);
                data[i] = noise * envelope * boost;
            }
        }

        return buffer;
    }
}