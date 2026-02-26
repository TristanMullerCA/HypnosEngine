import { EntityLoader } from "./EntityLoader.js";

export class CameraLoader {
    /**
     * @param {Camera} entity 
     */
    static toJSON(entity) {
        const entry = EntityLoader.toJSON(entity);
        entry.zIndex = entity.zIndex;
        entry.fov = entity.fov;
        entry.near = entity.near;
        entry.far = entity.far;
        return entry;
    }

    /**
     * @param {Camera} entity 
     * @param {any} json 
     */
    static parse(entity, json) {
        EntityLoader.parse(entity, json);
        if (json.zIndex) entity.zIndex = json.zIndex;
        if (json.fov) entity.fov = json.fov;
        if (json.near) entity.near = json.near;
        if (json.far) entity.far = json.far;
    }
}