import { mat4 } from 'gl-matrix';
import { Clock, ProgramInfo, Renderer, rng } from '../utils';
import { FRAGMENT_SHADER_SOURCE, VERTEX_SHADER_SOURCE, VOXEL_VERTICES } from './constants';
import { World } from './world';
import { Chunk } from './chunk';

const SEED: number = 42;

rng.seed = SEED;

const clock = new Clock();
const renderer = new Renderer({ parent: document.getElementById('app')! });
const { gl } = renderer;

const programInfo: ProgramInfo = Renderer.CreateProgramInfo(gl, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE);
const world = new World(gl, programInfo);

const voxelMatrix = mat4.create();

const projectionMatrix = mat4.create();
const modelViewMatrix = mat4.create();

mat4.perspective(projectionMatrix, Math.PI / 4, renderer.width / renderer.height, 0.1, 1000.0);

let cameraDistance = 100;
let rotationX = 0;
let rotationY = 0;
let panX = 0;
let panY = 0;

let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;

renderer.canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
});

renderer.canvas.addEventListener('mouseup', () => {
    isDragging = false;
});

renderer.canvas.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const deltaX = e.clientX - lastMouseX;
        const deltaY = e.clientY - lastMouseY;
        rotationX += deltaY * 0.005;
        rotationY += deltaX * 0.005;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    }
});

renderer.canvas.addEventListener('wheel', (e) => {
    cameraDistance += e.deltaY * 0.05;
    cameraDistance = Math.max(2, Math.min(1000, cameraDistance));
});

window.addEventListener('keydown', (e) => {
    const panSpeed = 0.1;
    switch (e.key) {
        case 'w':
            panY += panSpeed;
            break;
        case 's':
            panY -= panSpeed;
            break;
        case 'a':
            panX -= panSpeed;
            break;
        case 'd':
            panX += panSpeed;
            break;
    }
});

const projectionMatrixLocation = programInfo.uniforms['projectionMatrix'];
const modelViewMatrixLocation = programInfo.uniforms['modelViewMatrix'];
const voxelColorLocation = programInfo.uniforms['voxelColor'];

clock.run((_deltaTime: number) => {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(programInfo.program);

    mat4.identity(modelViewMatrix);
    mat4.translate(modelViewMatrix, modelViewMatrix, [panX, panY, -cameraDistance]);
    mat4.rotateX(modelViewMatrix, modelViewMatrix, rotationX);
    mat4.rotateY(modelViewMatrix, modelViewMatrix, rotationY);

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
        dolly: cameraDistance.toFixed(0),
        pan: `${panX.toFixed(1)} x ${panY.toFixed(1)}`,
        rotation: `${rotationX.toFixed(1)} x ${rotationY.toFixed(1)}`,
    });
});
