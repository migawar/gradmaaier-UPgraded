import * as THREE from 'three';

// 1. Scene & Camera opzet
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111); 

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// 2. Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas-container').appendChild(renderer.domElement);

// 3. De Rode Grasmaaier (Kubus)
const geometry = new THREE.BoxGeometry(0.75, 0.75, 1);
const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const mower = new THREE.Mesh(geometry, material);
mower.position.y = 0.375; 
scene.add(mower);

// --- NIEUW: HET GRAS ---
// Afmetingen bol: 0.25 x 0.25 x 0.25
const grassGeo = new THREE.SphereGeometry(0.125, 8, 8); // Straal is helft van de breedte
const grassMat = new THREE.MeshStandardMaterial({ color: 0x228b22 }); // Bosgroen

// We vullen een gebied van 10x10 meter met graspolletjes om de 0.25 meter
for (let x = -5; x < 5; x += 0.25) {
    for (let z = -5; z < 5; z += 0.25) {
        const grass = new THREE.Mesh(grassGeo, grassMat);
        grass.position.set(x, 0.125, z); // 0.125 hoog zodat ze OP het grid staan
        scene.add(grass);
    }
}
// -----------------------

// 4. Licht
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 15);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

// 5. Grid (Helpt om de beweging te zien)
const gridHelper = new THREE.GridHelper(100, 100, 0x00ff00, 0x444444);
scene.add(gridHelper);

// 6. Besturing Logica
const keys = {};
window.addEventListener('keydown', (e) => { keys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

const speed = 0.1;

// 7. Animatie Loop
function animate() {
    requestAnimationFrame(animate);

    // Beweging
    if (keys['z']) mower.position.z -= speed;
    if (keys['s']) mower.position.z += speed;
    if (keys['q']) mower.position.x -= speed;
    if (keys['d']) mower.position.x += speed;

    // Camera volgt de maaier
    camera.position.x = mower.position.x;
    camera.position.y = mower.position.y + 3; 
    camera.position.z = mower.position.z + 5; 
    
    camera.lookAt(mower.position);

    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
