import { EntityLoader } from "./EntityLoader.js";

export class AudioSourceLoader {
    /**
     * @param {AudioSource} entity 
     */
    static toJSON(entity) {
        const entry = EntityLoader.toJSON(entity);
        entry.audioClipUUID = entity.audioClipUUID;
        entry.distance = entity.distance;
        return entry;
    }

    /**
     * @param {AudioSource} entity 
     * @param {any} json 
     */
    static parse(entity, json) {
        EntityLoader.parse(entity, json);
        if (json.audioClipUUID) entity.audioClipUUID = json.audioClipUUID;
        if (json.distance) entity.distance = json.distance;
    }
}