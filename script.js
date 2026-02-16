import * as THREE from 'three';

// --- ENGINE & SCENE ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- GAME STATE DATA (Bron: PDF) ---
let geld = 0, totaalVerdiend = 0, totaalGemaaid = 0, totaalUpgrades = 0, speedSpending = 0;
let trofeeën = 0, geclaimdeRewards = 0, huidigLevel = 1;
let grasWaarde = 0.01, huidigeSnelheid = 0.15, huidigMowerRadius = 1.2;
let prijsRadius = 5, prijsSnelheid = 5, prijsWaarde = 10;
let actieveOpdracht = null;

// --- GRASSPASS LOGICA [cite: 1-19] ---
function genereerMissie() {
    if (huidigLevel <= 24) {
        const types = [
            { id: 'm', d: 5000, t: "Maai 5000 grassprieten" },
            { id: 'u', d: 5, t: "Koop 5 upgrades" },
            { id: 'v', d: 500, t: "Verdien $500" },
            { id: 's', d: 50, t: "Spendeer $50 aan snelheid" }
        ];
        const m = types[Math.floor(Math.random() * types.length)];
        const b = Math.random() > 0.5 ? { type: 'g', w: 500, txt: "$500" } : { type: 'u', w: 2, txt: "2 upgrades gratis" };
        actieveOpdracht = { ...m, beloning: b, start: getStat(m.id) };
    } else if (huidigLevel === 25) {
        actieveOpdracht = { id: 'm', d: 250000, t: "Maai 250.000 grassprieten", start: totaalGemaaid, beloning: { type: 'g', w: 25000, txt: "$25.000" } };
    } else {
        const types = [
            { id: 'm', d: 25000, t: "Maai 25000 grassprieten" },
            { id: 'u', d: 25, t: "Koop 25 upgrades" },
            { id: 'v', d: 2500, t: "Verdien $2500" },
            { id: 's', d: 250, t: "Spendeer $250 aan snelheid" }
        ];
        const m = types[Math.floor(Math.random() * types.length)];
        const b = Math.random() > 0.5 ? { type: 'g', w: 2500, txt: "$2500" } : { type: 'u', w: 15, txt: "15 upgrades gratis" };
        actieveOpdracht = { ...m, beloning: b, start: getStat(m.id) };
    }
}

function getStat(id) {
    if (id === 'm') return totaalGemaaid;
    if (id === 'u') return totaalUpgrades;
    if (id === 'v') return totaalVerdiend;
    if (id === 's') return speedSpending;
    return 0;
}

// --- UI ELEMENTEN (Vaste opmaak) ---
const ui = document.createElement('div');
ui.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; pointer-events:none; font-family:sans-serif; z-index:1000;';
document.body.appendChild(ui);

const statsBox = document.createElement('div');
statsBox.style.cssText = 'position:absolute; top:20px; right:20px; background:rgba(0,0,0,0.8); padding:15px; border-radius:10px; border:2px solid #444; color:white; pointer-events:auto; text-align:right;';
ui.appendChild(statsBox);

const upgradeBox = document.createElement('div');
upgradeBox.style.cssText = 'position:absolute; top:20px; left:20px; display:flex; flex-direction:column; gap:10px; pointer-events:auto;';
ui.appendChild(upgradeBox);

const skinBtn = document.createElement('button');
skinBtn.innerText = "👕 KIES SKIN";
skinBtn.style.cssText = 'position:absolute; bottom:100px; left:50%; transform:translateX(-50%); background:#3498db; color:white; border:none; padding:15px 30px; border-radius:50px; font-weight:bold; cursor:pointer; pointer-events:auto; display:none;';
ui.appendChild(skinBtn);

function updateUI() {
    statsBox.innerHTML = `<div style="font-size:24px; color:#2ecc71;">$ ${geld.toLocaleString(undefined, {minimumFractionDigits: 2})}</div><div style="color:#f1c40f;">🏆 Trofeeën: ${trofeeën}</div>`;
    
    upgradeBox.innerHTML = `
        <button onclick="koop('r')" style="width:180px; padding:10px; background:#2ecc71; color:white; border:none; border-radius:5px; cursor:pointer; font-weight:bold;">Radius: $${prijsRadius.toFixed(0)}</button>
        <button onclick="koop('s')" style="width:180px; padding:10px; background:#2ecc71; color:white; border:none; border-radius:5px; cursor:pointer; font-weight:bold;">Snelheid: $${prijsSnelheid.toFixed(0)}</button>
        <button onclick="koop('w')" style="width:180px; padding:10px; background:#2ecc71; color:white; border:none; border-radius:5px; cursor:pointer; font-weight:bold;">Waarde: $${prijsWaarde.toFixed(0)}</button>
    `;

    // Trofee logic
    if (totaalVerdiend >= (trofeeën + 1) * 100000) {
        trofeeën++;
        let bonus = (trofeeën === 1) ? 50000 : (trofeeën === 2) ? 75000 : Math.floor(Math.random() * 90001) + 10000;
        if (trofeeën === 10) skinBtn.style.display = 'block';
        geld += bonus;
    }

    const v = getStat(actieveOpdracht.id) - actieveOpdracht.start;
    if (v >= actieveOpdracht.d) {
        if (actieveOpdracht.beloning.type === 'g') geld += actieveOpdracht.beloning.w;
        huidigLevel++; genereerMissie();
    }
}

window.koop = (t) => {
    if (t === 'r' && geld >= prijsRadius) { geld -= prijsRadius; huidigMowerRadius += 0.3; prijsRadius *= 1.6; totaalUpgrades++; }
    if (t === 's' && geld >= prijsSnelheid) { geld -= prijsSnelheid; speedSpending += prijsSnelheid; huidigeSnelheid += 0.02; prijsSnelheid *= 1.6; totaalUpgrades++; }
    if (t === 'w' && geld >= prijsWaarde) { geld -= prijsWaarde; grasWaarde += 0.01; prijsWaarde *= 1.7; totaalUpgrades++; }
    updateUI();
};

// --- WERELD & GRAS (Teruggroei logica) ---
const mower = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.5, 1.2), new THREE.MeshStandardMaterial({color: 0xff0000}));
scene.add(mower);
scene.add(new THREE.AmbientLight(0xffffff, 0.8));
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 5); scene.add(light);
camera.position.set(0, 15, 15);

const grassArr = [];
for(let x=-20; x<20; x+=0.8) {
    for(let z=-20; z<20; z+=0.8) {
        const g = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), new THREE.MeshStandardMaterial({color: 0x2ecc71}));
        g.position.set(x, 0, z);
        g.userData = { cutTime: 0 };
        scene.add(g); grassArr.push(g);
    }
}

const keys = {};
window.onkeydown = (e) => keys[e.key.toLowerCase()] = true;
window.onkeyup = (e) => keys[e.key.toLowerCase()] = false;

function animate() {
    requestAnimationFrame(animate);
    const nu = Date.now();

    if(keys['w'] || keys['z']) mower.position.z -= huidigeSnelheid;
    if(keys['s']) mower.position.z += huidigeSnelheid;
    if(keys['a'] || keys['q']) mower.position.x -= huidigeSnelheid;
    if(keys['d']) mower.position.x += huidigeSnelheid;

    grassArr.forEach(g => {
        if(g.visible && mower.position.distanceTo(g.position) < huidigMowerRadius) {
            g.visible = false; g.userData.cutTime = nu;
            geld += grasWaarde; totaalVerdiend += grasWaarde; totaalGemaaid++;
            updateUI();
        }
        if(!g.visible && nu - g.userData.cutTime > 8000) { // Groeit terug na 8 sec
            g.visible = true;
        }
    });

    camera.position.set(mower.position.x, 15, mower.position.z + 15);
    camera.lookAt(mower.position);
    renderer.render(scene, camera);
}

genereerMissie();
updateUI();
animate();
