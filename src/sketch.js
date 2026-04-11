const GAME_W = 1580;
const GAME_H = 800;
const MAP_W  = 3200;
const MAP_H  = 3200;

let gameMap, player, combatSystem, camera, hud;
let enemies      = [];
let obstacles    = [];
let collectibles = [];
let sheeps       = [];

// ─── Timer + état du jeu ───
const TIMER_DURATION = 60 * 60 * 3; // 3 minutes à 60fps
let gameTimer    = TIMER_DURATION;
let gameOver     = false;
let popupManager = null;
let infoPopup    = null;

// ─── Détection agitation souris ───
let prevMouseX = 0, prevMouseY = 0;
let shakeSpawnCooldown = 0;
const SHAKE_THRESHOLD  = 200;  // vitesse min pour détecter une secousse
const SHAKE_COOLDOWN   = 40;  // frames entre chaque spawn (évite le flood)

let loadingGif;

function preload() {
    loadingGif = loadImage('../assets/ui/Loader/loading.gif');

    gameMap = new GameMap();
    gameMap.preload();

    player = new Player(1600, 1600);
    player.preload();

    // Images ennemis — chargées UNE SEULE FOIS, partagées entre toutes les instances
    Enemy.preload();

    DustParticle.preload();
    Obstacle.preload();
    Sheep.preload();
    StarBurstParticle.preload();
    Coin.preload();
    Meat.preload();

    hud = new HUD();
    hud.preload();

    PopupManager.preload();
    InfoPopup.preload();
}

function setup() {
    let cnv = createCanvas(GAME_W, GAME_H);
    cnv.parent('game-wrapper');

    // On applique les réglages dont parle ton texte :
    let contextSettings = {
      willReadFrequently: true, // Force le mode CPU (Software) pour les lectures rapides
      alpha: true,              // Autorise la transparence (utile pour ton logo)
      colorSpace: 'srgb'        // Définit l'espace de couleur standard
    };

    // On injecte ces réglages dans le contexte 2D du canvas
    cnv.elt.getContext('2d', contextSettings);

    // Immédiat — positionne les nuages dès le loading
    updateCanvasPosition();

    gameMap.parse();
    obstacles = gameMap.getObstacles();

    let paths = gameMap.getAllPatrolPaths();
    for (let i = 0; i < paths.length; i++) {
        let e = new Enemy(0, 0, gameMap, player);
        e.patrolPath = paths[i];
        if (paths[i].length > 0) e.pos = paths[i][0].copy();
        enemies.push(e);
    }

    combatSystem = new CombatSystem();

    // ─── Spawn moutons — 3 groupes
    let sheepGroups = [
        { cx: 600,  cy: 600,  count: 12 },
        { cx: 2700, cy: 800,  count: 10 },
        { cx: 800,  cy: 2600, count: 13 },
    ];
    for (let group of sheepGroups) {
        for (let i = 0; i < group.count; i++) {
            sheeps.push(new Sheep(
                group.cx + random(-120, 120),
                group.cy + random(-120, 120)
            ));
        }
    }

    camera = new Camera(MAP_W, MAP_H);
    camera.x = player.pos.x - GAME_W / 2;
    camera.y = player.pos.y - GAME_H / 2;
    

    popupManager = new PopupManager();
    infoPopup    = new InfoPopup();

    // Swap loader → canvas
    document.getElementById('game-wrapper').classList.add('ready');

    frameRate(60);
}

function draw() {
    background(20, 15, 10);

    camera.update(player, GAME_W, GAME_H);

    camera.begin();
    gameMap.drawBackground();

    for (let obs of obstacles) { obs.update(); obs.show(); }

    // ─── Jeu actif seulement si pas game over et pas info popup ───
    if (!gameOver && (!infoPopup || !infoPopup.active)) {
        // Timer
        gameTimer--;

        let threats = [player, ...enemies.filter(e => !e.isDead())];
        for (let s of sheeps) s.update(sheeps, threats);

        let entities = [player, ...enemies];
        entities.sort((a, b) => a.pos.y - b.pos.y);
        for (let entity of entities) entity.update();

        combatSystem.update(player, enemies);

        let allEntities = [player, ...enemies, ...sheeps];
        allEntities.sort((a, b) => a.pos.y - b.pos.y);
        for (let entity of allEntities) entity.show();
        combatSystem.show(player, enemies);

        for (let c of collectibles) c.update(player);
        for (let c of collectibles) c.show();
        collectibles = collectibles.filter(c => !c.collected);

        // ─── Conditions de fin ───
        let aliveEnemies = enemies.filter(e => !e.isDead());
        let killed       = enemies.length - aliveEnemies.length;

        if (aliveEnemies.length === 0) {
            // WIN — tous les ennemis éliminés
            gameOver = true;
            popupManager.showWin(
                player.coins, killed, enemies.length,
                player.hp, gameTimer
            );
        } else if (player.isDead() || gameTimer <= 0) {
            // GAME OVER — joueur mort ou temps écoulé
            gameOver = true;
            popupManager.showGameOver(player.coins, killed, enemies.length);
            
        }
    } else {
        // Jeu arrêté — on affiche juste les entités figées
        let allEntities = [player, ...enemies, ...sheeps];
        allEntities.sort((a, b) => a.pos.y - b.pos.y);
        for (let entity of allEntities) entity.show();
        combatSystem.show(player, enemies);
        for (let c of collectibles) c.show();
    }

    camera.end();

    hud.update();
    hud.show(player, enemies, GAME_W, GAME_H);

    // ─── Timer ───
    if (!gameOver && (!infoPopup || !infoPopup.active)) _drawTimer(GAME_W, GAME_H);

    // ─── Popups ───
    if (infoPopup) infoPopup.show(GAME_W, GAME_H);
    popupManager.update();
    popupManager.show(GAME_W, GAME_H);

    if (!gameOver && (!infoPopup || !infoPopup.active)) _detectMouseShake();
}

function mousePressed() {
    if (mouseButton === LEFT) {

        // Info popup — gestion des tabs et bouton resume
        if (infoPopup && infoPopup.active) {
            let cx = GAME_W / 2 - infoPopup.swordW * 0.4;
            let bx = cx - infoPopup.bw / 2;
            let by = GAME_H / 2 - infoPopup.bh / 2;
            infoPopup.handleClick(mouseX, mouseY, bx, by);
            return;
        }

        // Clic sur l'icône info
        if (hud && hud.isInfoIconClicked(mouseX, mouseY)) {
            infoPopup.show_popup();
            return;
        }

        // Win/GameOver popup
        if (popupManager.active) {
            popupManager.handlePress(mouseX, mouseY);
            if (popupManager.handleClick(mouseX, mouseY)) {
                _restartGame();
            }
            return;
        }

        player.attack();
    }
}

function mouseReleased() {
    if (popupManager) popupManager.handleRelease();
}

// ─── Timer affiché en haut au centre ───
function _drawTimer(w, h) {
    let total = floor(gameTimer / 60);
    let m     = floor(total / 60);
    let s     = total % 60;
    let txt   = `${m}:${String(s).padStart(2, '0')}`;

    // Couleur rouge si moins de 30 secondes
    let isUrgent = gameTimer < 60 * 30;

    push();
    textFont(PopupManager.imgs.font || 'serif');
    textSize(32);
    textAlign(CENTER, TOP);
    noStroke();

    // Ombre
    fill(0, 0, 0, 150);
    text(txt, w / 2 + 2, 16);

    fill(isUrgent ? color(255, 60, 60) : color(255, 230, 100));
    text(txt, w / 2, 14);
    pop();
}

// ─── Restart ───
function _restartGame() {
    gameTimer  = TIMER_DURATION;
    gameOver   = false;
    collectibles = [];

    // Reset player
    player.hp    = player.maxHp;
    player.coins = 0;
    player.pos   = createVector(1600, 1600);
    player.vel   = createVector(0, 0);
    player.state = "idle";

    // Reset ennemis
    let paths = gameMap.getAllPatrolPaths();
    for (let i = 0; i < enemies.length; i++) {
        enemies[i].hp    = enemies[i].maxHp;
        enemies[i].state = "patrol";
        enemies[i].vel   = createVector(0, 0);
        if (paths[i] && paths[i].length > 0) {
            enemies[i].pos = paths[i][0].copy();
        }
    }

    popupManager.active = false;
}

// ─── Spawn collectibles —
function spawnCollectibles(x, y) {
    let coinCount = floor(random(3, 7));
    for (let i = 0; i < coinCount; i++) collectibles.push(new Coin(x, y));
    if (random() < 0.2) collectibles.push(new Meat(x, y));
    collectibles.push(new StarBurstParticle(x, y, 256)); // effet visuel
}

// ─── Détection agitation souris ───
function _detectMouseShake() {
    if (shakeSpawnCooldown > 0) shakeSpawnCooldown--;

    let dx = mouseX - prevMouseX;
    let dy = mouseY - prevMouseY;
    let speed = sqrt(dx * dx + dy * dy);

    if (speed > SHAKE_THRESHOLD && shakeSpawnCooldown <= 0) {
        let worldPos = screenToWorld(mouseX, mouseY);

        spawnCollectibles(worldPos.x, worldPos.y);

        // StarBurst géré séparément — pas un collectible
        combatSystem.particles.push(new StarBurstParticle(worldPos.x, worldPos.y, 200));

        shakeSpawnCooldown = SHAKE_COOLDOWN;
    }

    prevMouseX = mouseX;
    prevMouseY = mouseY;
}

// ─── Position du canvas → variables CSS pour les nuages ───
function updateCanvasPosition() {
    // Utilise #game-wrapper car le canvas peut être display:none pendant le loading
    let el   = document.getElementById('game-wrapper') || document.querySelector('canvas');
    let rect = el.getBoundingClientRect();
    let root = document.documentElement.style;
    root.setProperty('--canvas-left', rect.left   + 'px');
    root.setProperty('--canvas-top',  rect.top    + 'px');
    root.setProperty('--canvas-w',    rect.width  + 'px');
    root.setProperty('--canvas-h',    rect.height + 'px');
}

function windowResized() {
    updateCanvasPosition();
}

function screenToWorld(sx, sy) {
    return createVector(sx + camera.x, sy + camera.y);
}