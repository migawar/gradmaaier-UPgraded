import * as THREE from 'three';

// 1. SCÈNE
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

// 2. CAMERA
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// 3. RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 4. DE GRASMAAIER (Rode Kubus)
const geometry = new THREE.BoxGeometry(0.75, 0.75, 1);
const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const mower = new THREE.Mesh(geometry, material);

// Positie op het grid
mower.position.y = 0.375; 
scene.add(mower);

// --- CAMERA FOLLOW LOGICA ---
// We voegen de camera toe aan de mower. 
// De camera positie is nu RELATIEF ten opzichte van de maaier.
mower.add(camera);
camera.position.set(0, 3, 5); // 3 meter omhoog, 5 meter naar achteren t.o.v. de maaier
camera.lookAt(0, 0, -2); // Kijk een beetje voor de maaier uit
// -----------------------------

// 5. GROND (Grid)
const grid = new THREE.GridHelper(100, 100, 0x00ff00, 0x444444);
scene.add(grid);

// 6. LICHT
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7);
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 0.6));

// 7. BESTURING (ZQSD)
const keys = {};
window.addEventListener('keydown', (e) => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);

// 8. ANIMATIE
const speed = 0.1;

function animate() {
    requestAnimationFrame(animate);

    // Beweeg de maaier
    if (keys['z']) mower.position.z -= speed;
    if (keys['s']) mower.position.z += speed;
    if (keys['q']) mower.position.x -= speed;
    if (keys['d']) mower.position.x += speed;

    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
