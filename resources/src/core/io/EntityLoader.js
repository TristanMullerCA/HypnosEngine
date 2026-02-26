import { Entity } from "../entities/Entity.js";
import { Vec3 } from "../math/Vec3.js";
import { ClassRegistry } from "./ClassRegistry.js";

export class EntityLoader {
    /**
     * @param {Entity} entity 
     */
    static toJSON(entity) {
        const entry = {
            type: entity.constructor.name,
            UUID: entity.UUID,
            name: entity.name,
            static: entity.static,
            position: {
                x: entity.position.x,
                y: entity.position.y,
                z: entity.position.z,
            },
            rotation: {
                x : entity.rotation.x,
                y : entity.rotation.y,
                z : entity.rotation.z,
            },
            scale: {
                x : entity.scale.x,
                y : entity.scale.y,
                z : entity.scale.z,
            },
            children: [],
        };

        for (const child of entity.children) {
            const classRegistryEntry = ClassRegistry[child.constructor.name];
            if (classRegistryEntry) {
                const loader = classRegistryEntry.loader;
                const childEntry = loader.toJSON(child);
                entry.children.push(childEntry);
            }
        }

        return entry;
    }

    /**
     * @param {Entity} entity 
     * @param {any} json 
     */
    static parse(entity, json) {
        if (json.UUID) entity.UUID = json.UUID;
        if (json.name) entity.name = json.name;
        if (json.static) entity.static = json.static;
        if (json.position) entity.position = new Vec3(json.position.x, json.position.y, json.position.z);
        if (json.rotation) entity.rotation = new Vec3(json.rotation.x, json.rotation.y, json.rotation.z);
        if (json.scale) entity.scale = new Vec3(json.scale.x, json.scale.y, json.scale.z);

        for (const entry of json.children) {
            if (entry.type) {
                const classRegistryEntry = ClassRegistry[entry.type];

                if (classRegistryEntry) {
                    const TargetClass = classRegistryEntry.type;
                    const loader = classRegistryEntry.loader;
                    const child = new TargetClass();
                    loader.parse(child, entry);
                    entity.addChild(child);
                } else {
                    console.warn(`Class type '${json.type}' not recognized`);
                }
            } else {
                console.warn(`No classs type defined for entry '${entry.name}'`);
            }
        }
    }
}