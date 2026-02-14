import * as THREE from 'three';

// 1. Scene & Camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 3, 5); // Camera positie voor goed overzicht
camera.lookAt(0, 0, 0);

// 2. Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas-container').appendChild(renderer.domElement);

// 3. De Rode Grasmaaier (Kubus)
// Afmetingen: Breedte: 0.75, Hoogte: 0.75, Lengte: 1
const geometry = new THREE.BoxGeometry(0.75, 0.75, 1);
const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const mower = new THREE.Mesh(geometry, material);

// CRUCIAL: Zet de onderkant OP het grid (y = hoogte / 2)
mower.position.y = 0.375; 

scene.add(mower);

// 4. Het Grid (de "ondergrond")
const gridHelper = new THREE.GridHelper(10, 10, 0x888888, 0x444444);
scene.add(gridHelper);

// 5. Licht
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);
scene.add(new THREE.AmbientLight(0x404040, 1.5));

// 6. Besturing (ZQSD)
const keys = { z: false, q: false, s: false, d: false };
const speed = 0.05;

window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key in keys) keys[key] = true;
});

window.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (key in keys) keys[key] = false;
});

// 7. Animatie & Beweging
function animate() {
    requestAnimationFrame(animate);

    // Beweging over de vloer (X en Z as)
    if (keys.z) mower.position.z -= speed; // Vooruit
    if (keys.s) mower.position.z += speed; // Achteruit
    if (keys.q) mower.position.x -= speed; // Links
    if (keys.d) mower.position.x += speed; // Rechts

    renderer.render(scene, camera);
}

// Window resize support
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
