// import * as THREE from 'three';
// import { Chunk } from './chunk'; // Assuming your Chunk class is in chunk.ts

// const scene = new THREE.Scene();
// const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// const renderer = new THREE.WebGLRenderer({ antialias: true });
// renderer.setSize(window.innerWidth, window.innerHeight);
// document.body.appendChild(renderer.domElement);

// // Lighting (ambient and directional)
// const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light
// scene.add(ambientLight);

// const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
// directionalLight.position.set(1, 1, 1);
// scene.add(directionalLight);

// // Chunk creation and positioning
// const chunk = new Chunk(16, 16, 16);
// chunk.setVoxel(8, 8, 8, 1); // Set a voxel for demonstration
// scene.add(chunk.getMesh());

// camera.position.z = 5;

// // Animation loop
// function animate() {
//     requestAnimationFrame(animate);
//     renderer.render(scene, camera);
// }

// animate();



