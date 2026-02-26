import { Vec3 } from "../math/Vec3.js";
import { EntityLoader } from "./EntityLoader.js";

export class BoxColliderLoader {
    /**
     * @param {BoxCollider} entity 
     */
    static toJSON(entity) {
        const entry = EntityLoader.toJSON(entity);
        entry.size = {
            x: entity.size.x,
            y: entity.size.y,
            z: entity.size.z,
        };
        return entry;
    }

    /**
     * @param {BoxCollider} entity 
     * @param {any} json 
     */
    static parse(entity, json) {
        EntityLoader.parse(entity, json);
        console.log(json);
        if (json.size) entity.size = new Vec3(json.size.x, json.size.y, json.size.z);
    }
}