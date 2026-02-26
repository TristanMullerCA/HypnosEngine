import { Audio } from "../Audio.js";
import { RESOURCE_POOL } from "../DataPool.js";
import { Mat4 } from "../math/Mat4.js";
import { Vec3 } from "../math/Vec3.js";
import { AudioClip } from "../resources/AudioClip.js";
import { Entity } from "./Entity.js";

export class AudioSource extends Entity {
    constructor(audioClip = null) {
        super();
        this.audioClipUUID = audioClip ? audioClip.UUID : null;
        this.panner = Audio.context.createPanner();
        this.gain = Audio.context.createGain();
        this.reverb = Audio.context.createConvolver();
        this.reverb.normalize = true;
        this.reverbDuration = 0.75;
        this.setReverbDuration(this.reverbDuration);
        this.dry = Audio.context.createGain();
        this.dry.gain.value = 1;
        this.wet = Audio.context.createGain();
        this.wet.gain.value = 0;
        this.distance = 10;
        this.isPlaying = false;
    }

    setReverbDuration(duration = 0.75) {
        this.reverbDuration = duration;
        this.reverb.buffer = Audio.generateImpulseResponse(duration);
    }

    /**
     * @param {Vec3} listenerPosition 
     * @param {Mat4} listenerMatrix 
     */
    update(listenerPosition, listenerMatrix) {
        // Sync 3D audio with the WebGL position
        const direction = Vec3.sub(this.worldPosition, listenerPosition);
        const vm = Mat4.multiply(listenerMatrix, this.modelMatrix).data;
        const position = new Vec3(vm[12], vm[13], vm[14]);
        this.panner.positionX.setTargetAtTime(position.x, Audio.context.currentTime, 0.03);
        this.panner.positionY.setTargetAtTime(position.y, Audio.context.currentTime, 0.03);
        this.panner.positionZ.setTargetAtTime(position.z, Audio.context.currentTime, 0.03);
        let volume = direction.magnitude / this.distance;
        if (volume > 1) volume = 1;
        if (volume < 0) volume = 0;
        this.wet.gain.value = volume;
        this.dry.gain.value = 1 - volume;
    }

    play() {
        const clip = RESOURCE_POOL.getResourceByType(AudioClip.name, this.audioClipUUID);

        if (this.isPlaying || !clip || !clip.audioBuffer || Audio.context.state != "running") return;

        this.isPlaying = true;
        const source = Audio.context.createBufferSource();
        source.buffer = clip.audioBuffer;

        source.connect(this.panner);
        this.panner.connect(this.dry);

        this.dry.connect(Audio.context.destination);

        this.panner.connect(this.wet);
        this.wet.connect(this.reverb);
        this.reverb.connect(Audio.context.destination);

        source.start();
        source.onended = () => {
            this.isPlaying = false;
        };
    }

    playOneShot(buffer) {
        if (!buffer) return;
        const source = this.Audio.context.createBufferSource();
        source.buffer = buffer;
        source.connect(this.panner);
        this.panner.connect(this.gain);
        this.gain.connect(Audio.context.destination);
        source.start(0);
    }
}