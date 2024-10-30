import { vec3 } from 'gl-matrix';
import { ProgramInfo, rng, SimplexNoise } from '../utils';
import { VOXEL_VERTICES } from './constants';

export type Color = [number, number, number, number];

export type Voxel = {
    position: vec3;
    color: Color;
};

export class Chunk {
    public static readonly SIZE = 64;
    public static readonly HEIGHT = 8;

    mesh: { vao: WebGLVertexArrayObject, indexCount: number } | null = null;
    vertexCount: number = 0; // Add vertexCount property

    voxels: Voxel[] = [];

    constructor(
        private x: number,
        private y: number,
        private z: number,
        // private textureAtlas: WebGLTexture,
    ) {
        const simplex = new SimplexNoise();
        const xo = this.x * Chunk.SIZE;
        const yo = this.y * Chunk.SIZE;

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

                    if (simplex.noise3d(xo + x, yo + y, this.z + z)) {
                        this.voxels.push({ position, color });
                    }
                }
            }
        }
    }

    generateMesh(gl: WebGL2RenderingContext, programInfo: ProgramInfo) {
        const positionBuffer: WebGLBuffer = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(VOXEL_VERTICES), gl.STATIC_DRAW);

        const positionLocation = programInfo.attributes['position'];
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
    }
}
