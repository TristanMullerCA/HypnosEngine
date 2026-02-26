export class Resource {
    #UUID;
    
    constructor() {
        this.#UUID = crypto.randomUUID();
    }

    get UUID() { return this.#UUID; }
    set UUID(uuid) { this.#UUID = uuid }
}