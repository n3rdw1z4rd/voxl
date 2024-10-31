import { vec3, mat4 } from 'gl-matrix';
import { log, ProgramInfo, rng, SimplexNoise } from '../utils';
import { VOXEL_VERTICES } from './constants';
import { Node } from './node';
import { Camera } from './camera';

export type Color = [number, number, number, number];

export type Voxel = {
    position: vec3;
    color: Color;
};

export class Chunk extends Node {
    public static readonly SIZE = 64;
    public static readonly HEIGHT = 8;

    voxels: Array<Voxel> = new Array(Chunk.SIZE * Chunk.HEIGHT * Chunk.SIZE);
    vertexCount: number = 0;

    mesh: { vao: WebGLVertexArrayObject, indexCount: number } | null = null;

    constructor(position: vec3) {
        super();

        const simplex = new SimplexNoise();

        const xo = (0 | position[0]) * Chunk.SIZE;
        const yo = (0 | position[1]) * Chunk.SIZE;
        const zo = (0 | position[2]) * Chunk.SIZE;

        for (let x = 0; x < Chunk.SIZE; x++) {
            for (let y = 0; y < Chunk.HEIGHT; y++) {
                for (let z = 0; z < Chunk.SIZE; z++) {
                    const position: vec3 = vec3.fromValues(x, y, z);

                    const color: Color = [
                        rng.nextf,
                        rng.nextf,
                        rng.nextf,
                        1.0,
                    ];

                    if (simplex.noise3d(xo + x, yo + y, zo + z)) {
                        this.voxels.push({ position, color });
                    }
                }
            }
        }
    }

    generateMesh(gl: WebGL2RenderingContext, programInfo: ProgramInfo) {
        log('Generating mesh...');

        const vao = gl.createVertexArray()!;
        gl.bindVertexArray(vao);

        const positionBuffer: WebGLBuffer = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(VOXEL_VERTICES), gl.STATIC_DRAW);

        const positionLocation = programInfo.attributes['position'];
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

        const indices = new Uint16Array([...Array(VOXEL_VERTICES.length / 3).keys()]);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

        this.mesh = {
            vao: vao,
            indexCount: indices.length,
        };

        gl.bindVertexArray(null);
    }

    render(gl: WebGL2RenderingContext, programInfo: ProgramInfo, camera: Camera) {
        if (!this.mesh) return;

        gl.bindVertexArray(this.mesh.vao);
        gl.drawElements(gl.TRIANGLES, this.mesh.indexCount, gl.UNSIGNED_SHORT, 0);
        gl.bindVertexArray(null);

        const voxelMatrix = mat4.create();
        const projectionMatrixLocation = programInfo.uniforms['projectionMatrix'];
        const modelViewMatrixLocation = programInfo.uniforms['modelViewMatrix'];
        const voxelColorLocation = programInfo.uniforms['voxelColor'];

        gl.uniformMatrix4fv(projectionMatrixLocation, false, camera.projectionMatrix);
        gl.uniformMatrix4fv(modelViewMatrixLocation, false, camera.modelViewMatrix);

        for (const voxel of this.voxels) {
            gl.uniform4fv(voxelColorLocation, voxel.color);

            mat4.identity(voxelMatrix);
            mat4.translate(voxelMatrix, camera.modelViewMatrix, voxel.position);
            gl.uniformMatrix4fv(modelViewMatrixLocation, false, voxelMatrix);

            gl.drawArrays(gl.TRIANGLES, 0, VOXEL_VERTICES.length / 3);
        }

        // Check for errors
        const error = gl.getError();
        if (error !== gl.NO_ERROR) {
            console.error('WebGL Error:', error);
        }
    }
}
