import { vec3 } from 'gl-matrix';

export class Transform {
    public position: vec3 = vec3.create();
    public rotation: vec3 = vec3.create();
    public scale: vec3 = vec3.fromValues(1, 1, 1);
}