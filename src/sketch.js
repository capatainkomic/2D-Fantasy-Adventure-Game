const GAME_W = 1580;
const GAME_H = 800;
const MAP_W  = 3200;
const MAP_H  = 3200;

let gameMap, player, combatSystem, camera, hud, gameManager, debugPanel;
let enemies      = [];
let obstacles    = [];
let collectibles = [];
let sheeps       = [];
let popupManager = null;
let infoPopup    = null;

function preload() {
    loadImage('./assets/ui/Loader/loading.gif');

    gameMap = new GameMap();
    gameMap.preload();

    player = new Player(1600, 1600);
    player.preload();

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
    soundManager.preload();
}

function setup() {
    const cnv = createCanvas(GAME_W, GAME_H);
    cnv.parent('game-wrapper');
    cnv.elt.getContext('2d', {
        willReadFrequently: true,
        alpha:              true,
        colorSpace:         'srgb',
    });

    updateCanvasPosition();

    gameMap.parse();
    obstacles = gameMap.getObstacles();

    for (const path of gameMap.getAllPatrolPaths()) {
        const e = new Enemy(0, 0);
        e.patrolPath = path;
        if (path.length > 0) e.pos.set(path[0].x, path[0].y);
        enemies.push(e);
    }

    combatSystem = new CombatSystem();

    const sheepGroups = [
        { cx: 600,  cy: 600,  count: 12 },
        { cx: 2700, cy: 800,  count: 10 },
        { cx: 800,  cy: 2600, count: 13 },
    ];
    for (const group of sheepGroups) {
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

    gameManager = new GameManager({
        player, enemies, sheeps, collectibles, obstacles,
        gameMap, combatSystem, popupManager, infoPopup,
    });

    // Branché après gameManager — CombatSystem spawne les collectibles via GameManager
    combatSystem.onEnemyDeath = (x, y) => gameManager.spawnCollectibles(x, y);

    debugPanel = new DebugPanel({ player, enemies, sheeps, obstacles });

    document.getElementById('game-wrapper').classList.add('ready');
    soundManager.startMusic();
    frameRate(60);
}

function draw() {
    background(20, 15, 10);

    camera.update(player, GAME_W, GAME_H);
    camera.begin();

    gameMap.drawBackground();
    for (const obs of obstacles) { obs.update(); obs.show(); }

    if (!gameManager.isPaused) {
        gameManager.update();

        const threats = [player, ...enemies.filter(e => !e.isDead())];
        for (const sheep of sheeps) sheep.update(sheeps, threats);

        player.update();
        for (const enemy of enemies) {
            enemy.update(obstacles, player.pos, player.vel, player.isDead());
        }

        combatSystem.update(player, enemies);

        const allEntities = [player, ...enemies, ...sheeps];
        allEntities.sort((a, b) => a.pos.y - b.pos.y);
        for (const entity of allEntities) entity.show();

        combatSystem.show(player, enemies);

        for (const c of collectibles) c.update(player);
        for (const c of collectibles) c.show();
        // Mutation en place — préserve la référence partagée avec GameManager
        collectibles.splice(0, collectibles.length, ...collectibles.filter(c => !c.collected));

    } else {
        const allEntities = [player, ...enemies, ...sheeps];
        allEntities.sort((a, b) => a.pos.y - b.pos.y);
        for (const entity of allEntities) entity.show();
        combatSystem.show(player, enemies);
        for (const c of collectibles) c.show();
    }

    camera.end();

    // Debug behaviors — dessiné dans l'espace monde, après camera.end() car on veut les coords écran
    if (debugPanel?.visible) {
        camera.begin();
        const allEntitiesForDebug = [player, ...enemies, ...sheeps];
        debugPanel.drawDebug(allEntitiesForDebug, player, enemies);
        camera.end();
    }

    hud.update();
    hud.show(player, enemies, GAME_W, GAME_H);

    gameManager.drawTimer(GAME_W);

    if (infoPopup) infoPopup.show(GAME_W, GAME_H);
    popupManager.update();
    popupManager.show(GAME_W, GAME_H);
}

function mousePressed() {
    if (mouseButton !== LEFT) return;

    if (infoPopup?.active) {
        const cx = GAME_W / 2 - infoPopup.swordW * 0.4;
        const bx = cx - infoPopup.bw / 2;
        const by = GAME_H / 2 - infoPopup.bh / 2;
        infoPopup.handleClick(mouseX, mouseY, bx, by);
        return;
    }

    if (hud?.isParamIconClicked(mouseX, mouseY)) {
        hud.toggleParamPanel();
        return;
    }

    if (hud?.isInfoIconClicked(mouseX, mouseY)) {
        infoPopup.show_popup();
        return;
    }

    if (popupManager.active) {
        popupManager.handlePress(mouseX, mouseY);
        if (popupManager.handleClick(mouseX, mouseY)) gameManager.restart();
        return;
    }

    player.attack();
}

function mouseReleased() {
    popupManager?.handleRelease();
}

// Écoute globale sur window — fonctionne même si le canvas n'a pas le focus.
// On n'utilise pas keyPressed() de p5 car il nécessite que le canvas ait le focus.
window.addEventListener('keydown', (e) => {
    if (e.key === 'd' || e.key === 'D') debugPanel?.toggle();
});

function windowResized() {
    updateCanvasPosition();
}

function screenToWorld(sx, sy) {
    return createVector(sx + camera.x, sy + camera.y);
}

function updateCanvasPosition() {
    const el   = document.getElementById('game-wrapper') || document.querySelector('canvas');
    const rect = el.getBoundingClientRect();
    const root = document.documentElement.style;
    root.setProperty('--canvas-left', rect.left   + 'px');
    root.setProperty('--canvas-top',  rect.top    + 'px');
    root.setProperty('--canvas-w',    rect.width  + 'px');
    root.setProperty('--canvas-h',    rect.height + 'px');
}