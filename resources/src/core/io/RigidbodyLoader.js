import { Rigidbody } from "../entities/Rigidbody.js";
import { EntityLoader } from "./EntityLoader.js";

export class RigidbodyLoader {
    /**
     * @param {Rigidbody} entity 
     */
    static toJSON(entity) {
        const entry = EntityLoader.toJSON(entity);
        entry.linearDamping = entity.linearDamping;
        entry.bounciness = entity.bounciness;
        entry.mass = entity.mass;
        entry.useGravity = entity.useGravity;
        return entry;
    }

    /**
     * @param {Rigidbody} entity 
     * @param {any} json 
     */
    static parse(entity, json) {
        EntityLoader.parse(entity, json);
        if (json.linearDamping) entity.linearDamping = json.linearDamping;
        if (json.bounciness) entity.bounciness = json.bounciness;
        if (json.mass) entity.mass = json.mass;
        if (json.useGravity) entity.useGravity = json.useGravity;
    }
}