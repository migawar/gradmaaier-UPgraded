import * as THREE from 'three';

// 1. SCÈNE & CAMERA
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// 2. RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- ECONOMIE & STATS ---
let geld = 0.00;
let totaalVerdiend = 0.00; 
let trofeeën = 0;
let grasWaarde = 0.01;
let huidigMowerRadius = 1.0;
let huidigeSnelheid = 0.12;

let prijsRadius = 5.00;
let prijsSnelheid = 5.00;
let prijsWaarde = 10.00;

const MAX_RADIUS = 10.0;
const MAX_WAARDE = 5.01;

// --- UI ELEMENTEN ---
const geldDisplay = document.createElement('div');
geldDisplay.style.cssText = 'position:absolute; top:10px; left:10px; color:white; font-size:24px; font-family:monospace; background:rgba(0,0,0,0.5); padding:10px; border-radius:5px; z-index:10;';
document.body.appendChild(geldDisplay);

const trofeeDisplay = document.createElement('div');
trofeeDisplay.style.cssText = 'position:absolute; top:10px; right:10px; color:#f1c40f; font-size:24px; font-family:monospace; background:rgba(0,0,0,0.5); padding:10px; border-radius:5px; border: 2px solid #f1c40f; z-index:10;';
document.body.appendChild(trofeeDisplay);

const menu = document.createElement('div');
menu.style.cssText = 'position:absolute; left:10px; top:50%; transform:translateY(-50%); display:flex; flex-direction:column; gap:10px; z-index:10;';
document.body.appendChild(menu);

function maakKnop(tekst, actie) {
    const btn = document.createElement('button');
    btn.style.cssText = 'background:#2ecc71; color:white; border:none; padding:15px; cursor:pointer; border-radius:5px; font-weight:bold; text-align:left; min-width:200px;';
    btn.onclick = actie;
    menu.appendChild(btn);
    return btn;
}

const btnRadius = maakKnop('', () => {
    if (geld >= prijsRadius && huidigMowerRadius < MAX_RADIUS) {
        geld -= prijsRadius;
        huidigMowerRadius += 0.45;
        prijsRadius *= 1.6;
        updateUI();
    }
});

const btnSpeed = maakKnop('', () => {
    if (geld >= prijsSnelheid) {
        geld -= prijsSnelheid;
        huidigeSnelheid += 0.03; 
        prijsSnelheid *= 1.5;
        updateUI();
    }
});

const btnWaarde = maakKnop('', () => {
    if (geld >= prijsWaarde && grasWaarde < MAX_WAARDE) {
        geld -= prijsWaarde;
        grasWaarde += 0.10;
        prijsWaarde *= 1.7;
        updateUI();
    }
});

function updateUI() {
    geldDisplay.innerText = '$ ' + geld.toFixed(2);
    trofeeDisplay.innerText = '🏆 Trofeeën: ' + trofeeën;
    
    btnRadius.innerText = huidigMowerRadius >= MAX_RADIUS ? "BEREIK: MAX" : `GROTER BEREIK ($${prijsRadius.toFixed(2)})`;
    btnWaarde.innerText = grasWaarde >= MAX_WAARDE ? "WAARDE: MAX" : `MEER WAARDE ($${prijsWaarde.toFixed(2)})`;
    btnSpeed.innerText = `SNELLER ($${prijsSnelheid.toFixed(2)})`;
}

// 3. DE MAAIER
const mowerGeo = new THREE.BoxGeometry(1, 1, 1);
const mowerMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const mower = new THREE.Mesh(mowerGeo, mowerMat);
mower.scale.set(0.75, 0.75, 1.0);
mower.position.y = 0.375;
scene.add(mower);

// 4. HET GRASVELD (55x55m)
const grassArray = [];
const grassGeo = new THREE.SphereGeometry(0.125, 3, 3); 
const grassMat = new THREE.MeshStandardMaterial({ color: 0x228b22 });
const step = 0.35; 
const fieldSize = 27.5; 

for (let x = -fieldSize; x <= fieldSize; x += step) {
    for (let z = -fieldSize; z <= fieldSize; z += step) {
        const grass = new THREE.Mesh(grassGeo, grassMat);
        grass.position.set(x, 0.125, z);
        grass.userData = { mownTime: null }; 
        scene.add(grass);
        grassArray.push(grass);
    }
}

// 5. LICHT
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const light = new THREE.DirectionalLight(0xffffff, 1.5);
light.position.set(5, 10, 7);
scene.add(light);

// 6. INPUT
const keys = {};
window.addEventListener('keydown', (e) => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);

// 7. LOGICA
const regrowDelay = 4000; // PRECIES 4 SECONDEN

function processGrass() {
    const currentTime = Date.now();
    for (let i = 0; i < grassArray.length; i++) {
        const grass = grassArray[i];
        if (grass.visible) {
            const dx = mower.position.x - grass.position.x;
            const dz = mower.position.z - grass.position.z;
            const distance = Math.sqrt(dx * dx + dz * dz);

            if (distance + 0.125 <= huidigMowerRadius) {
                grass.visible = false;
                grass.userData.mownTime = currentTime;
                
                geld += grasWaarde;
                totaalVerdiend += grasWaarde;

                // CHECK VOOR TROFEE ELKE $100.000
                if (totaalVerdiend >= (trofeeën + 1) * 100000) {
                    trofeeën++;
                    mower.scale.x += 0.25;
                    mower.scale.y += 0.25;
                    mower.scale.z += 0.25;
                    mower.position.y = (mower.scale.y * 1) / 2;
                }
                updateUI();
            }
        } else if (currentTime - grass.userData.mownTime > regrowDelay) {
            // TERUGGROEIEN
            grass.visible = true;
            grass.userData.mownTime = null;
        }
    }
}

// 8. ANIMATIE
function animate() {
    requestAnimationFrame(animate);

    if (keys['z']) mower.position.z -= huidigeSnelheid;
    if (keys['s']) mower.position.z += huidigeSnelheid;
    if (keys['q']) mower.position.x -= huidigeSnelheid;
    if (keys['d']) mower.position.x += huidigeSnelheid;

    processGrass();

    camera.position.set(mower.position.x, mower.position.y + 15, mower.position.z + 18);
    camera.lookAt(mower.position);
    renderer.render(scene, camera);
}

updateUI();
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
