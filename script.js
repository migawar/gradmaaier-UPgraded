import * as THREE from 'three';

// 1. Scene & Camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 5); // Iets hoger kijken voor beter overzicht
camera.lookAt(0, 0, 0);

// 2. Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas-container').appendChild(renderer.domElement);

// 3. De Rode Kubus (0.75 x 0.75 x 1)
const geometry = new THREE.BoxGeometry(0.75, 0.75, 1);
const material = new THREE.MeshStandardMaterial({ color: 0xff0000 }); // Rood
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// 4. Grondvlak (Grid) om beweging te zien
const gridHelper = new THREE.GridHelper(10, 10);
scene.add(gridHelper);

// 5. Licht
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);
scene.add(new THREE.AmbientLight(0x404040));

// 6. Besturing (ZQSD)
const keys = { z: false, q: false, s: false, d: false };
const speed = 0.05;

window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (keys.hasOwnProperty(key)) keys[key] = true;
});

window.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (keys.hasOwnProperty(key)) keys[key] = false;
});

// 7. Animatie & Beweging Logic
function animate() {
    requestAnimationFrame(animate);

    // Beweging toepassen
    if (keys.z) cube.position.z -= speed; // Vooruit
    if (keys.s) cube.position.z += speed; // Achteruit
    if (keys.q) cube.position.x -= speed; // Links
    if (keys.d) cube.position.x += speed; // Rechts

    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
