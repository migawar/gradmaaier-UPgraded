import * as THREE from 'three';

// 1. SCÈNE & CAMERA
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// 2. RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 3. DE MAAIER (Rode kubus: 0.75 breed, 0.75 hoog, 1 lang)
const mowerGeo = new THREE.BoxGeometry(0.75, 0.75, 1);
const mowerMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const mower = new THREE.Mesh(mowerGeo, mowerMat);
mower.position.y = 0.375; // Precies op de grond
scene.add(mower);

// 4. HET GRAS (Oneindig effect)
const grassGroup = new THREE.Group();
const grassGeo = new THREE.SphereGeometry(0.125, 6, 6); // Diameter 0.25m
const grassMat = new THREE.MeshStandardMaterial({ color: 0x228b22 });

const spacing = 0.1; // De gevraagde marge
const step = 0.25 + spacing; // Totale afstand tussen bollen: 0.35m
const range = 12; // Hoe ver het grasveld rondom de maaier getekend wordt

for (let x = -range; x <= range; x += step) {
    for (let z = -range; z <= range; z += step) {
        const grass = new THREE.Mesh(grassGeo, grassMat);
        grass.position.set(x, 0.125, z);
        grassGroup.add(grass);
    }
}
scene.add(grassGroup);

// 5. LICHT
const light = new THREE.DirectionalLight(0xffffff, 1.5);
light.position.set(5, 10, 7);
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 0.6));

// 6. INPUT (ZQSD)
const keys = {};
window.addEventListener('keydown', (e) => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);

// 7. ANIMATIE LOOP
const speed = 0.12;

function animate() {
    requestAnimationFrame(animate);

    // Beweging van de maaier
    if (keys['z']) mower.position.z -= speed;
    if (keys['s']) mower.position.z += speed;
    if (keys['q']) mower.position.x -= speed;
    if (keys['d']) mower.position.x += speed;

    // INFINITE GRASS LOGIC
    // Het grasveld 'snapt' naar het grid terwijl het de maaier volgt
    grassGroup.position.x = Math.floor(mower.position.x / step) * step;
    grassGroup.position.z = Math.floor(mower.position.z / step) * step;

    // CAMERA VOLGT DE MAAIER
    camera.position.x = mower.position.x;
    camera.position.y = mower.position.y + 4; // 4m hoog
    camera.position.z = mower.position.z + 6; // 6m erachter
    camera.lookAt(mower.position);

    renderer.render(scene, camera);
}

// Window Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
