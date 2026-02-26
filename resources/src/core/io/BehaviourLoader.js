import { EntityLoader } from "./EntityLoader.js";

export class BehaviourLoader {
    /**
     * @param {Behaviour} entity 
     */
    static toJSON(entity) {
        const entry = EntityLoader.toJSON(entity);
        entry.code = entity.code;
        return entry;
    }

    /**
     * @param {Behaviour} entity 
     * @param {any} json 
     */
    static parse(entity, json) {
        EntityLoader.parse(entity, json);
        if (json.code) entity.code = json.code;
    }
}