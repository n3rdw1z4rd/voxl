import { vec3 } from 'gl-matrix';
import { Clock } from '../utils';
import { ECS } from '../utils/ecs';
import { CreateRenderSystem } from './systems';
import { WebGlContext } from './systems/render-system/webgl-context';
import { Transform, Velocity } from './components';
import { MovementSystem, TransformSystem } from './systems';

const clock = new Clock();
const ecs = new ECS();

const webGlContext = new WebGlContext({ parent: document.getElementById('app')! });
const RenderSystem = CreateRenderSystem({ webGlContext });

const entity = ecs.createEntity();
ecs.addComponent(entity, new Transform());
ecs.addComponent(entity, new Velocity(vec3.fromValues(1, 0, 0)));

ecs.addSystem(MovementSystem);
ecs.addSystem(TransformSystem);
// ecs.addSystem(RenderSystem);

clock.run((_deltaTime: number) => {
    ecs.update();

    const transform = ecs.getComponent(entity, Transform);

    clock.showStats({
        position: `${transform?.position[0]}, ${transform?.position[1]}, ${transform?.position[2]}`,
    });
});