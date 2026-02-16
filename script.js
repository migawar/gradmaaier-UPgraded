import * as THREE from 'three';

// 1. SCÈNE & CAMERA
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- STATS ---
let geld = 0.00;
let totaalVerdiend = 0.00; 
let trofeeën = 0;
let geclaimdeRewards = 0;
let totaalGemaaid = 0;
let grasWaarde = 0.01;
let huidigMowerRadius = 1.0;
let huidigeSnelheid = 0.12;
let prijsRadius = 5.00;
let prijsSnelheid = 5.00;
let prijsWaarde = 10.00;

const MAX_RADIUS = 10.0;
const MAX_WAARDE = 5.01;

// --- GRASSPASS MISSIES ---
let huidigeMissieIndex = 0;
const grassPassMissies = [
    { tekst: "Maai 500 grassprieten", doel: 500, beloning: 2500 },
    { tekst: "Maai 2.500 grassprieten", doel: 2500, beloning: 12500 },
    { tekst: "Maai 10.000 grassprieten", doel: 10000, beloning: 50000 },
    { tekst: "Verdien $25.000 totaal", doel: 25000, type: "geld", beloning: 10000 },
    { tekst: "Maai 50.000 grassprieten", doel: 50000, beloning: 250000 }
];

// --- UI STYLING & POP-UP ---
const uiCSS = 'position:absolute; font-family: "Segoe UI", Tahoma, sans-serif; z-index:10;';

// XP Balk bovenaan
const xpContainer = document.createElement('div');
xpContainer.style.cssText = uiCSS + 'top:20px; left:50%; transform:translateX(-50%); width:400px; height:20px; background:rgba(0,0,0,0.6); border:2px solid white; border-radius:10px; overflow:hidden;';
document.body.appendChild(xpContainer);

const xpBalk = document.createElement('div');
xpBalk.style.cssText = 'width:0%; height:100%; background:linear-gradient(90deg, #4facfe, #00f2fe); transition:0.3s;';
xpContainer.appendChild(xpBalk);

// Geld & Trofeeën
const geldDisplay = document.createElement('div');
geldDisplay.style.cssText = uiCSS + 'top:10px; left:10px; color:white; font-size:22px; background:rgba(0,0,0,0.7); padding:10px 20px; border-radius:8px;';
document.body.appendChild(geldDisplay);

const trofeeDisplay = document.createElement('div');
trofeeDisplay.style.cssText = uiCSS + 'top:10px; right:10px; color:#f1c40f; font-size:22px; background:rgba(0,0,0,0.7); padding:10px 20px; border-radius:8px; border:2px solid #f1c40f;';
document.body.appendChild(trofeeDisplay);

// DE GRASSPASS POP-UP (HET MENU)
const gpOverlay = document.createElement('div');
gpOverlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:100; display:none; align-items:center; justify-content:center;';
document.body.appendChild(gpOverlay);

const gpModal = document.createElement('div');
gpModal.style.cssText = 'width:500px; background:linear-gradient(135deg, #2c3e50, #000000); border:3px solid #f1c40f; border-radius:20px; padding:30px; color:white; text-align:center; box-shadow: 0 0 30px #f1c40f;';
gpOverlay.appendChild(gpModal);

function openGrassPass() {
    let m = grassPassMissies[huidigeMissieIndex];
    if (!m) {
        gpModal.innerHTML = `<h1>⭐ GRASSPASS</h1><p>Alle missies voltooid! Je bent een legende.</p><button id="closeGP" style="padding:10px 20px; cursor:pointer; background:#f1c40f; border:none; border-radius:5px; font-weight:bold;">SLUITEN</button>`;
    } else {
        let v = m.type === "geld" ? totaalVerdiend : totaalGemaaid;
        let p = Math.floor(Math.min((v / m.doel) * 100, 100));
        gpModal.innerHTML = `
            <h1 style="color:#f1c40f; margin-bottom:10px;">⭐ GRASSPASS</h1>
            <h3 style="margin-bottom:20px;">Huidige Missie</h3>
            <div style="background:rgba(255,255,255,0.1); padding:20px; border-radius:15px; margin-bottom:20px;">
                <p style="font-size:18px;">${m.tekst}</p>
                <div style="width:100%; height:15px; background:#444; border-radius:10px; margin:15px 0;">
                    <div style="width:${p}%; height:100%; background:#f1c40f; border-radius:10px;"></div>
                </div>
                <p>${v} / ${m.doel} (${p}%)</p>
                <p style="color:#2ecc71; font-weight:bold; margin-top:10px;">Beloning: $${formatteerGeld(m.beloning)} [cite: 6]</p>
            </div>
            <button id="closeGP" style="padding:10px 30px; cursor:pointer; background:white; color:black; border:none; border-radius:5px; font-weight:bold;">GA TERUG NAAR MAAIEN</button>
        `;
    }
    gpOverlay.style.display = 'flex';
    document.getElementById('closeGP').onclick = () => gpOverlay.style.display = 'none';
}

// Grasspass Knop (Links onder)
const gpBtn = document.createElement('button');
gpBtn.style.cssText = 'position:absolute; bottom:20px; left:20px; z-index:10; background:linear-gradient(45deg, #f1c40f, #e67e22); color:white; border:none; padding:15px 25px; cursor:pointer; border-radius:10px; font-weight:bold; box-shadow: 0 4px 10px rgba(0,0,0,0.5);';
gpBtn.innerText = "⭐ GRASSPASS";
gpBtn.onclick = openGrassPass;
document.body.appendChild(gpBtn);

// --- BELONINGEN & SKINS ---
const rewardBtn = document.createElement('button');
rewardBtn.style.cssText = 'position:absolute; right:20px; top:50%; z-index:10; background:#32CD32; color:white; border:none; padding:20px; cursor:pointer; border-radius:12px; font-weight:bold; display:none; box-shadow: 0 0 15px #32CD32;';
rewardBtn.onclick = claimReward;
document.body.appendChild(rewardBtn);

const skinBtn = document.createElement('button');
skinBtn.style.cssText = 'position:absolute; bottom:20px; left:50%; transform:translateX(-50%); z-index:10; background:#3498db; color:white; border:none; padding:15px 40px; cursor:pointer; border-radius:10px; font-weight:bold; display:none;';
skinBtn.innerText = "SKINS";
skinBtn.onclick = () => {
    let k = prompt("Kies skin: 'blauw' (Trofee 10 reward) [cite: 9, 10] of 'rood'");
    mower.material.color.set(k?.toLowerCase() === 'blauw' ? 0x0000ff : 0xff0000);
};
document.body.appendChild(skinBtn);

function formatteerGeld(b) {
    if (b >= 1000000000) return (b / 1000000000).toFixed(2) + " mld";
    if (b >= 1000000) return (b / 1000000).toFixed(2) + " mil";
    return b.toFixed(2);
}

function claimReward() {
    if (trofeeën > geclaimdeRewards) {
        let nr = geclaimdeRewards + 1;
        let bonus = 0;
        if (nr === 1) bonus = 50000; [cite: 2]
        else if (nr === 2) bonus = 75000; [cite: 4]
        else if (nr >= 3 && nr <= 9) bonus = Math.floor(Math.random() * 90001) + 10000; [cite: 6]
        else if (nr === 10) { skinBtn.style.display = 'block'; } [cite: 8]
        geld += bonus; geclaimdeRewards++; updateUI();
    }
}

function updateUI() {
    geldDisplay.innerText = '$ ' + formatteerGeld(geld);
    trofeeDisplay.innerText = '🏆 ' + trofeeën;
    rewardBtn.style.display = (trofeeën > geclaimdeRewards) ? 'block' : 'none';
    rewardBtn.innerHTML = `CLAIM REWARD<br><small>(${trofeeën - geclaimdeRewards})</small>`;
    
    let m = grassPassMissies[huidigeMissieIndex];
    if (m) {
        let v = m.type === "geld" ? totaalVerdiend : totaalGemaaid;
        xpBalk.style.width = Math.min((v / m.doel) * 100, 100) + "%";
        if (v >= m.doel) {
            geld += m.beloning; huidigeMissieIndex++; updateUI();
        }
    }

    btnRadius.innerText = huidigMowerRadius >= MAX_RADIUS ? "MAX RADIUS" : `BEREIK ($${formatteerGeld(prijsRadius)})`;
    btnSpeed.innerText = `SPEED ($${formatteerGeld(prijsSnelheid)})`;
    btnWaarde.innerText = grasWaarde >= MAX_WAARDE ? "MAX WAARDE" : `WAARDE ($${formatteerGeld(prijsWaarde)})`;
}

// --- WORLD & LOGIC ---
const mower = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.6, 1.2), new THREE.MeshStandardMaterial({ color: 0xff0000 }));
mower.position.y = 0.3;
scene.add(mower);

const grassArray = [];
for (let x = -25; x < 25; x += 0.6) {
    for (let z = -25; z < 25; z += 0.6) {
        const g = new THREE.Mesh(new THREE.SphereGeometry(0.12, 4, 4), new THREE.MeshStandardMaterial({ color: 0x2ecc71 }));
        g.position.set(x, 0, z);
        scene.add(g);
        grassArray.push(g);
    }
}

scene.add(new THREE.AmbientLight(0xffffff, 0.8));
const sun = new THREE.DirectionalLight(0xffffff, 1);
sun.position.set(10, 20, 10);
scene.add(sun);

const keys = {};
window.onkeydown = (e) => keys[e.key.toLowerCase()] = true;
window.onkeyup = (e) => keys[e.key.toLowerCase()] = false;

function animate() {
    requestAnimationFrame(animate);
    if (gpOverlay.style.display !== 'flex') {
        if (keys['z'] || keys['w']) mower.position.z -= huidigeSnelheid;
        if (keys['s']) mower.position.z += huidigeSnelheid;
        if (keys['q'] || keys['a']) mower.position.x -= huidigeSnelheid;
        if (keys['d']) mower.position.x += huidigeSnelheid;
    }

    const now = Date.now();
    for (let g of grassArray) {
        if (g.visible && mower.position.distanceTo(g.position) < huidigMowerRadius) {
            g.visible = false; g.userData.t = now;
            geld += grasWaarde; totaalVerdiend += grasWaarde; totaalGemaaid++;
            if (totaalVerdiend >= (trofeeën + 1) * 100000) trofeeën++;
            updateUI();
        } else if (!g.visible && now - g.userData.t > 4000) { g.visible = true; }
    }
    camera.position.set(mower.position.x, 15, mower.position.z + 12);
    camera.lookAt(mower.position);
    renderer.render(scene, camera);
}

// Upgrade Menu
const menu = document.createElement('div');
menu.style.cssText = 'position:absolute; left:10px; top:50%; transform:translateY(-50%); display:flex; flex-direction:column; gap:8px; z-index:10;';
document.body.appendChild(menu);

function upgrade(type) {
    if (type === 'r' && geld >= prijsRadius && huidigMowerRadius < MAX_RADIUS) { geld -= prijsRadius; huidigMowerRadius += 0.4; prijsRadius *= 1.8; }
    if (type === 's' && geld >= prijsSnelheid) { geld -= prijsSnelheid; huidigeSnelheid += 0.02; prijsSnelheid *= 1.6; }
    if (type === 'w' && geld >= prijsWaarde && grasWaarde < MAX_WAARDE) { geld -= prijsWaarde; grasWaarde += 0.05; prijsWaarde *= 1.8; }
    updateUI();
}

const btnRadius = document.createElement('button');
const btnSpeed = document.createElement('button');
const btnWaarde = document.createElement('button');
[btnRadius, btnSpeed, btnWaarde].forEach((b, i) => {
    b.style.cssText = 'background:#2ecc71; color:white; border:none; padding:12px; cursor:pointer; border-radius:5px; font-weight:bold; width:200px; text-align:left;';
    b.onclick = () => upgrade(['r', 's', 'w'][i]);
    menu.appendChild(b);
});

updateUI();
animate();
