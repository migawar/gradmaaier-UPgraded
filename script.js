import * as THREE from 'three';

// 1. Scene & Camera opzet
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111); 

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// 2. Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
const container = document.getElementById('canvas-container');
if (container) {
    container.appendChild(renderer.domElement);
} else {
    document.body.appendChild(renderer.domElement);
}

// 3. De Rode Grasmaaier (0.75 x 0.75 x 1)
const mowerGeo = new THREE.BoxGeometry(0.75, 0.75, 1);
const mowerMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const mower = new THREE.Mesh(mowerGeo, mowerMat);
mower.position.y = 0.375; 
scene.add(mower);

// 4. HET GRAS (Bollen van 0.25m, met 0.1m tussenruimte)
const grassGroup = new THREE.Group();
const grassGeo = new THREE.SphereGeometry(0.125, 6, 6); // Straal is 0.125 (diameter 0.25)
const grassMat = new THREE.MeshStandardMaterial({ color: 0x228b22 });

const step = 0.35; // 0.25m breedte + 0.1m tussenruimte
const areaSize = 5; // Vult van -5 tot +5 meter

for (let x = -areaSize; x <= areaSize; x += step) {
    for (let z = -areaSize; z <= areaSize; z += step) {
        const grassPos = new THREE.Mesh(grassGeo, grassMat);
        grassPos.position.set(x, 0.125, z);
        grassGroup.add(grassPos);
    }
}
scene.add(grassGroup);

// 5. Licht
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 15);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

// 6. Grid (voor de horizon)
const gridHelper = new THREE.GridHelper(100, 100, 0x00ff00, 0x444444);
scene.add(gridHelper);

// 7. Besturing
const keys = {};
window.addEventListener('keydown', (e) => { keys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

const speed = 0.1;

// 8. Animatie Loop
function animate() {
    requestAnimationFrame(animate);

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
