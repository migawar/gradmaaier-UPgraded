import * as THREE from 'three';

// --- INITIALISATIE ---
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
let huidigMowerRadius = 1.0;
let huidigeSnelheid = 0.12;

let prijsRadius = 5.00, prijsSnelheid = 5.00, prijsWaarde = 10.00;
const MAX_RADIUS = 10.0;
const MAX_WAARDE = 5.01;

// --- GRASSPASS DATA ---
let huidigLevel = 1;
let actieveOpdracht = null;

function genereerOpdracht() {
    if (huidigLevel === 25) {
        actieveOpdracht = { type: 'maaien', doel: 250000, tekst: "Maai 250.000 grassprieten", beloning: { type: 'geld', waarde: 25000 } };
    } else if (huidigLevel < 25) {
        const types = [
            { id: 'maaien', doel: 5000, tekst: "Maai 5.000 grassprieten" },
            { id: 'upgrades', doel: 5, tekst: "Koop 5 upgrades" },
            { id: 'verdienen', doel: 500, tekst: "Verdien $500" },
            { id: 'speed', doel: 50, tekst: "Besteed $50 aan snelheid" }
        ];
        const r = types[Math.floor(Math.random() * types.length)];
        const b = Math.random() > 0.5 ? { type: 'geld', waarde: 500 } : { type: 'upgrades', waarde: 2 };
        actieveOpdracht = { ...r, beloning: b, voortgang: 0 };
    } else {
        const types = [
            { id: 'maaien', doel: 25000, tekst: "Maai 25.000 grassprieten" },
            { id: 'upgrades', doel: 25, tekst: "Koop 25 upgrades" },
            { id: 'verdienen', doel: 2500, tekst: "Verdien $2.500" },
            { id: 'speed', doel: 250, tekst: "Besteed $250 aan snelheid" }
        ];
        const r = types[Math.floor(Math.random() * types.length)];
        const b = Math.random() > 0.5 ? { type: 'geld', waarde: 2500 } : { type: 'upgrades', waarde: 15 };
        actieveOpdracht = { ...r, beloning: b, voortgang: 0 };
    }
}

// --- UI COMPONENTEN ---
const gpOverlay = document.createElement('div');
gpOverlay.style.cssText = 'position:fixed; top:0; left:-100%; width:100%; height:100%; background:rgba(0,0,0,0.85); backdrop-filter:blur(10px); z-index:1000; transition:left 0.5s ease; display:flex; align-items:center; justify-content:center; font-family:sans-serif; color:white;';
document.body.appendChild(gpOverlay);

const gpCard = document.createElement('div');
gpCard.style.cssText = 'width:550px; background:#1a1a1a; border:3px solid #f1c40f; border-radius:25px; padding:40px; text-align:center; box-shadow:0 0 40px rgba(241,196,15,0.3);';
gpOverlay.appendChild(gpCard);

function updatePassUI() {
    let voortgang = 0;
    if (actieveOpdracht.id === 'maaien') voortgang = totaalGemaaid; // Versimpeld voor demo
    // In een echte app zou je de startwaarde van de missie bijhouden
    
    gpCard.innerHTML = `
        <h1 style="color:#f1c40f; margin-top:0;">⭐ GRASSPASS LEVEL ${huidigLevel}</h1>
        <div style="background:#333; height:25px; border-radius:15px; margin:25px 0; overflow:hidden; border:1px solid #555;">
            <div style="width:50%; height:100%; background:#f1c40f;"></div>
        </div>
        <h2>${actieveOpdracht.tekst}</h2>
        <p style="color:#2ecc71; font-weight:bold; font-size:1.2em;">BELONING: ${actieveOpdracht.beloning.waarde} ${actieveOpdracht.beloning.type === 'geld' ? 'Geld' : 'Gratis Upgrades'}</p>
        <button id="closeGP" style="margin-top:30px; padding:12px 35px; background:white; border:none; border-radius:50px; font-weight:bold; cursor:pointer;">TERUG</button>
    `;
    document.getElementById('closeGP').onclick = () => gpOverlay.style.left = '-100%';
}

const gpBtn = document.createElement('button');
gpBtn.style.cssText = 'position:absolute; bottom:20px; left:20px; z-index:10; background:#f1c40f; color:black; border:none; padding:15px 30px; border-radius:50px; font-weight:bold; cursor:pointer;';
gpBtn.innerText = "⭐ GRASSPASS";
gpBtn.onclick = () => { gpOverlay.style.left = '0'; updatePassUI(); };
document.body.appendChild(gpBtn);

// --- TROFEEËNPAD LOGICA ---
function claimTrofeeReward() {
    let nr = geclaimdeRewards + 1;
    let bonus = 0;
    if (nr === 1) bonus = 50000;
    else if (nr === 2) bonus = 75000;
    else if (nr >= 3 && nr <= 9) bonus = Math.floor(Math.random() * 90001) + 10000;
    else if (nr === 10) skinBtn.style.display = 'block';

    geld += bonus; geclaimdeRewards++;
    updateGameUI();
}

// Rest van de engine (mower, grass, etc.) zoals voorheen...
// Vergeet niet 'genereerOpdracht()' aan te roepen bij start!
genereerOpdracht();
