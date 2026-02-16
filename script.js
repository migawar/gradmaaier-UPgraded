import * as THREE from 'three';

// 1. SCÈNE & CAMERA
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- STATS & ECONOMIE ---
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

// --- GRASSPASS MISSIES (MOEILIJKER) ---
let huidigeMissieIndex = 0;
const grassPassMissies = [
    { tekst: "Maai 500 grassprieten", doel: 500, beloning: 2500 },
    { tekst: "Maai 2.500 grassprieten", doel: 2500, beloning: 12500 },
    { tekst: "Maai 10.000 grassprieten", doel: 10000, beloning: 50000 },
    { tekst: "Verdien $25.000 totaal", doel: 25000, type: "geld", beloning: 10000 },
    { tekst: "Maai 50.000 grassprieten", doel: 50000, beloning: 250000 },
    { tekst: "De Ultieme Maaier: 150.000 sprieten", doel: 150000, beloning: 1000000 }
];

// --- UI ELEMENTEN ---
const uiCSS = 'position:absolute; font-family:sans-serif; z-index:10; pointer-events: none;';
const btnCSS = 'position:absolute; font-family:sans-serif; z-index:10; pointer-events: auto; cursor:pointer; border:none; border-radius:5px; font-weight:bold; color:white;';

// XP Balk
const xpContainer = document.createElement('div');
xpContainer.style.cssText = uiCSS + 'top:20px; left:50%; transform:translateX(-50%); width:400px; height:20px; background:rgba(0,0,0,0.5); border:2px solid white; border-radius:10px; overflow:hidden;';
document.body.appendChild(xpContainer);

const xpBalk = document.createElement('div');
xpBalk.style.cssText = 'width:0%; height:100%; background:linear-gradient(90deg, #4facfe, #00f2fe); transition:0.2s;';
xpContainer.appendChild(xpBalk);

const xpTekst = document.createElement('div');
xpTekst.style.cssText = uiCSS + 'top:45px; left:50%; transform:translateX(-50%); color:white; font-size:13px; text-shadow: 1px 1px 2px black; white-space:nowrap;';
document.body.appendChild(xpTekst);

// Geld & Trofeeën
const geldDisplay = document.createElement('div');
geldDisplay.style.cssText = uiCSS + 'top:10px; left:10px; color:white; font-size:22px; background:rgba(0,0,0,0.6); padding:10px; border-radius:8px;';
document.body.appendChild(geldDisplay);

const trofeeDisplay = document.createElement('div');
trofeeDisplay.style.cssText = uiCSS + 'top:10px; right:10px; color:#f1c40f; font-size:22px; background:rgba(0,0,0,0.6); padding:10px; border-radius:8px; border:2px solid #f1c40f;';
document.body.appendChild(trofeeDisplay);

// Knoppen
const rewardBtn = document.createElement('button');
rewardBtn.style.cssText = btnCSS + 'right:10px; top:50%; background:#32CD32; padding:20px; display:none; box-shadow: 0 0 10px #32CD32;';
rewardBtn.onclick = claimReward;
document.body.appendChild(rewardBtn);

const skinBtn = document.createElement('button');
skinBtn.style.cssText = btnCSS + 'bottom:20px; left:50%; transform:translateX(-50%); background:#3498db; padding:15px 40px; display:none;';
skinBtn.innerText = "SKINS";
skinBtn.onclick = () => {
    let keuze = prompt("Kies skin: 'blauw' (Trofee 10 reward) of 'rood' (Standaard)");
    if(keuze?.toLowerCase() === 'blauw') mower.material.color.set(0x0000ff);
    else mower.material.color.set(0xff0000);
};
document.body.appendChild(skinBtn);

const gpBtn = document.createElement('button');
gpBtn.style.cssText = btnCSS + 'bottom:20px; left:20px; background:linear-gradient(45deg, #f1c40f, #e67e22); padding:15px 25px;';
gpBtn.innerText = "⭐ GRASSPASS";
gpBtn.onclick = () => {
    let m = grassPassMissies[huidigeMissieIndex];
    alert(m ? `Huidige missie: ${m.tekst}\nBeloning bij voltooiing: $${formatteerGeld(m.beloning)}` : "Alle Grasspass missies voltooid!");
};
document.body.appendChild(gpBtn);

function formatteerGeld(bedrag) {
    if (bedrag >= 1000000000) return (bedrag / 1000000000).toFixed(2) + " mld";
    if (bedrag >= 1000000) return (bedrag / 1000000).toFixed(2) + " mil";
    return bedrag.toFixed(2);
}

// --- BELONINGEN LOGICA ---
function claimReward() {
    if (trofeeën > geclaimdeRewards) {
        let nr = geclaimdeRewards + 1;
        let bonus = 0;
        if (nr === 1) bonus = 50000; // Trofee 1: $50.000 
        else if (nr === 2) bonus = 75000; // Trofee 2: $75.000 
        else if (nr >= 3 && nr <= 9) bonus = Math.floor(Math.random() * 90001) + 10000; // Trofee 3-9: willekeurig 
        else if (nr === 10) { skinBtn.style.display = 'block'; alert("Trofee 10: Je hebt de Blauwe Skin ontgrendeld!"); } // 

        geld += bonus;
        geclaimdeRewards++;
        if(bonus > 0) alert(`Beloning geclaimd! Je ontvangt $${formatteerGeld(bonus)}`);
        updateUI();
    }
}

function updateUI() {
    geldDisplay.innerText = '$ ' + formatteerGeld(geld);
    trofeeDisplay.innerText = '🏆 ' + trofeeën;
    rewardBtn.style.display = (trofeeën > geclaimdeRewards) ? 'block' : 'none';
    rewardBtn.innerHTML = `CLAIM REWARD<br><small>(${trofeeën - geclaimdeRewards} beschikbaar)</small>`;
    
    let m = grassPassMissies[huidigeMissieIndex];
    if (m) {
        let v = m.type === "geld" ? totaalVerdiend : totaalGemaaid;
        let p = Math.min((v / m.doel) * 100, 100);
        xpBalk.style.width = p + "%";
        xpTekst.innerText = `${m.tekst} - Beloning: $${formatteerGeld(m.beloning)}`;
        if (v >= m.doel) {
            geld += m.beloning;
            huidigeMissieIndex++;
            alert(`MISSY VOLTOOID! Je krijgt $${formatteerGeld(m.beloning)}`);
            updateUI();
        }
    } else {
        xpBalk.style.width = "100%";
        xpTekst.innerText = "GRASSPASS MAX LEVEL";
    }

    btnRadius.innerText = huidigMowerRadius >= MAX_RADIUS ? "RADIUS: MAX" : `GROTER BEREIK ($${formatteerGeld(prijsRadius)})`;
    btnWaarde.innerText = grasWaarde >= MAX_WAARDE ? "WAARDE: MAX" : `MEER WAARDE ($${formatteerGeld(prijsWaarde)})`;
    btnSpeed.innerText = `SNELLER ($${formatteerGeld(prijsSnelheid)})`;
}

// 3. OBJECTEN & SCÈNE
const mower = new THREE.Mesh(new THREE.BoxGeometry(1, 0.6, 1.2), new THREE.MeshStandardMaterial({ color: 0xff0000 }));
mower.position.y = 0.3;
scene.add(mower);

const grassArray = [];
const fieldSize = 25;
for (let x = -fieldSize; x < fieldSize; x += 0.6) {
    for (let z = -fieldSize; z < fieldSize; z += 0.6) {
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

// 4. INPUT FIX (GEEN DOORRIJDEN)
const keys = {};
window.onkeydown = (e) => keys[e.key.toLowerCase()] = true;
window.onkeyup = (e) => keys[e.key.toLowerCase()] = false;
window.onblur = () => { for (let k in keys) keys[k] = false; }; // Stop als je tabt

function animate() {
    requestAnimationFrame(animate);
    
    // Beweging alleen als toets ECHT is ingedrukt
    if (keys['z'] || keys['w']) mower.position.z -= huidigeSnelheid;
    if (keys['s']) mower.position.z += huidigeSnelheid;
    if (keys['q'] || keys['a']) mower.position.x -= huidigeSnelheid;
    if (keys['d']) mower.position.x += huidigeSnelheid;

    const currentTime = Date.now();
    for (let g of grassArray) {
        if (g.visible) {
            const dist = mower.position.distanceTo(g.position);
            if (dist < huidigMowerRadius) {
                g.visible = false;
                g.userData.time = currentTime;
                geld += grasWaarde; totaalVerdiend += grasWaarde; totaalGemaaid++;
                
                if (totaalVerdiend >= (trofeeën + 1) * 100000) {
                    trofeeën++;
                    if (trofeeën <= 10) {
                        mower.scale.multiplyScalar(1.1);
                        mower.position.y = (mower.scale.y * 0.6) / 2;
                    }
                }
                updateUI();
            }
        } else if (currentTime - g.userData.time > 4000) {
            g.visible = true;
        }
    }
    camera.position.set(mower.position.x, 12, mower.position.z + 12);
    camera.lookAt(mower.position);
    renderer.render(scene, camera);
}

// Upgrades
const menu = document.createElement('div');
menu.style.cssText = 'position:absolute; left:10px; top:50%; transform:translateY(-50%); display:flex; flex-direction:column; gap:8px; z-index:10;';
document.body.appendChild(menu);

function maakUpgradeBtn(actie) {
    const btn = document.createElement('button');
    btn.style.cssText = 'background:#2ecc71; color:white; border:none; padding:12px; cursor:pointer; border-radius:5px; font-weight:bold; min-width:200px; text-align:left;';
    btn.onclick = actie;
    menu.appendChild(btn);
    return btn;
}

const btnRadius = maakUpgradeBtn(() => { if (geld >= prijsRadius && huidigMowerRadius < MAX_RADIUS) { geld -= prijsRadius; huidigMowerRadius += 0.4; prijsRadius *= 1.7; updateUI(); } });
const btnSpeed = maakUpgradeBtn(() => { if (geld >= prijsSnelheid) { geld -= prijsSnelheid; huidigeSnelheid += 0.02; prijsSnelheid *= 1.6; updateUI(); } });
const btnWaarde = maakUpgradeBtn(() => { if (geld >= prijsWaarde && grasWaarde < MAX_WAARDE) { geld -= prijsWaarde; grasWaarde += 0.05; prijsWaarde *= 1.8; updateUI(); } });

// Cheat
const cheatBtn = document.createElement('button');
cheatBtn.style.cssText = btnCSS + 'top:10px; left:50%; transform:translateX(-50%); background:rgba(0,100,0,0.5); padding:8px 15px; font-size:10px;';
cheatBtn.innerText = "CODE";
cheatBtn.onclick = () => { if(prompt("Cheat:") === "OG-kervelsoeps") { geld += 200000; totaalVerdiend += 200000; updateUI(); } };
document.body.appendChild(cheatBtn);

updateUI();
animate();
