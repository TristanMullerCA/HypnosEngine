const DEFAULT_CODE = `/**
 * @param {Behaviour} behaviour
 */
function start(behaviour) {
    console.log("Hello world!");
}

/**
 * @param {Behaviour} behaviour
 * @param {number} delta
 * @param {Input} input
 */
function update(behaviour, delta, input) {
    // Simple 'FPS Controller' example code :
    let direction = new Vec3();

    if (input.keyboard.isPressed("KeyW")) {
        direction.z -= delta;
    } else if (input.keyboard.isPressed("KeyS")) {
        direction.z += delta;
    }

    if (input.keyboard.isPressed("KeyD")) {
        direction.x += delta;
    } else if (input.keyboard.isPressed("KeyA")) {
        direction.x -= delta;
    }

    if (direction.magnitude > 1.0) direction = Vec3.normalize(direction);
    behaviour.position = Vec3.add(behaviour.position, direction);

    if (input.mouse.isDown) {
        behaviour.rotation.y -= input.mouse.screenPosition.x * delta;
        behaviour.rotation.x -= input.mouse.screenPosition.y * delta;
    }

    // Simple Y-turn example code :
    behaviour.rotation.y += delta;

    // Enable it after having modified the code above
    // behaviour.updateTransformations();
}
    
return { start, update };`;

import { Vec3 } from './../math/Vec3.js';
import { Entity } from './Entity.js';
const EXPOSED_CLASSES = { Vec3 };

export class Behaviour extends Entity {
    /**
     * @param {string} code 
     */
    constructor(code = DEFAULT_CODE) {
        super();
        this.code = code;
        this.static = false; // Force it to be false
    }

    load() {
        const paramNames = Object.keys(EXPOSED_CLASSES);
        const paramValues = Object.values(EXPOSED_CLASSES);
        this.script = new Function(...paramNames, `
            return (function() {
                ${this.code}
                return this;
            }).bind({})
        `);
        this.module = this.script(...paramValues)();
    }

    async start() {
        this.load();
        if (this.module && this.module.start) {
            this.module.start(this);
        }
    }

    async update(delta, input) {
        this.load();
        if (this.module) this.module["update"](this, delta, input);
    }
}