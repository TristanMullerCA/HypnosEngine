import { SphereCollider } from "../entities/SphereCollider.js";
import { EntityLoader } from "./EntityLoader.js";

export class SphereColliderLoader {
    /**
     * @param {SphereCollider} entity 
     */
    static toJSON(entity) {
        const entry = EntityLoader.toJSON(entity);
        entry.radius = entity.radius;
        return entry;
    }

    /**
     * @param {SphereCollider} entity 
     * @param {any} json 
     */
    static parse(entity, json) {
        EntityLoader.parse(entity, json);
        if (json.radius) entity.radius = json.radius;
    }
}