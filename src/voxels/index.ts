import { vec3 } from 'gl-matrix';
import { Clock, ProgramInfo, Renderer, rng, UserInput } from '../utils';
import { FRAGMENT_SHADER_SOURCE, VERTEX_SHADER_SOURCE } from './constants';
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
camera.rotate(vec3.fromValues(0, Math.PI, 0));

input.on('mouseMove', (e: MouseEvent) => {
    if (input.isButtonDown(0)) {
        const deltaX = e.movementX;
        const deltaY = e.movementY;

        camera.rotate(vec3.fromValues(deltaY * 0.005, deltaX * 0.005, 0));
    }
});

input.on('wheel', (e) => {
    camera.distance = Math.max(2, Math.min(1000, camera.distance + (e.deltaY * 0.05)));
});

clock.run((_deltaTime: number) => {
    if (renderer.resize()) {
        camera.setAspectRatio(window.innerWidth / window.innerHeight);
    }

    camera.move(vec3.fromValues(
        (input.isKeyDown('KeyD') ? 1 : 0) + (input.isKeyDown('KeyA') ? -1 : 0),
        0,
        (input.isKeyDown('KeyW') ? -1 : 0) + (input.isKeyDown('KeyS') ? 1 : 0),
    ), 2.0);

    camera.update();
    world.render(camera);

    clock.showStats({
        seed: SEED,
        chunk: `${Chunk.SIZE} (${Math.pow(Chunk.SIZE, 2) * Chunk.HEIGHT})`,
        dolly: camera.distance.toFixed(0),
        pan: `${camera.position[0].toFixed(1)} x ${camera.position[1].toFixed(1)}`,
        rotation: `${camera.rotation[0].toFixed(1)} x ${camera.rotation[1].toFixed(1)}`,
    });
});
