import { Transform } from './transform';

export class Node {
    public name: string;
    public children: Node[] = [];
    public transform: Transform = new Transform();

    constructor(name: string = '') {
        this.name = name;
    }

    addChild(child: Node) {
        this.children.push(child);
        child.transform.parent = this.transform;
    }

    removeChild(child: Node) {
        const index = this.children.indexOf(child);
        if (index !== -1) {
            this.children.splice(index, 1);
            child.transform.parent = null;
        }
    }

    updateWorldMatrix() {
        this.transform.updateWorldMatrix();
        
        for (const child of this.children) {
            child.updateWorldMatrix();
        }
    }
}