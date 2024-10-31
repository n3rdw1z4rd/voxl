import { Node } from './node';
import { Camera } from './camera';

export class Scene {
    public root: Node = new Node('root');

    constructor(public camera: Camera) {}

    update() {
        this.root.updateWorldMatrix();
    }

    render() {
        // Implement rendering logic here
        // Traverse the scene graph and render each node
    }
}