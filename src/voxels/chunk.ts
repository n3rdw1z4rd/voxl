import { ProgramInfo, rng, SimplexNoise } from '../utils';
import { VOXEL_VERTICES } from './constants';

export type Position = [number, number, number];
export type Color = [number, number, number, number];

export type Voxel = {
    position: Position;
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
                    const position: Position = [x, y, z];

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

    // addLabel(vertices: number[], indices: number[], colors: number[], texCoords: number[], text: string, x: number, y: number, z: number) {
    //     const charWidth = 0.1;
    //     const charHeight = 0.1;
    //     const textureAtlasWidth = 256; // Width of the texture atlas in pixels
    //     const textureAtlasHeight = 256; // Height of the texture atlas in pixels
    //     const charsPerRow = 16; // Number of characters per row in the texture atlas

    //     for (let i = 0; i < text.length; i++) {
    //         const char = text.charCodeAt(i);
    //         const tx = (char % charsPerRow) / charsPerRow;
    //         const ty = Math.floor(char / charsPerRow) / charsPerRow;

    //         const labelBaseIndex = vertices.length / 3;

    //         // Define the vertices for the quad
    //         vertices.push(
    //             x + i * charWidth, y, z,
    //             x + (i + 1) * charWidth, y, z,
    //             x + (i + 1) * charWidth, y + charHeight, z,
    //             x + i * charWidth, y + charHeight, z
    //         );

    //         // Define the texture coordinates for the quad
    //         texCoords.push(
    //             tx, ty,
    //             tx + 1 / charsPerRow, ty,
    //             tx + 1 / charsPerRow, ty + 1 / charsPerRow,
    //             tx, ty + 1 / charsPerRow
    //         );

    //         // Define the indices for the quad
    //         indices.push(
    //             labelBaseIndex, labelBaseIndex + 1, labelBaseIndex + 2,
    //             labelBaseIndex, labelBaseIndex + 2, labelBaseIndex + 3
    //         );

    //         // Define the colors for the quad (white)
    //         for (let j = 0; j < 4; j++) {
    //             colors.push(1.0, 1.0, 1.0);
    //         }
    //     }
    // }
}
