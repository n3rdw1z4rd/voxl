import { mat4, vec3 } from 'gl-matrix';
import { Clock, ProgramInfo, Renderer, rng, UserInput } from '../utils';
import { FRAGMENT_SHADER_SOURCE, VERTEX_SHADER_SOURCE, VOXEL_VERTICES } from './constants';
import { World } from './world';
import { Chunk } from './chunk';
import { Camera } from './camera';

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

        camera.rotate(vec3.fromValues(deltaY * 0.005, deltaX * 0.005, 0));

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
            camera.translate(vec3.fromValues(0, panSpeed, 0));
            break;
        case 's':
            camera.translate(vec3.fromValues(0, -panSpeed, 0));
            break;
        case 'a':
            camera.translate(vec3.fromValues(-panSpeed, 0, 0));
            break;
        case 'd':
            camera.translate(vec3.fromValues(panSpeed, 0, 0));
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
    gl.uniformMatrix4fv(modelViewMatrixLocation, false, camera.modelViewMatrix);

    for (const voxel of world.getChunk(0, 0, 0).voxels) {
        gl.uniform4fv(voxelColorLocation, voxel.color);

        mat4.identity(voxelMatrix);
        mat4.translate(voxelMatrix, camera.modelViewMatrix, voxel.position);
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
