import { Resource } from "./Resource.js";

export class DataPool {
    constructor() {
        this.resources = new Map();
        this.requesters = new Map();
    }

    /**
     * @param {string} uuid 
     * @param {string} uuid 
     */
    hasResource(type, uuid) {
        const map = this.resources.get(type);
        return map ? map.get(uuid) != null : false;
    }

    /**
     * @param {Resource} resource 
     */
    addResource(resource) {
        if (this.resources.has(resource.constructor.name)) {
            const map = this.resources.get(resource.constructor.name);

            if (!map.has(resource.UUID)) {
                map.set(resource.UUID, resource);
                console.debug(`Resource ${resource.constructor.name} ${resource.UUID} added to resources at ID=${map.size - 1}`);
            } else {
                this.requesters.set(resource.UUID, this.requesters.get(resource.UUID) + 1);
                console.warn(`Resource ${resource.constructor.name} ${resource.UUID} already added, increasing requesters`);
            }
        } else {
            const map = new Map();
            map.set(resource.UUID, resource);
            this.resources.set(resource.constructor.name, map);
            console.debug(`Resource ${resource.constructor.name} ${resource.UUID} added to resources at ID=${map.size - 1}`);
        }
    }

    /**
     * Unload one instance this resource, remove it when requesters equals zero
     * @param {Resource} resource 
     */
    unload(resource) {
        const requesters = this.requesters.get(resource.UUID);
        if (requesters > 0) {
            this.requesters.set(resource.UUID, requesters - 1);
        } else {
            this.remove(resource);
        }
    }

    /**
     * Force remove a resource
     * @param {Resource} resource 
     */
    remove(resource) {
        const map = this.resources.get(resource.constructor.name);
        if (map) {
            if (map.has(resource.UUID)) {
                map.delete(resource.UUID);
            } else {
                console.warn('Not found');
            }
        } else {
            console.warn('No ' + resource.constructor.name + " found");
        }
    }

    /**
     * @param {string} type
     * @param {string} uuid
     * @returns {Resource}
     */
    getResourceByType(type, uuid) {
        const map = this.resources.get(type);
        return map ? map.get(uuid) : null;
    }

    /**
     * @param {string} type
     * @returns {Resource[]}
     */
    getResourcesByType(type) {
        const map = this.resources.get(type);
        return map ? Array.from(map.values()) : [];
    }

    /**
     * @returns {Resource[]}
     */
    getAll() {
        const array = [];
        for (const map of this.resources.values()) {
            array.push(...map.values());
        }
        return array;
    }

    /**
     * @param {string} type 
     * @param {(r: Resource) => string} keySelector 
     */
    getPartitionsByType(type, keySelector) {
        /** @type {Map} */
        const map = this.resources.get(type);

        if (map) {
            const partitions = new Map();
            const array = Array.from(map.values());

            for (const item of array) {
                const key = keySelector(item);
                if (!partitions.has(key)) {
                    partitions.set(key, []);
                }
                partitions.get(key).push(item);
            }

            return Array.from(partitions.values());
        }

        return [];
    }

    clear() {
        this.resources = new Map();
    }
}

export const DATA_POOL = new DataPool();
export const RESOURCE_POOL = new DataPool();

/**
 * @param {string} typeName 
 * @param {string} uuid 
 * @param {WebGL2RenderingContext} gl 
 * @returns {Resource}
 */
export function getOrLoadResource(typeName, uuid, gl) {
    let resource = DATA_POOL.getResourceByType(typeName, uuid);

    if (!resource) {
        resource = RESOURCE_POOL.getResourceByType(typeName, uuid);
        if (resource) {
            resource.init(gl);
            DATA_POOL.addResource(resource);
        } else {
            console.warn(`Resource ${typeName} ${uuid} can't be loaded`);
        }
    }

    return resource;
}