import { vec3 } from 'gl-matrix';
import { Component, Entity } from '../utils';

export class Transform implements Component {
    constructor(
        public position: vec3 = vec3.create(),
        public rotation: vec3 = vec3.create(),
        public scale: vec3 = vec3.fromValues(1, 1, 1),
    ) { }
}

export class Mesh implements Component {
    constructor(public vertices: Float32Array) { }
}

export class Velocity implements Component {
    constructor(public heading: vec3 = vec3.create()) { }
}

export class Parent implements Component {
    constructor(public entity: Entity) { }
}

export class Children implements Component {
    constructor(public entities: Entity[] = []) { }
}

export class Follows implements Component {
    constructor(public target: Entity) { }
}


