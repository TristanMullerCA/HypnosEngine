import { Renderer } from "../entities/Renderer.js";
import { EntityLoader } from "./EntityLoader.js";

export class RendererLoader {
    /**
     * @param {Renderer} entity 
     */
    static toJSON(entity) {
        const entry = EntityLoader.toJSON(entity);
        entry.geometryUUID = entity.geometryUUID;
        entry.shaderUUID = entity.shaderUUID;
        entry.textureUUID = entity.textureUUID;
        entry.roughness = entity.roughness;
        entry.lightmapResolution = entity.lightmapResolution;
        // TODO: export colorMap / lightMap
        return entry;
    }

    /**
     * @param {Renderer} entity 
     * @param {any} json 
     */
    static parse(entity, json) {
        EntityLoader.parse(entity, json);
        if (json.geometryUUID) entity.geometryUUID = json.geometryUUID;
        if (json.shaderUUID) entity.shaderUUID = json.shaderUUID;
        if (json.textureUUID) entity.textureUUID = json.textureUUID;
        if (json.roughness) entity.roughness = json.roughness;
        if (json.lightmapResolution) entity.lightmapResolution = json.lightmapResolution;
    }
}