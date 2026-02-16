import * as THREE from 'three';

// --- 1. DE ENGINE (Zorg dat dit als eerste laadt) ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- 2. GAME STATE & DATA UIT PDFS ---
let geld = 0, totaalVerdiend = 0, totaalGemaaid = 0, totaalUpgrades = 0, speedSpending = 0;
let trofeeën = 0, geclaimdeRewards = 0, huidigLevel = 1;
let grasWaarde = 0.01, huidigeSnelheid = 0.12, huidigMowerRadius = 1.2;
let prijsRadius = 5, prijsSnelheid = 5, prijsWaarde = 10;
let actieveOpdracht = null;

// Functie voor Grasspass Opdrachten 
function nieuweMissie() {
    if (huidigLevel <= 24) {
        const types = [
            { id: 'm', d: 5000, t: "Maai 5000 grassprieten" }, [cite: 12]
            { id: 'u', d: 5, t: "Koop 5 upgrades" }, [cite: 13]
            { id: 'v', d: 500, t: "Verdien $500" }, [cite: 14]
            { id: 's', d: 50, t: "Spendeer $50 aan snelheid" } [cite: 15]
        ];
        const m = types[Math.floor(Math.random() * types.length)];
        const b = Math.random() > 0.5 ? { type: 'g', w: 500, txt: "$500" } : { type: 'u', w: 2, txt: "2 upgrades gratis" }; [cite: 16, 17, 18]
        actieveOpdracht = { ...m, beloning: b, start: getStat(m.id) };
    } else if (huidigLevel === 25) {
        actieveOpdracht = { id: 'm', d: 250000, t: "Maai 250.000 grassprieten", start: totaalGemaaid, beloning: { type: 'g', w: 25000, txt: "$25.000" } }; [cite: 19, 20, 21]
    } else {
        const types = [
            { id: 'm', d: 25000, t: "Maai 25000 grassprieten" }, [cite: 23]
            { id: 'u', d: 25, t: "Koop 25 upgrades" }, [cite: 24]
            { id: 'v', d: 2500, t: "Verdien $2500" }, [cite: 25]
            { id: 's', d: 250, t: "Spendeer $250 aan snelheid" } [cite: 26]
        ];
        const m = types[Math.floor(Math.random() * types.length)];
        const b = Math.random() > 0.5 ? { type: 'g', w: 2500, txt: "$2500" } : { type: 'u', w: 15, txt: "15 upgrades gratis" }; [cite: 27, 28, 29]
        actieveOpdracht = { ...m, beloning: b, start: getStat(m.id) };
    }
}

function getStat(id) {
    if (id === 'm') return totaalGemaaid;
    if (id === 'u') return totaalUpgrades;
    if (id === 'v') return totaalVerdiend;
    if (id === 's') return speedSpending;
}

// --- 3. UI ELEMENTEN MAKEN (Direct zichtbaar) ---
const ui = document.createElement('div');
ui.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; font-family:Arial; color:white; z-index:100;';
document.body.appendChild(ui);

const statsBox = document.createElement('div');
statsBox.style.cssText = 'position:absolute; top:20px; left:20px; background:rgba(0,0,0,0.7); padding:15px; border-radius:10px; pointer-events:auto; border:1px solid #444;';
ui.appendChild(statsBox);

const upgradeBox = document.createElement('div');
upgradeBox.style.cssText = 'position:absolute; top:120px; left:20px; display:flex; flex-direction:column; gap:8px; pointer-events:auto;';
ui.appendChild(upgradeBox);

const skinBtn = document.createElement('button');
skinBtn.innerText = "👕 KIES SKIN";
skinBtn.style.cssText = 'position:absolute; bottom:80px; left:50%; transform:translateX(-50%); background:#3498db; color:white; border:none; padding:15px 30px; border-radius:50px; font-weight:bold; cursor:pointer; pointer-events:auto; display:none;';
ui.appendChild(skinBtn);

const gpOverlay = document.createElement('div');
gpOverlay.style.cssText = 'position:fixed; top:0; left:-100%; width:100%; height:100%; background:rgba(0,0,0,0.95); z-index:1000; transition:0.4s; display:flex; align-items:center; justify-content:center; pointer-events:auto;';
document.body.appendChild(gpOverlay);

// --- 4. LOGICA & INTERACTIE ---
function updateUI() {
    statsBox.innerHTML = `<div style="font-size:20px; color:#2ecc71;">$ ${geld.toFixed(2)}</div><div style="color:#f1c40f;">🏆 Trofeeën: ${trofeeën}</div>`;
    
    upgradeBox.innerHTML = `
        <button onclick="koop('r')" style="background:#2ecc71; color:white; border:none; padding:10px; cursor:pointer; border-radius:5px;">Radius ($${prijsRadius.toFixed(0)})</button>
        <button onclick="koop('s')" style="background:#2ecc71; color:white; border:none; padding:10px; cursor:pointer; border-radius:5px;">Snelheid ($${prijsSnelheid.toFixed(0)})</button>
        <button onclick="koop('w')" style="background:#2ecc71; color:white; border:none; padding:10px; cursor:pointer; border-radius:5px;">Waarde ($${prijsWaarde.toFixed(0)})</button>
    `;

    if (totaalVerdiend >= (trofeeën + 1) * 100000) {
        trofeeën++;
        let p = 0;
        if (trofeeën === 1) p = 50000; [cite: 1, 2]
        else if (trofeeën === 2) p = 75000; [cite: 3, 4]
        else if (trofeeën <= 9) p = Math.floor(Math.random() * 90001) + 10000; [cite: 5, 6]
        else if (trofeeën === 10) skinBtn.style.display = 'block'; [cite: 7, 8]
        geld += p;
    }

    const voortgang = getStat(actieveOpdracht.id) - actieveOpdracht.start;
    if (voortgang >= actieveOpdracht.d) {
        if (actieveOpdracht.beloning.type === 'g') geld += actieveOpdracht.beloning.w;
        huidigLevel++; nieuweMissie();
    }
}

window.koop = (t) => {
    if (t === 'r' && geld >= prijsRadius) { geld -= prijsRadius; huidigMowerRadius += 0.3; prijsRadius *= 1.6; totaalUpgrades++; }
    if (t === 's' && geld >= prijsSnelheid) { geld -= prijsSnelheid; speedSpending += prijsSnelheid; huidigeSnelheid += 0.02; prijsSnelheid *= 1.6; totaalUpgrades++; }
    if (t === 'w' && geld >= prijsWaarde) { geld -= prijsWaarde; grasWaarde += 0.01; prijsWaarde *= 1.7; totaalUpgrades++; }
    updateUI();
};

document.querySelector('.grasspass-knop-uit-html-of-maak-nieuw').onclick = () => { // Gebruik je bestaande knop
    gpOverlay.style.left = '0';
    const v = getStat(actieveOpdracht.id) - actieveOpdracht.start;
    gpOverlay.innerHTML = `<div style="background:#1a1a1a; padding:40px; border:3px solid #f1c40f; border-radius:20px; text-align:center;">
        <h1 style="color:#f1c40f">LEVEL ${huidigLevel}</h1><p>${actieveOpdracht.t}</p>
        <p>Voortgang: ${v} / ${actieveOpdracht.d}</p>
        <button onclick="this.parentElement.parentElement.style.left='-100%'" style="padding:10px 30px; cursor:pointer;">SLUITEN</button>
    </div>`;
};

skinBtn.onclick = () => { [cite: 8, 9]
    const s = prompt("Kies skin: 'blauw' of 'rood'");
    if(s === 'blauw') mower.material.color.set(0x0000ff); [cite: 10]
    else mower.material.color.set(0xff0000);
};

// --- 5. DE WERELD (Objects & Lights) ---
const mower = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.5, 1.2), new THREE.MeshStandardMaterial({color: 0xff0000}));
scene.add(mower);
scene.add(new THREE.AmbientLight(0xffffff, 0.8));
const sun = new THREE.DirectionalLight(0xffffff, 1);
sun.position.set(5, 10, 5); scene.add(sun);
camera.position.set(0, 12, 12); camera.lookAt(0,0,0);

const grassArr = [];
for(let x=-15; x<15; x+=0.7) {
    for(let z=-15; z<15; z+=0.7) {
        const g = new THREE.Mesh(new THREE.SphereGeometry(0.12), new THREE.MeshStandardMaterial({color: 0x2ecc71}));
        g.position.set(x, 0, z); scene.add(g); grassArr.push(g);
    }
}

// --- 6. CONTROLS & ANIMATIE ---
const keys = {};
window.onkeydown = (e) => keys[e.key.toLowerCase()] = true;
window.onkeyup = (e) => keys[e.key.toLowerCase()] = false;

function animate() {
    requestAnimationFrame(animate);
    if(keys['w'] || keys['z']) mower.position.z -= huidigeSnelheid;
    if(keys['s']) mower.position.z += huidigeSnelheid;
    if(keys['a'] || keys['q']) mower.position.x -= huidigeSnelheid;
    if(keys['d']) mower.position.x += huidigeSnelheid;

    grassArr.forEach(g => {
        if(g.visible && mower.position.distanceTo(g.position) < huidigMowerRadius) {
            g.visible = false; geld += grasWaarde; totaalVerdiend += grasWaarde; totaalGemaaid++; updateUI();
        }
    });
    camera.position.set(mower.position.x, 12, mower.position.z + 12);
    camera.lookAt(mower.position);
    renderer.render(scene, camera);
}

nieuweMissie();
updateUI();
animate();
