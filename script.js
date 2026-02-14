import * as THREE from 'three';

// 1. Scene & Camera
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// 2. Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 3. De Rode Grasmaaier (0.75 x 0.75 x 1)
const geometry = new THREE.BoxGeometry(0.75, 0.75, 1);
const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const mower = new THREE.Mesh(geometry, material);

// Zet hem OP het grid
mower.position.y = 0.375; 
scene.add(mower);

// 4. Licht (Zonder licht is alles zwart!)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);
const sunLight = new THREE.DirectionalLight(0xffffff, 1);
sunLight.position.set(5, 10, 5);
scene.add(sunLight);

// 5. Het Grid
const gridHelper = new THREE.GridHelper(100, 100, 0x00ff00, 0x444444);
scene.add(gridHelper);

// 6. Besturing (ZQSD)
const keys = {};
window.addEventListener('keydown', (e) => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);

const speed = 0.1;

// 7. Animatie & Follow Camera
function animate() {
    requestAnimationFrame(animate);

    // Simpele beweging over de assen
    if (keys['z']) mower.position.z -= speed;
    if (keys['s']) mower.position.z += speed;
    if (keys['q']) mower.position.x -= speed;
    if (keys['d']) mower.position.x += speed;

    // CAMERA VOLGT DE MAAIER (Vaste offset methode)
    // De camera blijft altijd op dezelfde afstand, ongeacht rotatie
    camera.position.x = mower.position.x;
    camera.position.y = mower.position.y + 3; // 3 meter hoog
    camera.position.z = mower.position.z + 5; // 5 meter erachter
    
    camera.lookAt(mower.position);

    renderer.render(scene, camera);
}

// Window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
