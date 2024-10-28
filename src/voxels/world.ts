import { ProgramInfo } from '../utils';
import { Chunk } from './chunk';

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

        // Bind the mesh's vertex array object
        this.gl.bindVertexArray(chunk.mesh.vao);

        // Draw the mesh
        this.gl.drawElements(this.gl.TRIANGLES, chunk.mesh.indexCount, this.gl.UNSIGNED_SHORT, 0);

        // Unbind the vertex array object
        this.gl.bindVertexArray(null);
    }
}
