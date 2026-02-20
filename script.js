import * as THREE from 'three';

// --- ENGINE SETUP ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- GAME DATA ---
let geld = 0, totaalVerdiend = 0, totaalGemaaid = 0, totaalUpgrades = 0, speedSpending = 0;
let trofeeën = 0, geclaimdeTrofeeën = 0, huidigLevel = 1; 
let grasWaarde = 0.01, huidigeSnelheid = 0.15, huidigMowerRadius = 1.3;
let prijsRadius = 5, prijsSnelheid = 5, prijsWaarde = 10;
let actieveOpdracht = null, rewardKlaar = false;

// EVENT DATA
const maanden = ["Januari", "Februari", "Maart", "April", "Mei", "Juni", "Juli", "Augustus", "September", "Oktober", "November", "December"];
const maandSkins = [0xffffff, 0xffc0cb, 0xffd700, 0x00ff00, 0x8b4513, 0x000000, 0xffff00, 0xffa500, 0x800080, 0x006400, 0x808080, 0x8b0000];
const huidigeMaandIndex = new Date().getMonth();
const huidigeMaandNaam = maanden[huidigeMaandIndex];

let eventLevel = 1;
let eventOpdracht = null; // Specifieke opdracht voor het event
let eventRewardKlaar = false;
let skinsUnlocked = ["Red"];
let huidigeSkin = "Red";
const skinKleuren = { "Red": 0xff0000, "Blue": 0x0000ff };
skinKleuren[huidigeMaandNaam] = maandSkins[huidigeMaandIndex];

// --- MISSILOGICA (ZOWEL GRASSPASS ALS EVENT) ---
function genereerMissie(isEvent = false) {
    const types = [
        {id:'m', d:5000, t:"Maai 5000 sprieten"}, 
        {id:'u', d:10, t:"Koop 10 upgrades"}, 
        {id:'v', d:1000, t:"Verdien $1000"}
    ];
    const gekozen = types[Math.floor(Math.random()*types.length)];
    
    if (isEvent) {
        // Event missies schalen met het level
        const factor = 1 + (eventLevel * 0.1);
        eventOpdracht = {
            ...gekozen, 
            d: Math.floor(gekozen.d * factor), 
            start: getStat(gekozen.id),
            t: gekozen.t.replace(/\d+/, Math.floor(gekozen.d * factor))
        };
        eventRewardKlaar = false;
    } else {
        // Grasspass missie
        if (huidigLevel === 25) {
            actieveOpdracht = {id:'m', d:250000, t:"GIGA: Maai 250k sprieten", start:totaalGemaaid, beloning:{type:'g',w:25000}};
        } else {
            const b = Math.random() > 0.5 ? {type:'g', w:Math.min(huidigLevel*250, 5000)} : {type:'u', w:Math.min(huidigLevel, 10)};
            actieveOpdracht = {...gekozen, start: getStat(gekozen.id), beloning: b};
        }
        rewardKlaar = false;
    }
}

function getStat(id) {
    if(id==='m') return totaalGemaaid; 
    if(id==='u') return totaalUpgrades; 
    if(id==='v') return totaalVerdiend; 
    return 0;
}

// --- UI ---
const ui = document.createElement('div');
ui.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; pointer-events:none; font-family:Impact, sans-serif; z-index:9999;';
document.body.appendChild(ui);

const geldBox = document.createElement('div');
geldBox.style.cssText = 'position:absolute; top:20px; left:20px; background:rgba(0,0,0,0.8); padding:15px 25px; border-radius:10px; border:3px solid #2ecc71; color:#2ecc71; font-size:32px; pointer-events:auto;';
ui.appendChild(geldBox);

const trofeeStats = document.createElement('div');
trofeeStats.style.cssText = 'position:absolute; top:20px; right:20px; display:flex; flex-direction:column; gap:5px; pointer-events:auto;';
ui.appendChild(trofeeStats);

const leftMenu = document.createElement('div');
leftMenu.style.cssText = 'position:absolute; top:50%; left:20px; transform:translateY(-50%); display:flex; flex-direction:column; gap:15px; pointer-events:auto;';
ui.appendChild(leftMenu);

const rightBottomMenu = document.createElement('div');
rightBottomMenu.style.cssText = 'position:absolute; bottom:20px; right:20px; display:flex; flex-direction:column; gap:10px; pointer-events:auto;';
ui.appendChild(rightBottomMenu);

const eventBtn = document.createElement('button');
const cheatBtn = document.createElement('button');
cheatBtn.innerText = "🔑 REDEEM";
cheatBtn.style.cssText = 'background:#e74c3c; color:white; border:none; padding:10px; border-radius:8px; cursor:pointer; font-weight:bold;';
rightBottomMenu.appendChild(cheatBtn);
rightBottomMenu.appendChild(eventBtn);

const gpBtn = document.createElement('button');
gpBtn.innerText = "⭐ GRASSPASS";
gpBtn.style.cssText = 'position:absolute; bottom:20px; left:20px; background: linear-gradient(to bottom, #f1c40f, #f39c12); color:white; border:3px solid white; padding:20px 40px; border-radius:15px; font-size:24px; cursor:pointer; pointer-events:auto; text-shadow: 2px 2px black;';
ui.appendChild(gpBtn);

const overlay = document.createElement('div');
overlay.style.cssText = 'position:fixed; top:0; left:-100%; width:100%; height:100%; background:rgba(0,0,0,0.95); z-index:10000; transition:0.4s; display:flex; align-items:center; justify-content:center; pointer-events:none; color:white;';
document.body.appendChild(overlay);

window.sluitMenu = () => { overlay.style.left = '-100%'; overlay.style.pointerEvents = 'none'; };

function updateUI() {
    geldBox.innerText = `$ ${geld.toLocaleString()}`;
    trofeeStats.innerHTML = `
        <div style="background:rgba(0,0,0,0.8); padding:10px 20px; border-radius:10px; border:3px solid #f1c40f; color:#f1c40f; font-size:32px; text-align:right;">🏆 ${trofeeën}</div>
        <button onclick="openTrofeePad()" style="background:#f39c12; color:white; border:none; padding:10px; border-radius:5px; cursor:pointer; font-weight:bold;">TROFEEËNPAD</button>
    `;
    leftMenu.innerHTML = `
        <button onclick="koop('r')" style="width:220px; padding:15px; background:#27ae60; color:white; border:3px solid #1e8449; border-radius:8px; font-weight:bold; cursor:pointer;">RADIUS: $${prijsRadius.toFixed(0)}</button>
        <button onclick="koop('s')" style="width:220px; padding:15px; background:#27ae60; color:white; border:3px solid #1e8449; border-radius:8px; font-weight:bold; cursor:pointer;">SPEED: $${prijsSnelheid.toFixed(0)}</button>
        <button onclick="koop('w')" style="width:220px; padding:15px; background:#27ae60; color:white; border:3px solid #1e8449; border-radius:8px; font-weight:bold; cursor:pointer;">VALUE: $${prijsWaarde.toFixed(0)}</button>
        <button onclick="openSkinMenu()" style="width:220px; padding:10px; background:#3498db; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer; margin-top:20px;">👕 SKINS</button>
    `;

    // Check Grasspass voortgang
    const gpVal = getStat(actieveOpdracht.id) - actieveOpdracht.start;
    if (gpVal >= actieveOpdracht.d) rewardKlaar = true;

    // Check Event voortgang
    const evVal = getStat(eventOpdracht.id) - eventOpdracht.start;
    if (evVal >= eventOpdracht.d) eventRewardKlaar = true;

    // Event Button Styling
    eventBtn.innerText = `📅 ${huidigeMaandNaam.toUpperCase()} (${eventLevel}/100)`;
    eventBtn.style.cssText = `background:${eventRewardKlaar ? '#f1c40f' : '#9b59b6'}; color:white; border:3px solid white; padding:15px; border-radius:10px; cursor:pointer; font-weight:bold; transition: 0.3s;`;
    
    if (totaalVerdiend >= (trofeeën + 1) * 100000) trofeeën++;
}

// --- EVENT MENU ---
eventBtn.onclick = () => {
    overlay.style.left = '0'; overlay.style.pointerEvents = 'auto';
    const v = Math.max(0, getStat(eventOpdracht.id) - eventOpdracht.start);
    const p = Math.min(Math.floor((v / eventOpdracht.d) * 100), 100);
    
    overlay.innerHTML = `<div style="background:#2c3e50; padding:40px; border:5px solid #9b59b6; border-radius:30px; text-align:center; width:500px; position:relative;">
        <button onclick="sluitMenu()" style="position:absolute; top:15px; right:15px; background:#e74c3c; color:white; border:none; border-radius:50%; width:40px; height:40px; cursor:pointer;">X</button>
        <h1 style="color:#9b59b6; margin:0;">${huidigeMaandNaam.toUpperCase()} EVENT</h1>
        <h2 style="color:white;">LEVEL ${eventLevel} / 100</h2>
        <p style="background:rgba(0,0,0,0.3); padding:10px; border-radius:10px;"><b>OPDRACHT:</b><br>${eventOpdracht.t}</p>
        <div style="width:100%; height:30px; background:#333; border-radius:15px; margin:20px 0; border:2px solid white; overflow:hidden;">
            <div style="width:${p}%; height:100%; background:#9b59b6;"></div>
        </div>
        <p>${v.toLocaleString()} / ${eventOpdracht.d.toLocaleString()}</p>
        <button onclick="claimEventReward()" style="background:${eventRewardKlaar ? '#2ecc71' : '#555'}; color:white; padding:15px 30px; border-radius:10px; cursor:pointer; border:none; font-weight:bold; margin-top:10px;">
            ${eventRewardKlaar ? '🎁 CLAIM BELONING' : '🔒 BEZIG MET OPDRACHT...'}
        </button>
    </div>`;
};

window.claimEventReward = () => {
    if (eventRewardKlaar && eventLevel <= 100) {
        if (eventLevel < 100) {
            let winst = Math.floor(Math.random() * 901) + 100;
            geld += winst; totaalVerdiend += winst;
            alert(`Event Level ${eventLevel} voltooid! +$${winst}`);
        } else {
            skinsUnlocked.push(huidigeMaandNaam);
            alert(`GIGANTISCH! Je hebt de ${huidigeMaandNaam} Skin vrijgespeeld!`);
        }
        eventLevel++;
        genereerMissie(true); // Nieuwe event missie
        updateUI();
        sluitMenu();
    }
};

// --- GRASSPASS MENU ---
gpBtn.onclick = () => {
    overlay.style.left = '0'; overlay.style.pointerEvents = 'auto';
    const v = Math.max(0, getStat(actieveOpdracht.id) - actieveOpdracht.start);
    const p = Math.min(Math.floor((v / actieveOpdracht.d) * 100), 100);
    overlay.innerHTML = `<div style="background: linear-gradient(135deg, #2c3e50, #000); padding:50px; border:5px solid #f1c40f; border-radius:30px; text-align:center; width:500px; position:relative;">
        <button onclick="sluitMenu()" style="position:absolute; top:15px; right:15px; background:#e74c3c; color:white; border:none; border-radius:50%; width:40px; height:40px; cursor:pointer;">X</button>
        <h1 style="color:#f1c40f; font-size:48px; margin:0;">GRASS PASS</h1>
        <h2 style="color:white; margin:10px 0;">LEVEL ${huidigLevel}</h2>
        <p style="font-size:18px;">${actieveOpdracht.t}</p>
        <div style="width:100%; height:35px; background:#333; border-radius:20px; margin:20px 0; border:2px solid white; overflow:hidden;"><div style="width:${p}%; height:100%; background:#f1c40f;"></div></div>
        <p>${v.toLocaleString()} / ${actieveOpdracht.d.toLocaleString()}</p>
        <button onclick="claimReward()" style="background:${rewardKlaar ? '#2ecc71' : '#444'}; color:white; padding:15px 30px; border-radius:10px; cursor:pointer; border:none; font-weight:bold;">
            ${rewardKlaar ? '🎁 CLAIM' : 'LOCK'}
        </button>
    </div>`;
};

window.claimReward = () => {
    if (rewardKlaar) {
        if (actieveOpdracht.beloning.type === 'g') { geld += actieveOpdracht.beloning.w; totaalVerdiend += actieveOpdracht.beloning.w; }
        else { for(let i=0; i<actieveOpdracht.beloning.w; i++) { huidigMowerRadius += 0.1; huidigeSnelheid += 0.01; } }
        huidigLevel++; genereerMissie(false); updateUI(); sluitMenu();
    }
};

// --- STANDAARD FUNCTIES (SKINS, TROFEE, KOOP) ---
window.openSkinMenu = () => {
    overlay.style.left = '0'; overlay.style.pointerEvents = 'auto';
    let html = `<div style="background:#222; padding:40px; border:5px solid #3498db; border-radius:30px; text-align:center; min-width:400px; max-height:80vh; overflow-y:auto;">
        <h1 style="color:#3498db;">SKINS</h1>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin:20px 0;">`;
    Object.keys(skinKleuren).forEach(s => {
        const un = skinsUnlocked.includes(s);
        html += `<button onclick="${un ? `setSkin('${s}')` : ''}" style="padding:15px; background:${un ? (huidigeSkin === s ? '#2ecc71' : '#444') : '#111'}; color:white; border:none; border-radius:10px; cursor:pointer;">${s} ${un ? '' : '🔒'}</button>`;
    });
    html += `</div><button onclick="sluitMenu()">SLUIT</button></div>`;
    overlay.innerHTML = html;
};

window.setSkin = (s) => { huidigeSkin = s; mower.material.color.set(skinKleuren[s]); sluitMenu(); };

window.openTrofeePad = () => {
    overlay.style.left = '0'; overlay.style.pointerEvents = 'auto';
    let padHTML = `<div style="background:#111; padding:40px; border:5px solid #f1c40f; border-radius:30px; width:600px; max-height:80vh; display:flex; flex-direction:column; position:relative;">
        <button onclick="sluitMenu()" style="position:absolute; top:15px; right:15px; background:#e74c3c; color:white; border:none; border-radius:50%; width:40px; height:40px; cursor:pointer;">X</button>
        <h1 style="color:#f1c40f;">TROFEEËNPAD</h1>
        <div style="flex-grow:1; overflow-y:auto; display:flex; flex-direction:column; gap:10px;">`;
    for (let i = 1; i <= Math.max(trofeeën + 2, 10); i++) {
        let status = (i <= geclaimdeTrofeeën) ? "✅" : (i <= trofeeën) ? `<button onclick="claimTrofee(${i})">CLAIM</button>` : "🔒";
        padHTML += `<div style="background:#222; padding:15px; border-radius:15px; display:flex; justify-content:space-between; border:1px solid #444;"><span>🏆 Trofee ${i}</span><span>${status}</span></div>`;
    }
    padHTML += `</div></div>`; overlay.innerHTML = padHTML;
};

window.claimTrofee = (nr) => {
    if (nr === geclaimdeTrofeeën + 1) {
        geclaimdeTrofeeën++;
        let b = (nr === 1) ? 50000 : (nr === 2) ? 75000 : Math.floor(Math.random() * 85001) + 10000;
        if (nr === 10) skinsUnlocked.push("Blue");
        geld += b; totaalVerdiend += b; updateUI(); openTrofeePad();
    }
};

window.koop = (t) => {
    if (t === 'r' && geld >= prijsRadius) { geld -= prijsRadius; huidigMowerRadius += 0.3; prijsRadius *= 1.6; totaalUpgrades++; }
    if (t === 's' && geld >= prijsSnelheid) { geld -= prijsSnelheid; speedSpending += prijsSnelheid; huidigeSnelheid += 0.02; prijsSnelheid *= 1.6; totaalUpgrades++; }
    if (t === 'w' && geld >= prijsWaarde) { geld -= prijsWaarde; grasWaarde += 0.01; prijsWaarde *= 1.7; totaalUpgrades++; }
    updateUI();
};

cheatBtn.onclick = () => {
    const code = prompt("Code:");
    if(code === "OG-kervelsoeps") { geld += 50000; alert("Code OK! +$50.000"); }
    else if(code === "!wannaBEop") { geld += 100000; alert("Code OK! +$100.000"); }
    else if(code === "YEAHman") { geld += 250000; alert("Code OK! +$250.000"); }
    updateUI();
};

// --- 3D WORLD ---
const mower = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.5, 1.2), new THREE.MeshStandardMaterial({color: 0xff0000}));
scene.add(mower);
scene.add(new THREE.AmbientLight(0xffffff, 0.9));
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 15, 5); scene.add(light);
camera.position.set(0, 15, 15);

const grassArr = [];
for(let x=-20; x<20; x+=0.8) {
    for(let z=-20; z<20; z+=0.8) {
        const g = new THREE.Mesh(new THREE.BoxGeometry(0.3,0.3,0.3), new THREE.MeshStandardMaterial({color: 0x2ecc71}));
        g.position.set(x,0,z); g.userData = {cut: 0}; scene.add(g); grassArr.push(g);
    }
}

const keys = {};
window.onkeydown=(e)=>keys[e.key.toLowerCase()]=true;
window.onkeyup=(e)=>keys[e.key.toLowerCase()]=false;

function animate() {
    requestAnimationFrame(animate);
    const nu = Date.now();
    if(keys['w']||keys['z']) mower.position.z -= huidigeSnelheid;
    if(keys['s']) mower.position.z += huidigeSnelheid;
    if(keys['a']||keys['q']) mower.position.x -= huidigeSnelheid;
    if(keys['d']) mower.position.x += huidigeSnelheid;
    grassArr.forEach(g => {
        if(g.visible && mower.position.distanceTo(g.position) < huidigMowerRadius) {
            g.visible = false; g.userData.cut = nu;
            geld += grasWaarde; totaalVerdiend += grasWaarde; totaalGemaaid++; 
            updateUI();
        }
        if(!g.visible && nu - g.userData.cut > 8000) g.visible = true;
    });
    camera.position.set(mower.position.x, 15, mower.position.z + 15);
    camera.lookAt(mower.position);
    renderer.render(scene, camera);
}

genereerMissie(false); 
genereerMissie(true); 
updateUI(); 
animate();
