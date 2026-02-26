import { ReflectionProbe } from "../entities/ReflectionProbe.js";
import { EntityLoader } from "./EntityLoader.js";

export class ReflectionProbeLoader {
    /**
     * @param {ReflectionProbe} entity 
     */
    static toJSON(entity) {
        const entry = EntityLoader.toJSON(entity);
        entry.resolution = entity.resolution;
        return entry;
    }

    /**
     * @param {ReflectionProbe} entity 
     * @param {any} json 
     */
    static parse(entity, json) {
        EntityLoader.parse(entity, json);
        if (json.intensity) entity.intensity = json.intensity;
    }
}