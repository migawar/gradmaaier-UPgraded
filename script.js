import * as THREE from 'three';

// --- GAME VARIABELEN ---
let geld = 0, totaalVerdiend = 0, totaalGemaaid = 0, totaalUpgrades = 0, speedSpending = 0;
let trofeeën = 0, geclaimdeRewards = 0, huidigLevel = 1;
let grasWaarde = 0.01, huidigeSnelheid = 0.12, huidigMowerRadius = 1.0;
let prijsRadius = 5.00, prijsSnelheid = 5.00, prijsWaarde = 10.00;
let actieveOpdracht = null;

// --- GRASSPASS LOGICA (Uit document) ---
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
        // Willekeurige beloningen level 1-24 [cite: 16]
        const beloning = Math.random() > 0.5 ? { type: 'g', w: 500, t: "$500" } : { type: 'u', w: 2, t: "2 gratis upgrades" }; // [cite: 17, 18]
        actieveOpdracht = { ...gekozen, beloning, start: getStat(gekozen.id) };
    } 
    else if (huidigLevel === 25) {
        // Level 25 [cite: 19]
        actieveOpdracht = { id: 'm', doel: 250000, tekst: "Maai 250.000 grassprieten", start: totaalGemaaid, beloning: { type: 'g', w: 25000, t: "$25.000" } }; // [cite: 20, 21]
    } 
    else {
        // Willekeurige opdrachten level 26-50 [cite: 22]
        const opties = [
            { id: 'm', doel: 25000, tekst: "Maai 25000 grassprieten" }, // [cite: 23]
            { id: 'u', doel: 25, tekst: "Koop 25 upgrades" },          // [cite: 24]
            { id: 'v', doel: 2500, tekst: "Verdien $2500" },            // [cite: 25]
            { id: 's', doel: 250, tekst: "Spendeer $250 aan snelheid" } // [cite: 26]
        ];
        const gekozen = opties[Math.floor(Math.random() * opties.length)];
        // Willekeurige beloningen level 26-50 [cite: 27]
        const beloning = Math.random() > 0.5 ? { type: 'g', w: 2500, t: "$2500" } : { type: 'u', w: 15, t: "15 gratis upgrades" }; // [cite: 28, 29]
        actieveOpdracht = { ...gekozen, beloning, start: getStat(gekozen.id) };
    }
}

function getStat(id) {
    if (id === 'm') return totaalGemaaid;
    if (id === 'u') return totaalUpgrades;
    if (id === 'v') return totaalVerdiend;
    if (id === 's') return speedSpending;
}

// --- UI SCHERM (GEEN ALERT) ---
const ui = document.createElement('div');
ui.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; font-family:sans-serif; color:white;';
document.body.appendChild(ui);

const gpBtn = document.createElement('button');
gpBtn.innerText = "⭐ GRASSPASS";
gpBtn.style.cssText = 'position:absolute; bottom:20px; left:20px; pointer-events:auto; background:#f1c40f; padding:15px; border:none; border-radius:10px; font-weight:bold; cursor:pointer;';
document.body.appendChild(gpBtn);

const overlay = document.createElement('div');
overlay.style.cssText = 'position:fixed; top:0; left:-100%; width:100%; height:100%; background:rgba(0,0,0,0.9); pointer-events:auto; transition:0.5s; display:flex; align-items:center; justify-content:center; z-index:100;';
document.body.appendChild(overlay);

gpBtn.onclick = () => {
    overlay.style.left = '0';
    const voortgang = getStat(actieveOpdracht.id) - actieveOpdracht.start;
    const proc = Math.min(Math.floor((voortgang / actieveOpdracht.doel) * 100), 100);
    overlay.innerHTML = `
        <div style="background:#222; padding:40px; border:2px solid #f1c40f; border-radius:20px; text-align:center;">
            <h1 style="color:#f1c40f">LEVEL ${huidigLevel}</h1>
            <h2>${actieveOpdracht.tekst}</h2>
            <div style="width:300px; height:20px; background:#444; border-radius:10px; margin:20px auto;">
                <div style="width:${proc}%; height:100%; background:#f1c40f; border-radius:10px;"></div>
            </div>
            <p>${voortgang} / ${actieveOpdracht.doel} (${proc}%)</p>
            <p style="color:#2ecc71">Beloning: ${actieveOpdracht.beloning.t}</p>
            <button onclick="this.parentElement.parentElement.style.left='-100%'" style="padding:10px 20px; cursor:pointer;">SLUITEN</button>
        </div>`;
};

// --- TROFEEËNPAD (Uit document) ---
const skinBtn = document.createElement('button'); // [cite: 8]
skinBtn.innerText = "KIES SKIN";
skinBtn.style.cssText = 'position:absolute; bottom:20px; left:50%; transform:translateX(-50%); pointer-events:auto; background:#3498db; padding:15px; border:none; border-radius:10px; color:white; display:none; cursor:pointer;';
document.body.appendChild(skinBtn);

skinBtn.onclick = () => {
    const keuze = prompt("Welke skin wil je? (typ 'blauw' voor de blauwe skin)"); // [cite: 9]
    if (keuze === 'blauw') mower.material.color.set(0x0000ff); // [cite: 10]
};

function checkRewards() {
    if (totaalVerdiend >= (trofeeën + 1) * 100000) {
        trofeeën++; // [cite: 1, 3, 5, 7]
        let prijs = 0;
        if (trofeeën === 1) prijs = 50000; // [cite: 2]
        else if (trofeeën === 2) prijs = 75000; // [cite: 4]
        else if (trofeeën >= 3 && trofeeën <= 9) prijs = Math.floor(Math.random() * 90001) + 10000; // [cite: 6]
        else if (trofeeën === 10) skinBtn.style.display = 'block'; // [cite: 8]
        
        geld += prijs;
    }
}

// --- ENGINE ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const mower = new THREE.Mesh(new THREE.BoxGeometry(1,0.5,1), new THREE.MeshStandardMaterial({color:0xff0000}));
scene.add(mower);
scene.add(new THREE.AmbientLight(0xffffff, 1));
camera.position.set(0, 10, 10); camera.lookAt(0,0,0);

const grassArr = [];
for(let x=-10; x<10; x+=0.5) {
    for(let z=-10; z<10; z+=0.5) {
        const g = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshStandardMaterial({color:0x2ecc71}));
        g.position.set(x,0,z); scene.add(g); grassArr.push(g);
    }
}

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
            g.visible = false;
            geld += grasWaarde; totaalVerdiend += grasWaarde; totaalGemaaid++;
            checkRewards();
            updateStats();
        }
    });
    camera.position.set(mower.position.x, 10, mower.position.z + 10);
    camera.lookAt(mower.position);
    renderer.render(scene, camera);
}

function updateStats() {
    ui.innerHTML = `<div style="padding:20px; font-size:20px;">$ ${geld.toFixed(2)} | 🏆 ${trofeeën}</div>`;
    const v = getStat(actieveOpdracht.id) - actieveOpdracht.start;
    if (v >= actieveOpdracht.doel) {
        if(actieveOpdracht.beloning.type === 'g') geld += actieveOpdracht.beloning.w;
        huidigLevel++;
        genereerOpdracht();
    }
}

genereerOpdracht();
animate();
