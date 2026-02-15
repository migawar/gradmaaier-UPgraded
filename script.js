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
const MAX_VISUELE_GROEI_TROFEEEN = 10;

// --- GRASSPASS & XP LOGICA ---
let huidigeMissieIndex = 0;
const grassPassMissies = [
    { tekst: "Maai 100 grassprieten", doel: 100, beloning: 500 },
    { tekst: "Maai 500 grassprieten", doel: 500, beloning: 2500 },
    { tekst: "Maai 2.500 grassprieten", doel: 2500, beloning: 15000 },
    { tekst: "Verdien je eerste $1.000", doel: 1000, type: "geld", beloning: 5000 },
    { tekst: "Maai 10.000 grassprieten", doel: 10000, beloning: 50000 },
    { tekst: "Maai 50.000 sprieten", doel: 50000, beloning: 250000 }
];

function checkGrassPass() {
    let m = grassPassMissies[huidigeMissieIndex];
    if (!m) return;
    let voortgang = m.type === "geld" ? totaalVerdiend : totaalGemaaid;
    if (voortgang >= m.doel) {
        geld += m.beloning;
        alert(`GRASSPASS VOLTOOID: ${m.tekst}! +$${formatteerGeld(m.beloning)}`);
        huidigeMissieIndex++;
    }
}

function formatteerGeld(bedrag) {
    if (bedrag >= 1000000000) return (bedrag / 1000000000).toFixed(2) + " mld";
    if (bedrag >= 1000000) return (bedrag / 1000000).toFixed(2) + " mil";
    return bedrag.toFixed(2);
}

// --- UI ELEMENTEN ---
// XP Balk Container
const xpContainer = document.createElement('div');
xpContainer.style.cssText = 'position:absolute; top:20px; left:50%; transform:translateX(-50%); width:400px; height:20px; background:rgba(0,0,0,0.5); border:2px solid #fff; border-radius:10px; overflow:hidden; z-index:10;';
document.body.appendChild(xpContainer);

const xpBalk = document.createElement('div');
xpBalk.style.cssText = 'width:0%; height:100%; background:linear-gradient(90deg, #4facfe 0%, #00f2fe 100%); transition: width 0.2s;';
xpContainer.appendChild(xpBalk);

const xpTekst = document.createElement('div');
xpTekst.style.cssText = 'position:absolute; top:45px; left:50%; transform:translateX(-50%); color:white; font-family:sans-serif; font-weight:bold; text-shadow:2px 2px 4px #000; z-index:10; font-size:14px;';
document.body.appendChild(xpTekst);

// Geld & Trofeeën
const geldDisplay = document.createElement('div');
geldDisplay.style.cssText = 'position:absolute; top:10px; left:10px; color:white; font-size:24px; font-family:monospace; background:rgba(0,0,0,0.5); padding:10px; border-radius:5px; z-index:10;';
document.body.appendChild(geldDisplay);

const trofeeDisplay = document.createElement('div');
trofeeDisplay.style.cssText = 'position:absolute; top:10px; right:10px; color:#f1c40f; font-size:24px; font-family:monospace; background:rgba(0,0,0,0.5); padding:10px; border-radius:5px; border: 2px solid #f1c40f; z-index:10;';
document.body.appendChild(trofeeDisplay);

// REWARDS & SKINS
const rewardBtn = document.createElement('button');
rewardBtn.style.cssText = 'position:absolute; right:10px; top:50%; transform:translateY(-50%); background:#32CD32; color:white; border:none; padding:20px; cursor:pointer; border-radius:10px; font-weight:bold; z-index:10; display:none; flex-direction:column; box-shadow: 0 0 15px #32CD32;';
rewardBtn.onclick = () => {
    let rewardNummer = geclaimdeRewards + 1;
    let bonus = 0;
    if (rewardNummer === 1) bonus = 50000; [cite: 2]
    else if (rewardNummer === 2) bonus = 75000; [cite: 4]
    else if (rewardNummer >= 3 && rewardNummer <= 9) bonus = Math.floor(Math.random() * 90001) + 10000; [cite: 6]
    else if (rewardNummer === 10) { skinBtn.style.display = 'block'; alert("Trofee 10: Skins ontgrendeld!"); } [cite: 8, 9]

    geld += bonus; geclaimdeRewards++;
    if (bonus > 0) alert(`Beloning geclaimd: $${formatteerGeld(bonus)}`);
    updateUI();
};
document.body.appendChild(rewardBtn);

const skinBtn = document.createElement('button');
skinBtn.style.cssText = 'position:absolute; bottom:20px; left:50%; transform:translateX(-50%); background:#3498db; color:white; border:none; padding:15px 30px; cursor:pointer; border-radius:5px; font-weight:bold; z-index:10; display:none;';
skinBtn.innerText = "SKINS";
skinBtn.onclick = () => {
    let keuze = prompt("Kies een skin: 'blauw' of 'rood'");
    if (keuze?.toLowerCase() === 'blauw') mower.material.color.set(0x0000ff); [cite: 10]
    else if (keuze?.toLowerCase() === 'rood') mower.material.color.set(0xff0000);
};
document.body.appendChild(skinBtn);

// Grasspass & Upgrades
const gpBtn = document.createElement('button');
gpBtn.style.cssText = 'position:absolute; bottom:20px; left:20px; background:linear-gradient(45deg, #f1c40f, #e67e22); color:white; border:none; padding:15px 25px; cursor:pointer; border-radius:10px; font-weight:bold; z-index:10;';
gpBtn.innerText = "⭐ GRASSPASS";
gpBtn.onclick = () => {
    let m = grassPassMissies[huidigeMissieIndex];
    alert(m ? `MISSIE: ${m.tekst}` : "Alle missies voltooid!");
};
document.body.appendChild(gpBtn);

const menu = document.createElement('div');
menu.style.cssText = 'position:absolute; left:10px; top:50%; transform:translateY(-50%); display:flex; flex-direction:column; gap:10px; z-index:10;';
document.body.appendChild(menu);

function maakUpgradeBtn(actie) {
    const btn = document.createElement('button');
    btn.style.cssText = 'background:#2ecc71; color:white; border:none; padding:15px; cursor:pointer; border-radius:5px; font-weight:bold; text-align:left; min-width:220px;';
    btn.onclick = actie;
    menu.appendChild(btn);
    return btn;
}

const btnRadius = maakUpgradeBtn(() => { if (geld >= prijsRadius && huidigMowerRadius < MAX_RADIUS) { geld -= prijsRadius; huidigMowerRadius += 0.45; prijsRadius *= 1.6; updateUI(); } });
const btnSpeed = maakUpgradeBtn(() => { if (geld >= prijsSnelheid) { geld -= prijsSnelheid; huidigeSnelheid += 0.03; prijsSnelheid *= 1.5; updateUI(); } });
const btnWaarde = maakUpgradeBtn(() => { if (geld >= prijsWaarde && grasWaarde < MAX_WAARDE) { geld -= prijsWaarde; grasWaarde += 0.10; prijsWaarde *= 1.7; updateUI(); } });

function updateUI() {
    geldDisplay.innerText = '$ ' + formatteerGeld(geld);
    trofeeDisplay.innerText = '🏆 Trofeeën: ' + trofeeën;
    rewardBtn.style.display = (trofeeën > geclaimdeRewards) ? 'flex' : 'none';
    rewardBtn.innerHTML = `<span>CLAIM REWARD</span><span style="font-size:12px;">(${trofeeën - geclaimdeRewards} beschikbaar)</span>`;
    
    // XP Balk update
    let m = grassPassMissies[huidigeMissieIndex];
    if (m) {
        let voortgang = m.type === "geld" ? totaalVerdiend : totaalGemaaid;
        let percentage = Math.min((voortgang / m.doel) * 100, 100);
        xpBalk.style.width = percentage + "%";
        xpTekst.innerText = `${m.tekst} (${Math.floor(percentage)}%)`;
    } else {
        xpBalk.style.width = "100%";
        xpTekst.innerText = "ALLE MISSIES VOLTOOID!";
    }

    btnRadius.innerText = huidigMowerRadius >= MAX_RADIUS ? "BEREIK: MAX" : `GROTER BEREIK ($${formatteerGeld(prijsRadius)})`;
    btnWaarde.innerText = grasWaarde >= MAX_WAARDE ? "WAARDE: MAX" : `MEER WAARDE ($${formatteerGeld(prijsWaarde)})`;
    btnSpeed.innerText = `SNELLER ($${formatteerGeld(prijsSnelheid)})`;
}

// 3. OBJECTEN & LOGICA
const mower = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0xff0000 }));
mower.scale.set(0.75, 0.75, 1.0);
mower.position.y = 0.375;
scene.add(mower);

const grassArray = [];
const step = 0.35; const fieldSize = 27.5; 
const grassGeo = new THREE.SphereGeometry(0.125, 3, 3);
const grassMat = new THREE.MeshStandardMaterial({ color: 0x228b22 });

for (let x = -fieldSize; x <= fieldSize; x += step) {
    for (let z = -fieldSize; z <= fieldSize; z += step) {
        const grass = new THREE.Mesh(grassGeo, grassMat);
        grass.position.set(x, 0.125, z);
        scene.add(grass);
        grassArray.push(grass);
    }
}

scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const light = new THREE.DirectionalLight(0xffffff, 1.5);
light.position.set(5, 10, 7);
scene.add(light);

const keys = {};
window.addEventListener('keydown', (e) => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);

function processGame() {
    const currentTime = Date.now();
    for (let grass of grassArray) {
        if (grass.visible) {
            const dx = mower.position.x - grass.position.x;
            const dz = mower.position.z - grass.position.z;
            if (Math.sqrt(dx * dx + dz * dz) + 0.125 <= huidigMowerRadius) {
                grass.visible = false;
                grass.userData.mownTime = currentTime;
                geld += grasWaarde; totaalVerdiend += grasWaarde; totaalGemaaid++;
                
                while (totaalVerdiend >= (trofeeën + 1) * 100000) {
                    trofeeën++;
                    if (trofeeën <= MAX_VISUELE_GROEI_TROFEEEN) {
                        mower.scale.x += 0.25; mower.scale.y += 0.25; mower.scale.z += 0.25;
                        mower.position.y = (mower.scale.y * 1) / 2;
                    }
                }
                checkGrassPass();
                updateUI();
            }
        } else if (currentTime - grass.userData.mownTime > 4000) {
            grass.visible = true;
        }
    }
}

function animate() {
    requestAnimationFrame(animate);
    if (keys['z'] || keys['w']) mower.position.z -= huidigeSnelheid;
    if (keys['s']) mower.position.z += huidigeSnelheid;
    if (keys['q'] || keys['a']) mower.position.x -= huidigeSnelheid;
    if (keys['d']) mower.position.x += huidigeSnelheid;
    processGame();
    camera.position.set(mower.position.x, mower.position.y + 15, mower.position.z + 18);
    camera.lookAt(mower.position);
    renderer.render(scene, camera);
}

const cheatBtn = document.createElement('button');
cheatBtn.style.cssText = 'position:absolute; top:10px; left:50%; transform:translateX(-50%); background:#006400; color:white; border:none; padding:10px 20px; cursor:pointer; border-radius:5px; font-weight:bold; z-index:10;';
cheatBtn.innerText = "VOER CHEAT IN";
cheatBtn.onclick = () => { if (prompt("Code:") === "OG-kervelsoeps") { geld += 100000; totaalVerdiend += 100000; updateUI(); } };
document.body.appendChild(cheatBtn);

updateUI();
animate();
