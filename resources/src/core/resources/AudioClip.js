import { Audio } from "../Audio.js";
import { Resource } from "../Resource.js";

export class AudioClip extends Resource {
    constructor(buffer) {
        super();
        this.buffer = buffer;
        Audio.context.decodeAudioData(buffer.slice(0)).then((data) => {
            this.audioBuffer = data;
        });
    }
}