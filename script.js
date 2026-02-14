import * as THREE from 'three';

// 1. Scene & Camera
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// 2. Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 3. De Grasmaaier (Kubus)
const geometry = new THREE.BoxGeometry(0.75, 0.75, 1);
const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const mower = new THREE.Mesh(geometry, material);
mower.position.y = 0.375; 
scene.add(mower);

// 4. Licht
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);
const sunLight = new THREE.DirectionalLight(0xffffff, 1);
sunLight.position.set(5, 10, 7);
scene.add(sunLight);

// 5. Ondergrond
const grid = new THREE.GridHelper(100, 100, 0x00ff00, 0x444444);
scene.add(grid);

// 6. Besturing Logica
const keys = {};
window.addEventListener('keydown', (e) => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);

// Instellingen voor beweging
const moveSpeed = 0.1;
const rotationSpeed = 0.03;

function animate() {
    requestAnimationFrame(animate);

    // ROTATIE (L en M toetsen)
    if (keys['l']) {
        mower.rotation.y -= rotationSpeed; // Met de klok mee
    }
    if (keys['m']) {
        mower.rotation.y += rotationSpeed; // Tegen de klok in
    }

    // BEWEGING (ZQSD) 
    // We gebruiken nu sinus en cosinus zodat hij rijdt in de richting waar hij naartoe kijkt
    if (keys['z']) {
        mower.position.x -= Math.sin(mower.rotation.y) * moveSpeed;
        mower.position.z -= Math.cos(mower.rotation.y) * moveSpeed;
    }
    if (keys['s']) {
        mower.position.x += Math.sin(mower.rotation.y) * moveSpeed;
        mower.position.z += Math.cos(mower.rotation.y) * moveSpeed;
    }
    // Q en D laten we zijwaarts schuiven (strafe) relatief aan de rotatie
    if (keys['q']) {
        mower.position.x -= Math.cos(mower.rotation.y) * moveSpeed;
        mower.position.z += Math.sin(mower.rotation.y) * moveSpeed;
    }
    if (keys['d']) {
        mower.position.x += Math.cos(mower.rotation.y) * moveSpeed;
        mower.position.z -= Math.sin(mower.rotation.y) * moveSpeed;
    }

    // 7. CAMERA FOLLOW LOGICA
    // De camera staat op een vaste afstand achter de maaier, rekening houdend met de rotatie
    const offset = new THREE.Vector3(0, 3, 5); // 3m hoog, 5m achter
    offset.applyQuaternion(mower.quaternion); // Draai de offset mee met de maaier
    
    camera.position.copy(mower.position).add(offset);
    camera.lookAt(mower.position);

    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
