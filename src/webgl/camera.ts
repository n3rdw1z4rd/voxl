import { mat4, vec3 } from 'gl-matrix';
import { Transform } from './transform';
import { clamp } from '../core';

const DEFAULT_FOV: number = 75.0;
const DEFAULT_ASPECT: number = (window.innerWidth / window.innerHeight);
const DEFAULT_NEAR: number = 0.1;
const DEFAULT_FAR: number = 1000;

export class Camera extends Transform {
    public target: vec3 = vec3.create();
    public minDistance: number = 0.1;
    public maxDistance: number = 100.0;
    public distance: number = this.minDistance;
    public projectionMatrix: mat4 = mat4.create();
    public modelViewMatrix: mat4 = mat4.create();

    private projectionNeedsUpdate: boolean = true;

    constructor(
        public fov: number = DEFAULT_FOV,
        public aspect: number = DEFAULT_ASPECT,
        public near: number = DEFAULT_NEAR,
        public far: number = DEFAULT_FAR,
    ) {
        super();
    }

    public update() {
        if (this.projectionNeedsUpdate) {
            mat4.perspective(this.projectionMatrix, this.fov * (Math.PI / 180), this.aspect, this.near, this.far);
            this.projectionNeedsUpdate = false;
        }
        this.calculateViewMatrix();
    }

    public setAspectRatio(aspect: number) {
        this.aspect = aspect;
        this.projectionNeedsUpdate = true;
    }

    private calculateViewMatrix() {
        this.distance = clamp(this.distance, this.minDistance, this.maxDistance);

        const forward = vec3.create();
        vec3.transformQuat(forward, [0, 0, -1], this.rotation);

        const position = vec3.create();
        vec3.scaleAndAdd(position, this.position, forward, -this.distance);

        mat4.lookAt(this.modelViewMatrix, position, this.position, [0, 1, 0]);
    }

    public move(direction: vec3, distance: number) {
        const movement = vec3.create();
        vec3.transformQuat(movement, direction, this.rotation);
        vec3.scaleAndAdd(this.position, this.position, movement, distance);
        this.updateLocalMatrix();
    }
}