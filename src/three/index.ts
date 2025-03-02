import { ClockStats, KeyValue, ThreeJsBoilerPlate, VoxelGeometry } from '../core';
import { Mesh, MeshLambertMaterial } from 'three';

const eng = new ThreeJsBoilerPlate();//({ seed: 42 });
eng.appendTo(document.getElementById('root')!);
eng.setupBasicScene({
    cameraDistance: 5,
    // gridHelper: false,
});

const geometry = new VoxelGeometry();

const material = new MeshLambertMaterial({
    vertexColors: true,
    // transparent: true,
    // depthWrite: false,
    // wireframe: true,
});

const mesh = new Mesh(geometry, material);
mesh.name = 'VoxelGeometry';
eng.scene.add(mesh);

const pickedStats = new ClockStats('top');
pickedStats.appendTo(document.body);

eng.input.on('mouse_move', ({ deltaX, deltaY }: KeyValue) => {
    if (eng.input.isMouseButtonDown(0)) {
        eng.cameraRig.orbit(deltaX, deltaY);
    }
});

eng.input.on('mouse_wheel', ({ deltaY }: KeyValue) => {
    eng.cameraRig.dolly(deltaY);
});

eng.input.on('mouse_button_clicked', () => {
    const picked = eng.pick();

    if (picked?.point && picked?.normal) {
        const normal = picked.normal;
        const point = picked.point.sub(normal).addScalar(0.5).floor();
        geometry.set(point.x, point.y, point.z, 1);
        geometry.updateGeometry();
    }

    // if (picked?.normal && picked?.point) {
    //     const pickedPoint = picked.point;
    //     const pickedNormal = picked.normal;
    //     const position = pickedPoint.clone().addScalar(0.5).sub(picked.normal).floor();

    //     pickedStats.updateAsTable({
    //         pickedPoint: pickedPoint.toArray(),
    //         pickedNormal: pickedNormal.toArray(),
    //         position: position.toArray(),
    //     });

    //     // geometry.set(position.x, position.y, position.z, 3);
    //     // geometry.updateGeometry();
    // }
});

eng.clock.run((_dt: number) => {
    eng.resize();
    eng.renderer.render(eng.scene, eng.camera);
    eng.clock.showStats();
});
