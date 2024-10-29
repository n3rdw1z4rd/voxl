import { mat4, vec3 } from 'gl-matrix';
import { Clock, ProgramInfo, Renderer, rng, UserInput } from '../utils';
import { FRAGMENT_SHADER_SOURCE, VERTEX_SHADER_SOURCE, VOXEL_VERTICES } from './constants';
import { World } from './world';
import { Chunk } from './chunk';

export class Transform {
    public position: vec3 = vec3.create();
    public rotation: vec3 = vec3.create();
    public scale: vec3 = vec3.fromValues(1, 1, 1);
    public modelMatrix: mat4 = mat4.create();

    public updateModelMatrix() {
        mat4.identity(this.modelMatrix);
        mat4.translate(this.modelMatrix, this.modelMatrix, this.position);
        mat4.rotateX(this.modelMatrix, this.modelMatrix, this.rotation[0]);
        mat4.rotateY(this.modelMatrix, this.modelMatrix, this.rotation[1]);
        mat4.rotateZ(this.modelMatrix, this.modelMatrix, this.rotation[2]);
        mat4.scale(this.modelMatrix, this.modelMatrix, this.scale);
    }
}

const DEFAULT_FOV: number = 75.0;
const DEFAULT_ASPECT: number = (window.innerWidth / window.innerHeight);
const DEFAULT_NEAR: number = 0.1;
const DEFAULT_FAR: number = 1000;

export class Camera extends Transform {
    public target: vec3 = vec3.create();
    public distance: number = 1.0;
    public projectionMatrix: mat4 = mat4.create();
    private viewMatrix: mat4 = mat4.create();
    private projectionNeedsUpdate = true;

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
        const forward = vec3.create();
        vec3.sub(forward, this.target, this.position);
        vec3.normalize(forward, forward);

        const offsetPosition = vec3.create();
        vec3.scaleAndAdd(offsetPosition, this.target, forward, -this.distance);
        vec3.copy(this.position, offsetPosition);

        this.updateModelMatrix();

        mat4.invert(this.viewMatrix, this.modelMatrix);
    }

    public getViewMatrix(): mat4 {
        return this.viewMatrix;
    }
}

const SEED: number = 42;

rng.seed = SEED;

const clock = new Clock();
const input = new UserInput();
const renderer = new Renderer({ parent: document.getElementById('app')! });
const { gl } = renderer;

const programInfo: ProgramInfo = Renderer.CreateProgramInfo(gl, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE);
const world = new World(gl, programInfo);

const camera = new Camera();
camera.distance = 100;
camera.position = vec3.fromValues(0, 0, -camera.distance);

let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;

input.on('mouseDown', (e) => {
    isDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
});

input.on('mouseUp', () => {
    isDragging = false;
});

input.on('mouseMove', (e) => {
    if (isDragging) {
        const deltaX = e.clientX - lastMouseX;
        const deltaY = e.clientY - lastMouseY;

        camera.rotation[0] += deltaY * 0.005;
        camera.rotation[1] -= deltaX * 0.005;

        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    }
});

input.on('wheel', (e) => {
    camera.distance = Math.max(2, Math.min(1000, camera.distance + (e.deltaY * 0.05)));
});

input.on('keyDown', (e) => {
    const panSpeed = 0.1;
    switch (e.key) {
        case 'w':
            camera.position[1] += panSpeed;
            break;
        case 's':
            camera.position[1] -= panSpeed;
            break;
        case 'a':
            camera.position[0] -= panSpeed;
            break;
        case 'd':
            camera.position[0] += panSpeed;
            break;
    }
});

const voxelMatrix = mat4.create();
const projectionMatrixLocation = programInfo.uniforms['projectionMatrix'];
const modelViewMatrixLocation = programInfo.uniforms['modelViewMatrix'];
const voxelColorLocation = programInfo.uniforms['voxelColor'];

clock.run((_deltaTime: number) => {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (renderer.resize()) {
        camera.setAspectRatio(window.innerWidth / window.innerHeight);
    }

    gl.useProgram(programInfo.program);

    camera.update();
    gl.uniformMatrix4fv(projectionMatrixLocation, false, camera.projectionMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLocation, false, camera.getViewMatrix());

    for (const voxel of world.getChunk(0, 0, 0).voxels) {
        gl.uniform4fv(voxelColorLocation, voxel.color);

        mat4.identity(voxelMatrix);
        mat4.translate(voxelMatrix, camera.getViewMatrix(), voxel.position);
        gl.uniformMatrix4fv(modelViewMatrixLocation, false, voxelMatrix);

        gl.drawArrays(gl.TRIANGLES, 0, VOXEL_VERTICES.length / 3);
    }

    clock.showStats({
        seed: SEED,
        chunk: `${Chunk.SIZE} (${Math.pow(Chunk.SIZE, 2) * Chunk.HEIGHT})`,
        dolly: camera.distance.toFixed(0),
        pan: `${camera.position[0].toFixed(1)} x ${camera.position[1].toFixed(1)}`,
        rotation: `${camera.rotation[0].toFixed(1)} x ${camera.rotation[1].toFixed(1)}`,
    });
});
