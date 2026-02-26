import { Gamepad } from "./Gamepad.js";
import { Keyboard } from "./Keyboard.js";
import { Mouse } from "./Mouse.js";

export class Input {
    /**
     * @param {HTMLCanvasElement} canvas 
     */
    constructor(canvas) {
        this.keyboard = new Keyboard();
        this.mouse = new Mouse(canvas);
        this.gamepad = new Gamepad();
    }
}