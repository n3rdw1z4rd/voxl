import { mat4, vec3 } from 'gl-matrix';

export class Transform {
    public position: vec3 = vec3.create();
    public rotation: vec3 = vec3.create();
    public scale: vec3 = vec3.create();
}

const DEFAULT_FOV: number = 75.0;
const DEFAULT_ASPECT: number = (window.innerWidth / window.innerHeight);
const DEFAULT_NEAR: number = 0.1;
const DEFAULT_FAR: number = 1000;

export class Camera extends Transform {
    public target: vec3 = vec3.create();
    public distance: number = 1.0; // distance away from target.
    public projectionMatrix: mat4 = mat4.create();
    public modelViewMatrix: mat4 = mat4.create();

    constructor(
        public fov: number = DEFAULT_FOV,
        public aspect: number = DEFAULT_ASPECT,
        public near: number = DEFAULT_NEAR,
        public far: number = DEFAULT_FAR,
    ) {
        super();
    }

    public update() {
        // Calculate view matrix based on target, position, and rotation.
        this.calculateViewMatrix();

        // Calculate projection matrix based on FOV, aspect ratio, near, and far planes.
        mat4.perspective(this.projectionMatrix, this.fov * (Math.PI / 180), this.aspect, this.near, this.far);
    }

    private calculateViewMatrix() {
        // Calculate the camera's forward direction vector.
        const forward = vec3.create();
        vec3.subtract(forward, this.target, this.position);
        vec3.normalize(forward, forward);

        // Calculate the right and up vectors.
        const right = vec3.create();
        vec3.cross(right, this.rotation, forward); // Assuming rotation is in world space
        vec3.normalize(right, right);

        const up = vec3.create();
        vec3.cross(up, forward, right); // Assuming up vector is orthogonal to both forward and right
        vec3.normalize(up, up);

        // Set the view matrix elements.
        mat4.lookAt(this.modelViewMatrix, this.position, this.target, up);
    }
}