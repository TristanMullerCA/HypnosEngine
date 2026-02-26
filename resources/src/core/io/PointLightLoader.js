import { PointLight } from "../entities/PointLight.js";
import { EntityLoader } from "./EntityLoader.js";

export class PointLightLoader {
    /**
     * @param {PointLight} entity 
     */
    static toJSON(entity) {
        const entry = EntityLoader.toJSON(entity);
        entry.intensity = entity.intensity;
        entry.radius = entity.radius;
        return entry;
    }

    /**
     * @param {PointLight} entity 
     * @param {any} json 
     */
    static parse(entity, json) {
        EntityLoader.parse(entity, json);
        if (json.intensity) entity.intensity = json.intensity;
        if (json.radius) entity.radius = json.radius;
    }
}