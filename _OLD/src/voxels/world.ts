import { log, ProgramInfo } from '../utils';
import { Chunk } from './chunk';
import { Camera } from './camera';
import { Node } from './node';
import { vec3 } from 'gl-matrix';

export class World extends Node {
    private gl: WebGL2RenderingContext;
    private programInfo: ProgramInfo;

    chunks: Map<string, Chunk> = new Map();

    constructor(
        gl: WebGL2RenderingContext,
        programInfo: ProgramInfo,
    ) {
        super('World');

        this.gl = gl;
        this.programInfo = programInfo;

        this.getChunk(0, 0, 0);
    }

    getChunkKey(x: number, y: number, z: number): string {
        return `${x}:${y}:${z}`;
    }

    getChunk(x: number, y: number, z: number): Chunk {
        log(`Getting chunk ${x}:${y}:${z}`);
        const key = this.getChunkKey(x, y, z);

        if (!this.chunks.has(key)) {
            const chunk = new Chunk(vec3.fromValues(x, y, z));
            this.addChild(chunk);

            chunk.generateMesh(this.gl, this.programInfo);

            this.chunks.set(key, chunk);
        }

        return this.chunks.get(key)!;
    }

    renderSingleChunk(playerX: number, playerY: number, playerZ: number, camera: Camera) {
        const chunkX = Math.floor(playerX / Chunk.SIZE);
        const chunkY = Math.floor(playerY / Chunk.SIZE);
        const chunkZ = Math.floor(playerZ / Chunk.SIZE);

        const chunk = this.getChunk(chunkX, chunkY, chunkZ);

        chunk.render(this.gl, this.programInfo, camera);
    }

    public render(camera: Camera) {
        for (const chunk of this.chunks.values()) {
            chunk.render(this.gl, this.programInfo, camera);
        }
    }
}
