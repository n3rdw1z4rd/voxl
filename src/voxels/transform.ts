import { mat4, vec3, quat } from 'gl-matrix';

export class Transform {
    public position: vec3 = vec3.create();
    public rotation: quat = quat.create(); // Using quaternion for rotation
    public scale: vec3 = vec3.fromValues(1, 1, 1);
    public modelMatrix: mat4 = mat4.create();

    constructor() {
        this.updateModelMatrix();
    }

    public translate(translation: vec3) {
        vec3.add(this.position, this.position, translation);
        this.updateModelMatrix();
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

        this.updateModelMatrix();
    }

    public scaleBy(factor: vec3) {
        vec3.multiply(this.scale, this.scale, factor);
        this.updateModelMatrix();
    }

    public updateModelMatrix() {
        mat4.fromRotationTranslationScale(this.modelMatrix, this.rotation, this.position, this.scale);
    }

    public getModelMatrix(): mat4 {
        return this.modelMatrix;
    }
}