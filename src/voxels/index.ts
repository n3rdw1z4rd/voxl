import { vec3 } from 'gl-matrix';
import { Clock, ProgramInfo, Renderer, rng, UserInput } from '../utils';
import { FRAGMENT_SHADER_SOURCE, VERTEX_SHADER_SOURCE } from './constants';
import { World } from './world';
import { Chunk } from './chunk';
import { Camera } from './camera';

const SEED: number = 42;
const MOVE_SPEED: number = 0.1;

rng.seed = SEED;

const clock = new Clock();
const input = new UserInput();
const renderer = new Renderer({ parent: document.getElementById('app')! });
const { gl } = renderer;

const programInfo: ProgramInfo = Renderer.CreateProgramInfo(gl, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE);
const world = new World(gl, programInfo);

const camera = new Camera();
camera.rotate(vec3.fromValues(0, Math.PI, 0));

input.on('mouseMove', (e: MouseEvent) => {
    if (input.isButtonDown(0)) {
        camera.rotate(vec3.fromValues(-e.movementY * 0.005, -e.movementX * 0.005, 0));
    }
});

// input.on('wheel', (e) => {
//     camera.distance = Math.max(2, Math.min(1000, camera.distance + (e.deltaY * 0.05)));
// });

clock.run((_deltaTime: number) => {
    if (renderer.resize()) {
        camera.setAspectRatio(window.innerWidth / window.innerHeight);
    }

    camera.move(vec3.fromValues(
        (input.isKeyDown('KeyD') ? 1 : 0) + (input.isKeyDown('KeyA') ? -1 : 0),
        0,
        (input.isKeyDown('KeyW') ? -1 : 0) + (input.isKeyDown('KeyS') ? 1 : 0),
    ), MOVE_SPEED);

    camera.update();
    world.render(camera);

    clock.showStats({
        seed: SEED,
        chunk: `${Chunk.SIZE} (${Math.pow(Chunk.SIZE, 2) * Chunk.HEIGHT})`,
        distance: camera.distance.toFixed(0),
        position: `x: ${camera.position[0].toFixed(1)} y: ${camera.position[1].toFixed(1)} z: ${camera.position[2].toFixed(1)}`,
        rotation: `x: ${camera.rotation[0].toFixed(1)} y: ${camera.rotation[1].toFixed(1)} z: ${camera.rotation[2].toFixed(1)}`,
    });
});
