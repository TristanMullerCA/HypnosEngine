export const XBOX_BUTTONS = {
    A: 0, B: 1, X: 2, Y: 3,
    LB: 4, RB: 5, LT: 6, RT: 7,
    BACK: 8, START: 9,
    UP: 12, DOWN: 13, LEFT: 14, RIGHT: 15
};

export const GAMEPAD_BUTTONS = {
    Bottom_Face: 0, Right_Face: 1, Left_Face: 2, Top_Face: 3,
    Left_Bumper: 4, Right_Bumper: 5, Left_Trigger: 6, Right_Trigger: 7,
    Select_Back: 8, Start_Menu: 9,
    DPad_Up: 12, DPad_Down: 13, DPad_Left: 14, DPad_Right: 15
};

export const PS_BUTTONS = {
    Cross: 0, Circle: 1, Square: 2, Triangle: 3,
    L1: 4, R1: 5, L2: 6, R2: 7,
    Share: 8, Options: 9,
    Up: 12, Down: 13, Left: 14, Right: 15
};

export class Gamepad {
    constructor() {
        this.gamepads = navigator.getGamepads();
        this.keys = {};
    }

    updateGamepad() {
        this.gamepads = navigator.getGamepads();
    }

    /**
     * @returns {{x: number, y: number}}
     */
    getLeftStick(deadZone = 0.1, gamepadId = 0) {
        this.updateGamepad();
        const gp = this.gamepads[gamepadId];
        if (!gp) return { x: 0, y: 0 };
        const stickX = gp.axes[0];
        const stickY = gp.axes[1];
        return {
            x: Math.abs(stickX) > deadZone ? stickX : 0,
            y: Math.abs(stickY) > deadZone ? stickY : 0
        }
    }

    /**
     * @returns {{x: number, y: number}}
     */
    getRightStick(deadZone = 0.1, gamepadId = 0) {
        this.updateGamepad();
        const gp = this.gamepads[gamepadId];
        if (!gp) return { x: 0, y: 0 };
        const stickX = gp.axes[2];
        const stickY = gp.axes[3];
        return {
            x: Math.abs(stickX) > deadZone ? stickX : 0,
            y: Math.abs(stickY) > deadZone ? stickY : 0
        }
    }

    /**
     * @param {number} button use XBOX_BUTTONS, GAMEPAD_BUTTONS or PS_BUTTONS to select a button
     * @param {number} deadZone 
     * @param {number} gamepadId 
     * @returns {boolean}
     */
    isPressed(button, deadZone = 0.5, gamepadId = 0) {
        this.updateGamepad();
        const gp = this.gamepads[gamepadId];
        if (!gp) return false;
        const btn = gp.buttons[button];
        return btn ? btn.value > deadZone : false;
    }
}