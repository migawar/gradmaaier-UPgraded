import * as THREE from 'three';

// --- ENGINE SETUP ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- GAME DATA ---
let geld = 0, totaalVerdiend = 0, totaalGemaaid = 0, totaalUpgrades = 0;
let trofeeën = 0, geclaimdeTrofeeën = 0, huidigLevel = 1; 
let grasWaarde = 0.01, huidigeSnelheid = 0.15, huidigMowerRadius = 1.3;
let prijsRadius = 5, prijsSnelheid = 5, prijsWaarde = 10;
let actieveOpdracht = null, rewardKlaar = false;

// EVENT DATA
const maanden = ["Januari", "Februari", "Maart", "April", "Mei", "Juni", "Juli", "Augustus", "September", "Oktober", "November", "December"];
const maandSkins = [0xffffff, 0xffc0cb, 0xffd700, 0x00ff00, 0x8b4513, 0x000000, 0xffff00, 0xffa500, 0x800080, 0x006400, 0x808080, 0x8b0000];
const huidigeMaandNaam = maanden[new Date().getMonth()];

let eventLevel = 1, eventOpdracht = null, eventRewardKlaar = false;
let skinsUnlocked = ["Red"], huidigeSkin = "Red";
const skinKleuren = { "Red": 0xff0000, "Blue": 0x0000ff };
skinKleuren[huidigeMaandNaam] = maandSkins[new Date().getMonth()];

// --- MISSILOGICA ---
function genereerMissie(isEvent = false) {
    const types = [
        {id:'m', d:5000, t:"Maai 5000 sprieten"}, 
        {id:'u', d:10, t:"Koop 10 upgrades"}, 
        {id:'v', d:1000, t:"Verdien $1000"}
    ];
    const gekozen = types[Math.floor(Math.random()*types.length)];
    
    if (isEvent) {
        const factor = 1 + (eventLevel * 0.1);
        eventOpdracht = {
            ...gekozen, 
            d: Math.floor(gekozen.d * factor), 
            start: getStat(gekozen.id),
            t: gekozen.t.replace(/\d+/, Math.floor(gekozen.d * factor))
        };
        eventRewardKlaar = false;
    } else {
        const b = Math.random() > 0.5 ? {type:'g', w:Math.min(huidigLevel*250, 5000)} : {type:'u', w:Math.min(huidigLevel, 10)};
        actieveOpdracht = {...gekozen, start: getStat(gekozen.id), beloning: b};
        rewardKlaar = false;
    }
}

function getStat(id) {
    if(id==='m') return totaalGemaaid; 
    if(id==='u') return totaalUpgrades; 
    if(id==='v') return totaalVerdiend; 
    return 0;
}

// --- UI HELPERS ---
const claimButtonStyle = `
    color: white; 
    border: none; 
    padding: 15px 35px; 
    border-radius: 15px; 
    cursor: pointer; 
    font-weight: 900; 
    font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
    font-size: 18px;
    letter-spacing: 1px;
    text-transform: uppercase; 
    transition: all 0.1s ease;
`;

// --- UI ---
const ui = document.createElement('div');
ui.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; pointer-events:none; font-family: sans-serif; z-index:9999;';
document.body.appendChild(ui);

const geldBox = document.createElement('div');
geldBox.style.cssText = 'position:absolute; top:20px; left:20px; background:rgba(0,0,0,0.8); padding:15px 25px; border-radius:10px; border:3px solid #2ecc71; color:#2ecc71; font-size:32px; font-weight:bold; pointer-events:auto;';
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
gpBtn.style.cssText = 'position:absolute; bottom:20px; left:20px; background: linear-gradient(to bottom, #f1c40f, #f39c12); color:white; border:3px solid white; padding:20px 40px; border-radius:15px; font-size:24px; cursor:pointer; pointer-events:auto; text-shadow: 2px 2px black; font-weight:bold;';
ui.appendChild(gpBtn);

const overlay = document.createElement('div');
overlay.style.cssText = 'position:fixed; top:0; left:-100%; width:100%; height:100%; background:rgba(0,0,0,0.95); z-index:10000; transition:0.4s; display:flex; align-items:center; justify-content:center; pointer-events:none; color:white; font-family: sans-serif;';
document.body.appendChild(overlay);

window.sluitMenu = () => { overlay.style.left = '-100%'; overlay.style.pointerEvents = 'none'; };

function updateUI() {
    geldBox.innerText = `$ ${geld.toLocaleString()}`;
    trofeeën = Math.floor(totaalVerdiend / 100000);
    trofeeStats.innerHTML = `
        <div style="background:rgba(0,0,0,0.8); padding:10px 20px; border-radius:10px; border:3px solid #f1c40f; color:#f1c40f; font-size:32px; text-align:right; font-weight:bold;">🏆 ${trofeeën}</div>
        <button onclick="openTrofeePad()" style="background:#f39c12; color:white; border:none; padding:10px; border-radius:5px; cursor:pointer; font-weight:bold;">TROFEEËNPAD</button>
    `;
    leftMenu.innerHTML = `
        <button onclick="koop('r')" style="width:220px; padding:15px; background:#27ae60; color:white; border:3px solid #1e8449; border-radius:8px; font-weight:bold; cursor:pointer;">RADIUS: $${prijsRadius.toFixed(0)}</button>
        <button onclick="koop('s')" style="width:220px; padding:15px; background:#27ae60; color:white; border:3px solid #1e8449; border-radius:8px; font-weight:bold; cursor:pointer;">SPEED: $${prijsSnelheid.toFixed(0)}</button>
        <button onclick="koop('w')" style="width:220px; padding:15px; background:#27ae60; color:white; border:3px solid #1e8449; border-radius:8px; font-weight:bold; cursor:pointer;">VALUE: $${prijsWaarde.toFixed(0)}</button>
        <button onclick="openSkinMenu()" style="width:220px; padding:10px; background:#3498db; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer; margin-top:20px;">👕 SKINS</button>
    `;

    if (getStat(actieveOpdracht.id) - actieveOpdracht.start >= actieveOpdracht.d) rewardKlaar = true;
    if (getStat(eventOpdracht.id) - eventOpdracht.start >= eventOpdracht.d) eventRewardKlaar = true;

    eventBtn.innerText = `📅 ${huidigeMaandNaam.toUpperCase()} (${eventLevel}${eventLevel > 100 ? '+' : '/100'})`;
    eventBtn.style.cssText = `background:${eventRewardKlaar ? '#2ecc71' : '#9b59b6'}; color:white; border:3px solid white; padding:15px; border-radius:10px; cursor:pointer; font-weight:bold; transition:0.2s;`;
}

// --- MENUS ---
window.claimTrofee = (nr) => {
    if (nr === geclaimdeTrofeeën + 1) {
        geclaimdeTrofeeën++;
        let beloning = Math.min(Math.floor(Math.random() * 15000) + 10000, 25000);
        if (nr === 10) skinsUnlocked.push("Blue");
        geld += beloning; totaalVerdiend += beloning; updateUI(); openTrofeePad();
    }
};

window.openTrofeePad = () => {
    overlay.style.left = '0'; overlay.style.pointerEvents = 'auto';
    let padHTML = `<div style="background:#111; padding:40px; border:5px solid #f1c40f; border-radius:30px; width:600px; max-height:80vh; display:flex; flex-direction:column; position:relative;">
        <button onclick="sluitMenu()" style="position:absolute; top:15px; right:15px; background:#e74c3c; color:white; border:none; border-radius:50%; width:40px; height:40px; cursor:pointer;">X</button>
        <h1 style="color:#f1c40f; font-family: Impact;">TROFEEËNPAD</h1>
        <div style="flex-grow:1; overflow-y:auto; display:flex; flex-direction:column; gap:10px;">`;
    for (let i = 1; i <= Math.max(trofeeën + 2, 12); i++) {
        let isClaimed = i <= geclaimdeTrofeeën;
        let canClaim = i <= trofeeën;
        let st = isClaimed ? "✅" : (canClaim ? `<button onclick="claimTrofee(${i})" style="${claimButtonStyle} background:#2ecc71; padding:5px 10px; font-size:12px;">CLAIM</button>` : "🔒");
        padHTML += `<div style="background:#222; padding:15px; border-radius:15px; display:flex; justify-content:space-between; align-items:center;"><span>🏆 Trofee ${i}</span><span>${st}</span></div>`;
    }
    padHTML += `</div></div>`; overlay.innerHTML = padHTML;
};

window.openSkinMenu = () => {
    overlay.style.left = '0'; overlay.style.pointerEvents = 'auto';
    let h = `<div style="background: linear-gradient(135deg, #1a1a1a, #000); padding:40px; border:4px solid #3498db; border-radius:30px; text-align:center; width:550px;">
        <h1 style="color:#3498db; font-size:36px; margin-bottom:25px; font-family: Impact;">👕 GARAGE</h1>
        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:15px; margin-bottom:30px;">`;
    Object.keys(skinKleuren).forEach(s => {
        const un = skinsUnlocked.includes(s);
        const isCurrent = huidigeSkin === s;
        h += `<div style="background:${un ? '#333' : '#111'}; padding:15px; border-radius:15px; border:2px solid ${isCurrent ? '#2ecc71' : (un ? '#444' : '#222')}; display:flex; flex-direction:column; align-items:center; gap:10px;">
            <div style="width:40px; height:40px; background-color:${'#' + skinKleuren[s].toString(16).padStart(6, '0')}; border-radius:8px; border:2px solid white;"></div>
            <span style="font-size:12px; font-weight: bold;">${s.toUpperCase()}</span>
            <button onclick="${un ? `setSkin('${s}')` : ''}" style="width:100%; padding:8px; border-radius:8px; border:none; background:${isCurrent ? '#2ecc71' : (un ? '#3498db' : '#222')}; color:white; cursor:${un ? 'pointer' : 'default'}; font-size:11px; font-weight:bold;">${isCurrent ? 'GEBRUIKT' : (un ? 'KIES' : '🔒')}</button>
        </div>`;
    });
    h += `</div><button onclick="sluitMenu()" style="background:#444; color:white; border:none; padding:12px 40px; border-radius:12px; cursor:pointer; font-weight:bold;">TERUG</button></div>`;
    overlay.innerHTML = h;
};

// --- CLAIM LOGICA ---
window.claimEventReward = () => {
    if (eventRewardKlaar) {
        if (eventLevel === 100 && !skinsUnlocked.includes(huidigeMaandNaam)) skinsUnlocked.push(huidigeMaandNaam);
        else geld += 500;
        eventLevel++; genereerMissie(true); updateUI(); sluitMenu();
    }
};

window.claimReward = () => {
    if (rewardKlaar) {
        if (actieveOpdracht.beloning.type === 'g') { geld += actieveOpdracht.beloning.w; totaalVerdiend += actieveOpdracht.beloning.w; }
        else { for(let i=0; i<actieveOpdracht.beloning.w; i++) { huidigMowerRadius += 0.1; huidigeSnelheid += 0.01; } }
        huidigLevel++; genereerMissie(false); updateUI(); sluitMenu();
    }
};

// --- MENU TRIGGERS (Met Percentage op de Balk) ---
eventBtn.onclick = () => {
    overlay.style.left = '0'; overlay.style.pointerEvents = 'auto';
    const v = Math.max(0, getStat(eventOpdracht.id) - eventOpdracht.start);
    const p = Math.min((v / eventOpdracht.d) * 100, 100).toFixed(1);
    const text = eventRewardKlaar ? "CLAIM NU" : "LOCKED";
    
    overlay.innerHTML = `<div style="background:#2c3e50; padding:40px; border:5px solid #9b59b6; border-radius:30px; text-align:center; width:500px;">
        <h1 style="color:#9b59b6; font-family: Impact;">EVENT</h1>
        <p style="font-weight: bold;">${eventOpdracht.t}</p>
        <div style="width:100%; height:35px; background:#333; border-radius:15px; margin:20px 0; border:2px solid white; overflow:hidden; position:relative;">
            <div style="width:${p}%; height:100%; background:#9b59b6; transition:0.3s;"></div>
            <div style="position:absolute; width:100%; top:0; left:0; line-height:35px; font-weight:900; color:white; text-shadow:1px 1px 2px black;">${p}%</div>
        </div>
        <button onclick="${eventRewardKlaar ? 'claimEventReward()' : ''}" style="${claimButtonStyle} background:${eventRewardKlaar ? '#2ecc71' : '#555'}; box-shadow:${eventRewardKlaar ? '0 4px 0 #27ae60' : 'none'};">${text}</button>
        <br><button onclick="sluitMenu()" style="margin-top:15px; background:none; color:white; border:none; cursor:pointer;">Annuleren</button>
    </div>`;
};

gpBtn.onclick = () => {
    overlay.style.left = '0'; overlay.style.pointerEvents = 'auto';
    const v = Math.max(0, getStat(actieveOpdracht.id) - actieveOpdracht.start);
    const p = Math.min((v / actieveOpdracht.d) * 100, 100).toFixed(1);
    const text = rewardKlaar ? "CLAIM NU" : "LOCKED";

    overlay.innerHTML = `<div style="background: linear-gradient(135deg, #2c3e50, #000); padding:50px; border:5px solid #f1c40f; border-radius:30px; text-align:center; width:500px;">
        <h1 style="color:#f1c40f; font-family: Impact;">GRASS PASS</h1>
        <p style="font-weight: bold;">${actieveOpdracht.t}</p>
        <div style="width:100%; height:40px; background:#333; border-radius:20px; margin:20px 0; border:2px solid white; overflow:hidden; position:relative;">
            <div style="width:${p}%; height:100%; background:#f1c40f; transition:0.3s;"></div>
            <div style="position:absolute; width:100%; top:0; left:0; line-height:40px; font-weight:900; color:white; text-shadow:1px 1px 2px black;">${p}%</div>
        </div>
        <button onclick="${rewardKlaar ? 'claimReward()' : ''}" style="${claimButtonStyle} background:${rewardKlaar ? '#2ecc71' : '#444'}; box-shadow:${rewardKlaar ? '0 4px 0 #27ae60' : 'none'};">${text}</button>
        <br><button onclick="sluitMenu()" style="margin-top:15px; background:none; color:white; border:none; cursor:pointer;">Annuleren</button>
    </div>`;
};

window.setSkin = (s) => { huidigeSkin = s; mower.material.color.set(skinKleuren[s]); openSkinMenu(); };
window.koop = (t) => {
    if (t === 'r' && geld >= prijsRadius) { geld -= prijsRadius; huidigMowerRadius += 0.3; prijsRadius *= 1.6; totaalUpgrades++; }
    if (t === 's' && geld >= prijsSnelheid) { geld -= prijsSnelheid; huidigeSnelheid += 0.02; prijsSnelheid *= 1.6; totaalUpgrades++; }
    if (t === 'w' && geld >= prijsWaarde) { geld -= prijsWaarde; grasWaarde += 0.01; prijsWaarde *= 1.7; totaalUpgrades++; }
    updateUI();
};

cheatBtn.onclick = () => {
    const code = prompt("Code:");
    if(code === "EVENT-EXPRESS") { eventLevel = 99; genereerMissie(true); }
    else if(code === "OG-kervelsoeps") { geld += 50000; totaalVerdiend += 50000; }
    else if(code === "!wannaBEop") { geld += 100000; totaalVerdiend += 100000; }
    else if(code === "YEAHman") { geld += 250000; totaalVerdiend += 250000; }
    updateUI();
};

const mower = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.5, 1.2), new THREE.MeshStandardMaterial({color: 0xff0000}));
scene.add(mower);
scene.add(new THREE.AmbientLight(0xffffff, 0.9));
const light = new THREE.DirectionalLight(0xffffff, 1); light.position.set(5, 15, 5); scene.add(light);
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
    if(keys['w']||keys['z']) mower.position.z -= huidigeSnelheid;
    if(keys['s']) mower.position.z += huidigeSnelheid;
    if(keys['a']||keys['q']) mower.position.x -= huidigeSnelheid;
    if(keys['d']) mower.position.x += huidigeSnelheid;
    grassArr.forEach(g => {
        if(g.visible && mower.position.distanceTo(g.position) < huidigMowerRadius) {
            g.visible = false; g.userData.cut = Date.now();
            geld += grasWaarde; totaalVerdiend += grasWaarde; totaalGemaaid++; 
            updateUI();
        }
        if(!g.visible && Date.now() - g.userData.cut > 8000) g.visible = true;
    });
    camera.position.set(mower.position.x, 15, mower.position.z + 15);
    camera.lookAt(mower.position);
    renderer.render(scene, camera);
}

genereerMissie(false); genereerMissie(true); updateUI(); animate();
