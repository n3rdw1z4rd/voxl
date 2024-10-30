import { vec2 } from 'gl-matrix';
import { Emitter } from './emitter';

type KeyCombination = string[];

interface KeyBinding {
    combination: KeyCombination;
    eventName: string;
}

export class UserInput extends Emitter {
    private _keyStates: { [key: string]: boolean } = {};
    private _buttonStates: { [key: string]: boolean } = {};
    private _mousePosition: vec2 = vec2.create();
    private _keyBindings: KeyBinding[] = [];

    public get mousePosition(): vec2 { return this._mousePosition; }

    constructor() {
        super();

        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('mousedown', (e) => this.onMouseDown(e));
        window.addEventListener('mouseup', (e) => this.onMouseUp(e));
        window.addEventListener('wheel', (e) => this.onMouseWheel(e));
    }

    public isKeyDown(code: string): boolean {
        return this._keyStates[code] ?? false;
    }

    public isButtonDown(button: number): boolean {
        return this._buttonStates[button] ?? false;
    }

    public addKeyBinding(combination: KeyCombination, eventName: string) {
        this._keyBindings.push({ combination, eventName });
    }

    public removeKeyBinding(eventName: string) {
        this._keyBindings = this._keyBindings.filter(binding => binding.eventName !== eventName);
    }

    private onKeyDown(event: KeyboardEvent) {
        if (!this._keyStates[event.code]) {
            this._keyStates[event.code] = true;
            this.emit('keyDown', event);
            this.checkKeyBindings();
        }
    }

    private onKeyUp(event: KeyboardEvent) {
        if (this._keyStates[event.code]) {
            this._keyStates[event.code] = false;
            this.emit('keyUp', event);
            this.checkKeyBindings();
        }
    }

    private onMouseMove(event: MouseEvent) {
        const {
            clientX: posX,
            clientY: posY,
        } = event;
        vec2.set(this._mousePosition, posX, posY);
        this.emit('mouseMove', event);
    }

    private onMouseDown(event: MouseEvent) {
        this._buttonStates[event.button] = true;
        this.emit('mouseDown', event);
    }

    private onMouseUp(event: MouseEvent) {
        this._buttonStates[event.button] = false;
        this.emit('mouseUp', event);
    }

    private onMouseWheel(event: WheelEvent) {
        this.emit('wheel', event);
    }

    private checkKeyBindings() {
        for (const binding of this._keyBindings) {
            if (binding.combination.every(key => this.isKeyDown(key))) {
                this.emit(binding.eventName);
            }
        }
    }
}
