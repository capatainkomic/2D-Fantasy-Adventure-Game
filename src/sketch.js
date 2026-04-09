const GAME_W = 1580;
const GAME_H = 800;
const MAP_W  = 3200;
const MAP_H  = 3200;

let gameMap, player, enemy, combatSystem, camera, hud;
let obstacles = []; // global — utilisé par Player._applyMovement et Enemy.executePatrol/Pursue

// ─── Détection agitation souris ───
let prevMouseX = 0, prevMouseY = 0;
let shakeSpawnCooldown = 0;
const SHAKE_THRESHOLD  = 200;  // vitesse min pour détecter une secousse
const SHAKE_COOLDOWN   = 40;  // frames entre chaque spawn (évite le flood)

function preload() {
    gameMap = new GameMap();
    gameMap.preload();

    player = new Player(1600, 1600);
    player.preload();

    enemy = new Enemy(1600, 1700, gameMap, player);
    enemy.preload();

    DustParticle.preload();
    Obstacle.preload();
    StarBurstParticle.preload();
    Coin.preload();
    Meat.preload();

    hud = new HUD();
    hud.preload();
}

function setup() {
    createCanvas(GAME_W, GAME_H);

    gameMap.parse();

    // Remplir le tableau global obstacles AVANT que les entités s'updatendent
    obstacles = gameMap.getObstacles();

    let path = gameMap.getPatrolPath(0);
    enemy.patrolPath = path;
    if (path.length > 0) enemy.pos = path[0].copy();

    combatSystem = new CombatSystem();

    camera = new Camera(MAP_W, MAP_H);
    camera.x = player.pos.x - GAME_W / 2;
    camera.y = player.pos.y - GAME_H / 2;

    //hud.setup(GAME_W, GAME_H);

    // Délai pour s'assurer que le canvas est dans le DOM
    setTimeout(updateCanvasPosition, 100);

    frameRate(60);
}

function draw() {
    background(20, 15, 10);

    camera.update(player, GAME_W, GAME_H);

    camera.begin();
    gameMap.drawBackground();

    // Obstacles — animés, dessinés avant les entités
    for (let obs of obstacles) { obs.update(); obs.show(); }

    let entities = [player, enemy];
    entities.sort((a, b) => a.pos.y - b.pos.y);
    for (let entity of entities) entity.update();
    combatSystem.update(player, enemy);
    for (let entity of entities) entity.show();
    combatSystem.show(player, enemy);
    camera.end();

    hud.update();
    hud.show(player, [enemy], GAME_W, GAME_H);

    // ─── Détection agitation souris ───
    _detectMouseShake();
}

function mousePressed() {
    if (mouseButton === LEFT) player.attack();
}

// ─── Détection agitation souris ───
function _detectMouseShake() {
    if (shakeSpawnCooldown > 0) shakeSpawnCooldown--;

    let dx = mouseX - prevMouseX;
    let dy = mouseY - prevMouseY;
    let speed = sqrt(dx * dx + dy * dy);

    if (speed > SHAKE_THRESHOLD && shakeSpawnCooldown <= 0) {
        let worldPos = screenToWorld(mouseX, mouseY);

        // Spawn 5 pièces
        for (let i = 0; i < 5; i++) {
            combatSystem.collectibles.push(new Coin(worldPos.x, worldPos.y));
        }

        // 20% de chance de spawner une viande
        if (random() < 0.2) {
            combatSystem.collectibles.push(new Meat(worldPos.x, worldPos.y));
        }

        // Particule StarBurst à la position souris
        combatSystem.particles.push(
            new StarBurstParticle(worldPos.x, worldPos.y, 200)
        );

        shakeSpawnCooldown = SHAKE_COOLDOWN;
    }

    prevMouseX = mouseX;
    prevMouseY = mouseY;
}

// ─── Position du canvas → variables CSS pour les nuages ───
function updateCanvasPosition() {
    let rect = document.querySelector('canvas').getBoundingClientRect();
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