import * as THREE from 'three';

// 1. Scene & Camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// We hoeven hier nog geen vaste positie te zetten, dat doen we in de loop.

// 2. Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 3. De Rode Grasmaaier (Kubus: 0.75 x 0.75 x 1)
const geometry = new THREE.BoxGeometry(0.75, 0.75, 1);
const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const mower = new THREE.Mesh(geometry, material);
mower.position.y = 0.375; // Precies op het grid
scene.add(mower);

// 4. Oneindig Grid (of in ieder geval erg groot)
const gridHelper = new THREE.GridHelper(100, 100, 0x888888, 0x444444);
scene.add(gridHelper);

// 5. Licht
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 5);
scene.add(light);
scene.add(new THREE.AmbientLight(0x404040, 2));

// 6. Besturing (ZQSD)
const keys = { z: false, q: false, s: false, d: false };
const speed = 0.1;

window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key in keys) keys[key] = true;
});

window.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (key in keys) keys[key] = false;
});

// 7. Animatie & Follow Camera Logic
function animate() {
    requestAnimationFrame(animate);

    // Beweging van de grasmaaier
    if (keys.z) mower.position.z -= speed;
    if (keys.s) mower.position.z += speed;
    if (keys.q) mower.position.x -= speed;
    if (keys.d) mower.position.x += speed;

    // CAMERA VOLGT DE MAAIER
    // We plaatsen de camera altijd 5 meter achter en 3 meter boven de maaier
    const relativeCameraOffset = new THREE.Vector3(0, 3, 5);
    const cameraOffset = relativeCameraOffset.applyMatrix4(mower.matrixWorld);

    camera.position.x = mower.position.x;
    camera.position.y = mower.position.y + 3; // 3 meter hoog
    camera.position.z = mower.position.z + 5; // 5 meter erachter

    // Zorg dat de camera altijd naar de grasmaaier blijft kijken
    camera.lookAt(mower.position);

    renderer.render(scene, camera);
}

animate();
