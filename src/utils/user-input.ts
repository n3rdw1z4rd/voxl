import { Emitter } from './emitter';
import { vec2 } from 'gl-matrix';
import { log } from './logger';

export class UserInput extends Emitter {
    private _keyStates: { [key: string]: boolean } = {};
    private _buttonStates: { [key: string]: boolean } = {};
    private _mousePosition: vec2 = vec2.create();

    public get mousePosition(): vec2 { return this._mousePosition; }

    public isKeyDown(code: string): boolean {
        return this._keyStates[code] ?? false;
    }

    public isButtonDown(button: number): boolean {
        return this._buttonStates[button] ?? false;
    }

    private onKeyDown(event: KeyboardEvent) {
        if (!this._keyStates[event.code]) {
            this._keyStates[event.code] = true;
            this.emit('keyDown', event.code);
        }
    }

    private onKeyUp(event: KeyboardEvent) {
        if (this._keyStates[event.code]) {
            this._keyStates[event.code] = false;
            this.emit('keyUp', event.code);
        }
    }

    private onMouseMove(event: MouseEvent) {
        const {
            clientX: posX,
            clientY: posY,
            movementX: deltaX,
            movementY: deltaY,
        } = event;

        this._mousePosition[0] = posX;
        this._mousePosition[1] = posY;

        this.emit('mouseMove', deltaX, deltaY);
    }

    private onMouseDown(event: MouseEvent) {
        if (!this._buttonStates[event.button]) {
            this._buttonStates[event.button] = true;
            this.emit('mouseDown', event.button);
        }
    }

    private onMouseUp(event: MouseEvent) {
        if (this._buttonStates[event.button]) {
            this._buttonStates[event.button] = false;
            this.emit('mouseUp', event.button);
        }
    }

    private onMouseWheel(event: MouseEvent) {
        log('onMouseWheel:', event);
    }

    private static _instance: UserInput;

    public static get instance(): UserInput {
        if (!UserInput._instance) {
            UserInput._instance = new UserInput();
        }

        return UserInput._instance;
    }

    private constructor() {
        super();

        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('mousedown', (e) => this.onMouseDown(e));
        window.addEventListener('mouseup', (e) => this.onMouseUp(e));
        window.addEventListener('wheel', (e) => this.onMouseWheel(e));
    }
}
