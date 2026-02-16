import * as THREE from 'three';

// --- INITIALISATIE & ENGINE ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a); 
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- GAME STATE ---
let geld = 0.00;
let totaalVerdiend = 0.00; 
let trofeeën = 0;
let geclaimdeRewards = 0;
let totaalGemaaid = 0;
let totaalUpgrades = 0;
let speedSpending = 0;

let grasWaarde = 0.01;
let huidigeSnelheid = 0.12;
let huidigMowerRadius = 1.0;

let prijsRadius = 5.00;
let prijsSnelheid = 5.00;
let prijsWaarde = 10.00;

let huidigLevel = 1;
let actieveOpdracht = null;

// --- GRASSPASS LOGICA (Gebaseerd op Grasspass.pdf) ---
function genereerOpdracht() {
    if (huidigLevel <= 24) {
        // Willekeurige opdrachten level 1-24 [cite: 11]
        const opties = [
            { id: 'm', doel: 5000, tekst: "Maai 5000 grassprieten" }, // [cite: 12]
            { id: 'u', doel: 5, tekst: "Koop 5 upgrades" },         // [cite: 13]
            { id: 'v', doel: 500, tekst: "Verdien $500" },          // [cite: 14]
            { id: 's', doel: 50, tekst: "Spendeer $50 aan snelheid" } // [cite: 15]
        ];
        const gekozen = opties[Math.floor(Math.random() * opties.length)];
        // Beloningen level 1-24 [cite: 16]
        const beloning = Math.random() > 0.5 
            ? { type: 'g', w: 500, t: "$500" }  // [cite: 17]
            : { type: 'u', w: 2, t: "2 gratis upgrades" }; // [cite: 18]
        actieveOpdracht = { ...gekozen, beloning, startValue: getStat(gekozen.id) };
    } 
    else if (huidigLevel === 25) {
        // Level 25 [cite: 19]
        actieveOpdracht = { id: 'm', doel: 250000, tekst: "Maai 250.000 grassprieten", startValue: totaalGemaaid, beloning: { type: 'g', w: 25000, t: "$25.000" } }; // [cite: 20, 21]
    } 
    else {
        // Willekeurige opdrachten level 26-50 [cite: 22]
        const opties = [
            { id: 'm', doel: 25000, tekst: "Maai 25.000 grassprieten" }, // [cite: 23]
            { id: 'u', doel: 25, tekst: "Koop 25 upgrades" },          // [cite: 24]
            { id: 'v', doel: 2500, tekst: "Verdien $2500" },            // [cite: 25]
            { id: 's', doel: 250, tekst: "Spendeer $250 aan snelheid" } // [cite: 26]
        ];
        const gekozen = opties[Math.floor(Math.random() * opties.length)];
        // Beloningen level 26-50 [cite: 27]
        const beloning = Math.random() > 0.5 
            ? { type: 'g', w: 2500, t: "$2500" } // [cite: 28]
            : { type: 'u', w: 15, t: "15 gratis upgrades" }; // [cite: 29]
        actieveOpdracht = { ...gekozen, beloning, startValue: getStat(gekozen.id) };
    }
}

function getStat(id) {
    if (id === 'm') return totaalGemaaid;
    if (id === 'u') return totaalUpgrades;
    if (id === 'v') return totaalVerdiend;
    if (id === 's') return speedSpending;
    return 0;
}

// --- TROFEEËNPAD LOGICA (Gebaseerd op Trofeeënpad.pdf) ---
function checkTrofeeProgress() {
    // Elke $100.000 verdien je een trofee
    if (totaalVerdiend >= (trofeeën + 1) * 100000) {
        trofeeën++;
        updateUI();
    }
}

function claimTrofeeReward() {
    if (trofeeën > geclaimdeRewards) {
        let nr = geclaimdeRewards + 1;
        let bonus = 0;

        if (nr === 1) bonus = 50000; // [cite: 1, 2]
        else if (nr === 2) bonus = 75000; // [cite: 3, 4]
        else if (nr >= 3 && nr <= 9) bonus = Math.floor(Math.random() * 90001) + 10000; // [cite: 5, 6]
        else if (nr === 10) {
            skinBtn.style.display = 'block'; // [cite: 7, 8]
            alert("Trofee 10 bereikt! Skin-menu ontgrendeld.");
        }

        geld += bonus;
        geclaimdeRewards++;
        if (bonus > 0) alert(`Trofee Beloning: $${bonus.toLocaleString()}`);
        updateUI();
    }
}

// --- UI SYSTEEM ---
const uiContainer = document.createElement('div');
uiContainer.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; font-family:sans-serif; color:white; z-index:10;';
document.body.appendChild(uiContainer);

// Stats Display
const statsDiv = document.createElement('div');
statsDiv.style.cssText = 'position:absolute; top:20px; left:20px; font-size:24px; background:rgba(0,0,0,0.5); padding:15px; border-radius:10px; pointer-events:auto;';
uiContainer.appendChild(statsDiv);

// Upgrade Menu
const upgradeMenu = document.createElement('div');
upgradeMenu.style.cssText = 'position:absolute; top:120px; left:20px; display:flex; flex-direction:column; gap:10px; pointer-events:auto;';
uiContainer.appendChild(upgradeMenu);

function maakUpgradeKnop(tekst, actie) {
    const btn = document.createElement('button');
    btn.style.cssText = 'padding:10px; background:#2ecc71; border:none; color:white; font-weight:bold; cursor:pointer; border-radius:5px; width:200px; text-align:left;';
    btn.onclick = actie;
    upgradeMenu.appendChild(btn);
    return btn;
}

const btnRad = maakUpgradeKnop('', () => {
    if (geld >= prijsRadius) {
        geld -= prijsRadius; huidigMowerRadius += 0.2; prijsRadius *= 1.6; totaalUpgrades++; updateUI();
    }
});
const btnSpd = maakUpgradeKnop('', () => {
    if (geld >= prijsSnelheid) {
        geld -= prijsSnelheid; speedSpending += prijsSnelheid; huidigeSnelheid += 0.02; prijsSnelheid *= 1.6; totaalUpgrades++; updateUI();
    }
});
const btnVal = maakUpgradeKnop('', () => {
    if (geld >= prijsWaarde) {
        geld -= prijsWaarde; grasWaarde += 0.01; prijsWaarde *= 1.8; totaalUpgrades++; updateUI();
    }
});

// Knoppen onderaan
const gpBtn = document.createElement('button');
gpBtn.innerText = "⭐ GRASSPASS";
gpBtn.style.cssText = 'position:absolute; bottom:20px; left:20px; background:#f1c40f; border:none; padding:15px 30px; border-radius:50px; font-weight:bold; cursor:pointer; pointer-events:auto;';
uiContainer.appendChild(gpBtn);

const rewardBtn = document.createElement('button');
rewardBtn.style.cssText = 'position:absolute; bottom:20px; right:20px; background:#e74c3c; border:none; padding:15px 30px; border-radius:50px; font-weight:bold; cursor:pointer; pointer-events:auto; display:none;';
rewardBtn.onclick = claimTrofeeReward;
uiContainer.appendChild(rewardBtn);

const skinBtn = document.createElement('button'); // [cite: 8]
skinBtn.innerText = "👕 SKINS";
skinBtn.style.cssText = 'position:absolute; bottom:20px; left:50%; transform:translateX(-50%); background:#3498db; border:none; padding:15px 30px; border-radius:50px; font-weight:bold; cursor:pointer; pointer-events:auto; display:none;';
uiContainer.appendChild(skinBtn);

// Skin Pop-up [cite: 9]
skinBtn.onclick = () => {
    const keuze = prompt("Kies een skin: 'rood' of 'blauw'");
    if (keuze === 'blauw') {
        mower.material.color.set(0x0000ff); // [cite: 10]
        alert("Blauwe skin toegepast!");
    } else {
        mower.material.color.set(0xff0000);
    }
};

// Grasspass Overlay
const overlay = document.createElement('div');
overlay.style.cssText = 'position:fixed; top:0; left:-100%; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:100; transition:0.5s; display:flex; align-items:center; justify-content:center; pointer-events:auto;';
document.body.appendChild(overlay);

gpBtn.onclick = () => {
    overlay.style.left = '0';
    const voortgang = getStat(actieveOpdracht.id) - actieveOpdracht.startValue;
    const proc = Math.min(Math.floor((voortgang / actieveOpdracht.doel) * 100), 100);
    overlay.innerHTML = `
        <div style="background:#1a1a1a; padding:40px; border:3px solid #f1c40f; border-radius:20px; text-align:center; color:white; width:400px;">
            <h1 style="color:#f1c40f; margin-top:0;">LEVEL ${huidigLevel}</h1>
            <p style="font-size:1.2em;">${actieveOpdracht.tekst}</p>
            <div style="width:100%; height:20px; background:#333; border-radius:10px; margin:20px 0; border:1px solid #555;">
                <div style="width:${proc}%; height:100%; background:#f1c40f; border-radius:10px; transition:0.3s;"></div>
            </div>
            <p>${voortgang.toLocaleString()} / ${actieveOpdracht.doel.toLocaleString()} (${proc}%)</p>
            <p style="color:#2ecc71; font-weight:bold;">BELONING: ${actieveOpdracht.beloning.t}</p>
            <button onclick="this.parentElement.parentElement.style.left='-100%'" style="margin-top:20px; padding:10px 30px; cursor:pointer; border-radius:5px; border:none; font-weight:bold;">SLUITEN</button>
        </div>`;
};

// --- UPDATE FUNCTIE ---
function updateUI() {
    statsDiv.innerHTML = `
        <div style="color:#2ecc71;">Geld: $${geld.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
        <div style="color:#f1c40f;">Trofeeën: ${trofeeën}</div>
    `;

    btnRad.innerText = `Bereik: $${prijsRadius.toFixed(2)}`;
    btnSpd.innerText = `Snelheid: $${prijsSnelheid.toFixed(2)}`;
    btnVal.innerText = `Waarde: $${prijsWaarde.toFixed(2)}`;

    rewardBtn.style.display = (trofeeën > geclaimdeRewards) ? 'block' : 'none';
    rewardBtn.innerText = `CLAIM REWARD (${trofeeën - geclaimdeRewards})`;

    // Check Grasspass missie
    const voortgang = getStat(actieveOpdracht.id) - actieveOpdracht.startValue;
    if (voortgang >= actieveOpdracht.doel) {
        if (actieveOpdracht.beloning.type === 'g') geld += actieveOpdracht.beloning.w;
        else alert(`Je hebt ${actieveOpdracht.beloning.w} gratis upgrades verdiend! (Handmatig toepassen)`);
        
        huidigLevel++;
        genereerOpdracht();
    }
    checkTrofeeProgress();
}

// --- GAME OBJECTEN ---
const mower = new THREE.Mesh(
    new THREE.BoxGeometry(1, 0.5, 1.2),
    new THREE.MeshStandardMaterial({ color: 0xff0000 })
);
mower.position.y = 0.25;
scene.add(mower);

const grassArr = [];
const grid = 20;
for (let x = -grid; x < grid; x += 0.6) {
    for (let z = -grid; z < grid; z += 0.6) {
        const grass = new THREE.Mesh(
            new THREE.SphereGeometry(0.1, 4, 4),
            new THREE.MeshStandardMaterial({ color: 0x2ecc71 })
        );
        grass.position.set(x, 0, z);
        scene.add(grass);
        grassArr.push(grass);
    }
}

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7.5);
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 0.6));

camera.position.set(0, 15, 15);
camera.lookAt(0, 0, 0);

// --- LOOP & INPUT ---
const keys = {};
window.onkeydown = (e) => keys[e.key.toLowerCase()] = true;
window.onkeyup = (e) => keys[e.key.toLowerCase()] = false;

function animate() {
    requestAnimationFrame(animate);

    if (keys['w'] || keys['z']) mower.position.z -= huidigeSnelheid;
    if (keys['s']) mower.position.z += huidigeSnelheid;
    if (keys['a'] || keys['q']) mower.position.x -= huidigeSnelheid;
    if (keys['d']) mower.position.x += huidigeSnelheid;

    grassArr.forEach(g => {
        if (g.visible && mower.position.distanceTo(g.position) < huidigMowerRadius) {
            g.visible = false;
            geld += grasWaarde;
            totaalVerdiend += grasWaarde;
            totaalGemaaid++;
            updateUI();
        }
    });

    camera.position.set(mower.position.x, 15, mower.position.z + 15);
    camera.lookAt(mower.position);
    renderer.render(scene, camera);
}

// START
genereerOpdracht();
updateUI();
animate();
