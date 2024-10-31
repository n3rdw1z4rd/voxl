import { mat4 } from 'gl-matrix';
import { ProgramInfo } from '../utils';
import { Chunk } from './chunk';
import { Camera } from './camera';
import { VOXEL_VERTICES } from './constants';

export class World {
    chunks: Map<string, Chunk> = new Map();

    constructor(
        private gl: WebGL2RenderingContext,
        private programInfo: ProgramInfo,
        // private textureAtlas: WebGLTexture,
    ) { }

    getChunkKey(x: number, y: number, z: number): string {
        return `${x}:${y}:${z}`;
    }

    getChunk(x: number, y: number, z: number): Chunk {
        const key = this.getChunkKey(x, y, z);

        if (!this.chunks.has(key)) {
            const chunk = new Chunk(x, y, z);//, this.textureAtlas);
            chunk.generateMesh(this.gl, this.programInfo);
            this.chunks.set(key, chunk);
        }

        return this.chunks.get(key)!;
    }

    renderSingleChunk(playerX: number, playerY: number, playerZ: number) {
        const chunkX = Math.floor(playerX / Chunk.SIZE);
        const chunkY = Math.floor(playerY / Chunk.SIZE);
        const chunkZ = Math.floor(playerZ / Chunk.SIZE);

        const chunk = this.getChunk(chunkX, chunkY, chunkZ);

        this.renderChunk(chunk);
    }

    renderChunk(chunk: Chunk) {
        if (!chunk.mesh) return;

        this.gl.bindVertexArray(chunk.mesh.vao);
        this.gl.drawElements(this.gl.TRIANGLES, chunk.mesh.indexCount, this.gl.UNSIGNED_SHORT, 0);
        this.gl.bindVertexArray(null);
    }

    public render(camera: Camera) {
        const { gl, programInfo } = this;
        const voxelMatrix = mat4.create();
        const projectionMatrixLocation = programInfo.uniforms['projectionMatrix'];
        const modelViewMatrixLocation = programInfo.uniforms['modelViewMatrix'];
        const voxelColorLocation = programInfo.uniforms['voxelColor'];

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(programInfo.program);

        gl.uniformMatrix4fv(projectionMatrixLocation, false, camera.projectionMatrix);
        gl.uniformMatrix4fv(modelViewMatrixLocation, false, camera.modelViewMatrix);

        for (const voxel of this.getChunk(0, 0, 0).voxels) {
            gl.uniform4fv(voxelColorLocation, voxel.color);

            mat4.identity(voxelMatrix);
            mat4.translate(voxelMatrix, camera.modelViewMatrix, voxel.position);
            gl.uniformMatrix4fv(modelViewMatrixLocation, false, voxelMatrix);

            gl.drawArrays(gl.TRIANGLES, 0, VOXEL_VERTICES.length / 3);
        }
    }
}
