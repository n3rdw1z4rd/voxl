import { mat4, vec3, quat } from 'gl-matrix';

export class Transform {
    public position: vec3 = vec3.create();
    public rotation: quat = quat.create(); // Using quaternion for rotation
    public scale: vec3 = vec3.fromValues(1, 1, 1);
    public localMatrix: mat4 = mat4.create();
    public worldMatrix: mat4 = mat4.create();
    public parent: Transform | null = null;

    constructor() {
        this.updateLocalMatrix();
        this.updateWorldMatrix();
    }

    public translate(translation: vec3) {
        vec3.add(this.position, this.position, translation);
        this.updateLocalMatrix();
    }

    public rotate(rotation: vec3) {
        const rotationQuatX = quat.create();
        const rotationQuatY = quat.create();
        const rotationQuatZ = quat.create();

        quat.setAxisAngle(rotationQuatX, [1, 0, 0], rotation[0]);
        quat.setAxisAngle(rotationQuatY, [0, 1, 0], rotation[1]);
        quat.setAxisAngle(rotationQuatZ, [0, 0, 1], rotation[2]);

        quat.multiply(this.rotation, this.rotation, rotationQuatX);
        quat.multiply(this.rotation, this.rotation, rotationQuatY);
        quat.multiply(this.rotation, this.rotation, rotationQuatZ);

        this.updateLocalMatrix();
    }

    public scaleBy(factor: vec3) {
        vec3.multiply(this.scale, this.scale, factor);
        this.updateLocalMatrix();
    }

    public updateLocalMatrix() {
        mat4.fromRotationTranslationScale(this.localMatrix, this.rotation, this.position, this.scale);
        this.updateWorldMatrix();
    }

    public updateWorldMatrix() {
        if (this.parent) {
            mat4.multiply(this.worldMatrix, this.parent.worldMatrix, this.localMatrix);
        } else {
            mat4.copy(this.worldMatrix, this.localMatrix);
        }
    }

    public getWorldMatrix(): mat4 {
        return this.worldMatrix;
    }

    public localToWorld(localPoint: vec3): vec3 {
        const worldPoint = vec3.create();
        vec3.transformMat4(worldPoint, localPoint, this.worldMatrix);
        return worldPoint;
    }

    public worldToLocal(worldPoint: vec3): vec3 {
        const localPoint = vec3.create();
        const inverseWorldMatrix = mat4.create();
        mat4.invert(inverseWorldMatrix, this.worldMatrix);
        vec3.transformMat4(localPoint, worldPoint, inverseWorldMatrix);
        return localPoint;
    }
}