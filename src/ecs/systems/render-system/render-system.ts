import { ComponentMap } from '../../../utils';
import { Mesh, Transform } from '../../components';
import { WebGlContext } from './webgl-context';

export interface CreateRenderSystemParams {
    webGlContext: WebGlContext;
}

export function CreateRenderSystem({
    webGlContext,
}: CreateRenderSystemParams): (components: ComponentMap) => void {

    return (components: ComponentMap): void => {
        const transforms = components.get(Mesh) ?? new Map();

        if (transforms.size > 0) {
            webGlContext.clear();

            for (const [entity, transform] of transforms) {
                // Apply or propagate transformations here
                // e.g., combining parent-child transformations if they exist
                console.log(`Entity ${entity} position: (${transform.position.x}, ${transform.position.y}, ${transform.position.z})`);

                // Emit an event to notify other systems that this entity was updated
                // dispatcher.emit('TransformUpdated', entity, transform);
            }
        }
    };
}
