export type Entity = number;

export interface Component { }

export type ComponentType = new (...args: any[]) => Component;
export type EntityComponentMap = Map<Entity, Component>;
export type ComponentMap = Map<ComponentType, EntityComponentMap>;
export type System = (components: ComponentMap) => void;

export class ECS {
    private nextEntityId: Entity = 0;
    private entities: Set<Entity> = new Set();
    private components: ComponentMap = new Map();
    private systems: System[] = [];

    createEntity(): Entity {
        const entity = this.nextEntityId++;
        this.entities.add(entity);
        return entity;
    }

    addComponent<T extends Component>(entity: Entity, component: T): void {
        const componentType = component.constructor as ComponentType;

        if (!this.components.has(componentType)) {
            this.components.set(componentType, new Map());
        }

        this.components.get(componentType)!.set(entity, component);
    }

    getComponent<T extends Component>(entity: Entity, componentType: new (...args: any[]) => T): T | undefined {
        return this.components.get(componentType)?.get(entity) as T | undefined;
    }

    addSystem(systemFunc: (components: Map<ComponentType, Map<Entity, Component>>) => void): void {
        this.systems.push(systemFunc);
    }

    update(): void {
        for (const system of this.systems) {
            system(this.components);
        }
    }
}