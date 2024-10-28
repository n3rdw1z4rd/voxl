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
        camera.rotation[1] += deltaX * 0.005;

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

const projectionMatrix = mat4.create();
const modelViewMatrix = mat4.create();
mat4.perspective(projectionMatrix, Math.PI / 4, renderer.width / renderer.height, 0.1, 1000.0);

const projectionMatrixLocation = programInfo.uniforms['projectionMatrix'];
const modelViewMatrixLocation = programInfo.uniforms['modelViewMatrix'];
const voxelColorLocation = programInfo.uniforms['voxelColor'];

clock.run((_deltaTime: number) => {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(programInfo.program);

    mat4.identity(modelViewMatrix);
    mat4.translate(modelViewMatrix, modelViewMatrix, [camera.position[0], camera.position[1], -camera.distance]);
    mat4.rotateX(modelViewMatrix, modelViewMatrix, camera.rotation[0]);
    mat4.rotateY(modelViewMatrix, modelViewMatrix, camera.rotation[1]);
    gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);

    for (const voxel of world.getChunk(0, 0, 0).voxels) {
        gl.uniform4fv(voxelColorLocation, voxel.color);

        mat4.identity(voxelMatrix);
        mat4.translate(voxelMatrix, modelViewMatrix, voxel.position);
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
