import * as THREE from 'three';

export class Chunk {
    private voxelData: number[][][];
    private mesh: THREE.Mesh;

    constructor(width: number, height: number, depth: number) {
        this.voxelData = new Array(width).fill(0).map(() =>
            new Array(height).fill(0).map(() => new Array(depth).fill(0))
        ); // Initialize voxel data

        this.mesh = new THREE.Mesh();
    }

    setVoxel(x: number, y: number, z: number, type: number) {
        if (
            x >= 0 && x < this.voxelData.length &&
            y >= 0 && y < this.voxelData[0].length &&
            z >= 0 && z < this.voxelData[0][0].length
        ) {
            this.voxelData[x][y][z] = type;
            this.buildMesh(); // Rebuild the mesh whenever a voxel is changed
        }
    }

    getVoxel(x: number, y: number, z: number): number {
        return this.voxelData[x][y][z];
    }

    buildMesh() {
        const geometry = new THREE.BufferGeometry();
        const materials: THREE.Material[] = [];

        for (let x = 0; x < this.voxelData.length; x++) {
            for (let y = 0; y < this.voxelData[0].length; y++) {
                for (let z = 0; z < this.voxelData[0][0].length; z++) {
                    if (this.voxelData[x][y][z] !== 0) {
                        const material = new THREE.MeshBasicMaterial({ color: this.getVoxelColor(this.voxelData[x][y][z]) });
                        materials.push(material);

                        // Vertex coordinates - adjusted for voxel centering
                        geometry.setAttribute('position', new THREE.Float32BufferAttribute([
                            x, y, z
                        ], 3));
                    }
                }
            }
        }

        this.mesh = new THREE.Mesh(geometry, materials);
    }

    // Helper method to get a color based on voxel type (replace with your logic)
    private getVoxelColor(type: number): number {
        switch (type) {
            case 1: return 0xff0000; // Red
            case 2: return 0x00ff00; // Green
            default: return 0x000000; // Black
        }
    }

    getMesh(): THREE.Mesh {
        return this.mesh;
    }
}



// Example Usage:

const chunk = new Chunk(16, 16, 16);
chunk.setVoxel(8, 8, 8, 1); // Set a red voxel at position (8, 8, 8)
console.log(chunk.getMesh());



