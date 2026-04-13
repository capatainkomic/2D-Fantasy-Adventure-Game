// Gère l'état global de la partie : timer, conditions de fin,
// restart, spawn de collectibles et détection du mouse shake.
// sketch.js délègue toute cette logique à GameManager.
class GameManager {

    static TIMER_DURATION  = 60 * 60 * 3; // 3 minutes à 60fps
    static SHAKE_THRESHOLD = 200;          // vitesse min pour détecter une secousse
    static SHAKE_COOLDOWN  = 40;           // frames entre deux spawns
    static COIN_SPAWN_MIN  = 3;
    static COIN_SPAWN_MAX  = 7;
    static MEAT_SPAWN_CHANCE = 0.2;
    static PLAYER_SPAWN_X  = 1600;
    static PLAYER_SPAWN_Y  = 1600;

    constructor({ player, enemies, sheeps, collectibles, obstacles,
                  gameMap, combatSystem, popupManager, infoPopup }) {
        this.player       = player;
        this.enemies      = enemies;
        this.sheeps       = sheeps;
        this.collectibles = collectibles;
        this.obstacles    = obstacles;
        this.gameMap      = gameMap;
        this.combatSystem = combatSystem;
        this.popupManager = popupManager;
        this.infoPopup    = infoPopup;

        this.timer    = GameManager.TIMER_DURATION;
        this.gameOver = false;

        this._prevMouseX        = 0;
        this._prevMouseY        = 0;
        this._shakeSpawnCooldown = 0;
    }

    get isPaused() {
        return this.gameOver || this.infoPopup?.active;
    }

    // ─── Appelé à chaque frame dans draw() ───────────────────────

    update() {
        if (this.isPaused) return;

        this.timer--;
        this._checkEndConditions();
        this._detectMouseShake();
    }

    // ─── Conditions de fin ────────────────────────────────────────

    _checkEndConditions() {
        const aliveEnemies = this.enemies.filter(e => !e.isDead());
        const killed       = this.enemies.length - aliveEnemies.length;

        if (aliveEnemies.length === 0) {
            this._triggerWin(killed);
        } else if (this.player.isDead() || this.timer <= 0) {
            this._triggerGameOver(killed);
        }
    }

    _triggerWin(killed) {
        this.gameOver = true;
        this.popupManager.showWin(
            this.player.coins, killed, this.enemies.length,
            this.player.hp, this.timer
        );
        soundManager.playWin();
    }

    _triggerGameOver(killed) {
        this.gameOver = true;
        this.popupManager.showGameOver(
            this.player.coins, killed, this.enemies.length
        );
        soundManager.playGameOver();
    }

    // ─── Restart ──────────────────────────────────────────────────

    restart() {
        this.timer    = GameManager.TIMER_DURATION;
        this.gameOver = false;
        this.collectibles.length = 0;

        this.player.reset(GameManager.PLAYER_SPAWN_X, GameManager.PLAYER_SPAWN_Y);

        const paths = this.gameMap.getAllPatrolPaths();
        for (let i = 0; i < this.enemies.length; i++) {
            const spawnPos = paths[i]?.[0] ?? createVector(0, 0);
            this.enemies[i].reset(spawnPos.x, spawnPos.y);
        }

        this.popupManager.active = false;
        soundManager.startMusic();
    }

    // ─── Spawn collectibles ───────────────────────────────────────

    spawnCollectibles(x, y) {
        const coinCount = floor(random(GameManager.COIN_SPAWN_MIN, GameManager.COIN_SPAWN_MAX));
        for (let i = 0; i < coinCount; i++) this.collectibles.push(new Coin(x, y));
        if (random() < GameManager.MEAT_SPAWN_CHANCE) this.collectibles.push(new Meat(x, y));
        this.collectibles.push(new StarBurstParticle(x, y, 256));
        soundManager.playSparkle();
    }

    // ─── Détection mouse shake ────────────────────────────────────

    _detectMouseShake() {
        if (this._shakeSpawnCooldown > 0) this._shakeSpawnCooldown--;

        const dx    = mouseX - this._prevMouseX;
        const dy    = mouseY - this._prevMouseY;
        const speed = sqrt(dx * dx + dy * dy);

        if (speed > GameManager.SHAKE_THRESHOLD && this._shakeSpawnCooldown <= 0) {
            const worldPos = screenToWorld(mouseX, mouseY);
            this.spawnCollectibles(worldPos.x, worldPos.y);
            this.combatSystem.particles.push(new StarBurstParticle(worldPos.x, worldPos.y, 200));
            this._shakeSpawnCooldown = GameManager.SHAKE_COOLDOWN;
        }

        this._prevMouseX = mouseX;
        this._prevMouseY = mouseY;
    }

    // ─── Rendu du timer ──────────────────────────────────────────

    drawTimer(w) {
        if (this.isPaused) return;

        const total    = floor(this.timer / 60);
        const minutes  = floor(total / 60);
        const seconds  = total % 60;
        const txt      = `${minutes}:${String(seconds).padStart(2, '0')}`;
        const isUrgent = this.timer < 60 * 30;

        push();
        textFont(PopupManager.imgs.font || 'serif');
        textSize(32);
        textAlign(CENTER, TOP);
        noStroke();
        fill(0, 0, 0, 150);
        text(txt, w / 2 + 2, 16);
        fill(isUrgent ? color(255, 60, 60) : color(255, 230, 100));
        text(txt, w / 2, 14);
        pop();
    }
}