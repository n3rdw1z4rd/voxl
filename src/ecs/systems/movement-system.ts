import { vec3 } from 'gl-matrix';
import { ComponentMap } from '../../utils';
import { Transform, Velocity } from '../components';

export const MovementSystem = (components: ComponentMap) => {
    const transforms = components.get(Transform) ?? new Map();
    const velocities = components.get(Velocity) ?? new Map();

    for (const [entity, transform] of transforms) {
        const velocity = velocities.get(entity) as Velocity;

        if (velocity) {
            vec3.add(transform.position, transform.position, velocity.heading);

            // Emit an event to notify other systems that this entity was updated
            // dispatcher.emit('TransformUpdated', entity, transform);
        }
    }
};

export function TransformSystem(components: ComponentMap): void {
    const transforms = components.get(Transform) ?? new Map();

    for (const [entity, transform] of transforms) {
        // Apply or propagate transformations here
        // e.g., combining parent-child transformations if they exist
        console.log(`Entity ${entity} position: (${transform.position[0]}, ${transform.position[1]}, ${transform.position[2]})`);

        // Emit an event to notify other systems that this entity was updated
        // dispatcher.emit('TransformUpdated', entity, transform);
    }
}