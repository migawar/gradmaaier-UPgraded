import * as THREE from 'three';

// 1. Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 2. Grasmaaier (0.75 x 0.75 x 1)
const mower = new THREE.Mesh(
    new THREE.BoxGeometry(0.75, 0.75, 1),
    new THREE.MeshStandardMaterial({ color: 0xff0000 })
);
mower.position.y = 0.375;
scene.add(mower);

// 3. Oneindig Grasveld Logica
const grassGroup = new THREE.Group();
const grassGeo = new THREE.SphereGeometry(0.125, 6, 6);
const grassMat = new THREE.MeshStandardMaterial({ color: 0x228b22 });

const step = 0.35; // 0.25m bol + 0.1m marge
const viewDistance = 15; // Hoe ver we gras tekenen rondom de maaier

// We maken een grid van grasbollen
for (let x = -viewDistance; x <= viewDistance; x += step) {
    for (let z = -viewDistance; z <= viewDistance; z += step) {
        const grass = new THREE.Mesh(grassGeo, grassMat);
        grass.position.set(x, 0.125, z);
        grassGroup.add(grass);
    }
}
scene.add(grassGroup);

// 4. Licht
scene.add(new THREE.AmbientLight(0xffffff, 0.7));
const sun = new THREE.DirectionalLight(0xffffff, 1);
sun.position.set(5, 10, 7);
scene.add(sun);

// 5. Besturing
const keys = {};
window.onkeydown = (e) => keys[e.key.toLowerCase()] = true;
window.onkeyup = (e) => keys[e.key.toLowerCase()] = false;

const speed = 0.12;

function animate() {
    requestAnimationFrame(animate);

    // Beweging
    if (keys['z']) mower.position.z -= speed;
    if (keys['s']) mower.position.z += speed;
    if (keys['q']) mower.position.x -= speed;
    if (keys['d']) mower.position.x += speed;

    // INFINITE GRASS TRICK:
    // Het grasveld volgt de maaier, maar 'snapt' naar het grid van 0.35
    // Hierdoor lijkt het alsof je over een oneindig veld rijdt
    grassGroup.position.x = Math.floor(mower.position.x / step) * step;
    grassGroup.position.z = Math.floor(mower.position.z / step) * step;

    // Camera volgt
    camera.position.set(mower.position.x, mower.position.y + 3, mower.position.z + 5);
    camera.lookAt(mower.position);

    renderer.render(scene, camera);
}

animate();
