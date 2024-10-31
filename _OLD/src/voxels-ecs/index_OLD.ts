import { vec3, mat4 } from 'gl-matrix';
import { Clock, ECS, log, ProgramInfo, Renderer } from '../utils';
import { FRAGMENT_SHADER_SOURCE, VERTEX_SHADER_SOURCE } from '../voxels/constants';

log('initializing voxels-ecs...');

const clock = new Clock();
const renderer = new Renderer({ parent: document.getElementById('app')! });
const gl: WebGL2RenderingContext = renderer.gl;

const programInfo: ProgramInfo = Renderer.CreateProgramInfo(gl, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE);

const ecs = ECS.instance;

ecs.createComponent('Mesh', {
    geometry: () => {
        const vertices = [
            vec3.fromValues(-0.5, -0.5, -0.5), // Bottom-left-back
            vec3.fromValues(0.5, -0.5, -0.5), // Bottom-right-back
            vec3.fromValues(0.5, 0.5, -0.5), // Top-right-back
            vec3.fromValues(-0.5, 0.5, -0.5), // Top-left-back
            vec3.fromValues(-0.5, -0.5, 0.5), // Bottom-left-front
            vec3.fromValues(0.5, -0.5, 0.5), // Bottom-right-front
            vec3.fromValues(0.5, 0.5, 0.5), // Top-right-front
            vec3.fromValues(-0.5, 0.5, 0.5)  // Top-left-front
        ];

        const indices = [
            0, 1, 2, 0, 2, 3, // Front face
            4, 5, 6, 4, 6, 7, // Back face
            0, 4, 7, 0, 7, 3, // Left face
            1, 5, 6, 1, 6, 2, // Right face
            0, 1, 5, 0, 5, 4, // Bottom face
            3, 2, 6, 3, 6, 7   // Top face
        ];

        return { vertices, indices };
    },
    material: () => {

    },
    vao: () => {
        return null;
    },
});

ecs.createComponent('CameraProperties', {
    fov: 45,
    aspect: 1,
    near: 0.1,
    far: 1000,
    projectionMatrix: mat4.create(),
    viewMatrix: mat4.create(),
});

ecs.createComponent('Transform', {
    position: vec3.create(),
    rotation: vec3.create(),
    scale: vec3.fromValues(1, 1, 1),
});

ecs.createSystem('RenderMesh', 'Mesh', 'Transform', 'CameraProperties', (_entity, { Mesh, Transform, CameraProperties }) => {
    if (Mesh.vao) {
        // Calculate the model matrix
        const modelMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, Transform.position);
        mat4.rotateX(modelMatrix, modelMatrix, Transform.rotation[0]);
        mat4.rotateY(modelMatrix, modelMatrix, Transform.rotation[1]);
        mat4.rotateZ(modelMatrix, modelMatrix, Transform.rotation[2]);
        mat4.scale(modelMatrix, modelMatrix, Transform.scale);

        // Calculate the MVP matrix (Model * View * Projection)
        const mvpMatrix = mat4.create();
        mat4.multiply(mvpMatrix, CameraProperties.projectionMatrix, CameraProperties.viewMatrix);
        mat4.multiply(mvpMatrix, mvpMatrix, modelMatrix);

        // Send the MVP matrix to the shader
        gl.uniformMatrix4fv(gl.getUniformLocation(Mesh.material.program, "uMVP"), false, mvpMatrix);

        // Render the mesh
        gl.bindVertexArray(Mesh.vao);
        gl.drawArrays(gl.TRIANGLES, 0, Mesh.geometry.vertexCount);
    }
});

ecs.createSystem('UpdateCamera', 'CameraProperties', 'Transform', (_entity, components) => {
    const { CameraProperties, Transform } = components;

    mat4.lookAt(
        CameraProperties.viewMatrix,
        Transform.position,
        vec3.add(vec3.create(), Transform.position, vec3.fromValues(0, 0, -1)),
        vec3.fromValues(0, 1, 0)
    );
});

ecs.createEntity('CameraProperties', 'Transform');
ecs.createEntity('Mesh', 'Transform');

clock.run((_deltaTime: number) => {
    renderer.clear();
    renderer.resize();
    ecs.update();
    clock.showStats();
});
