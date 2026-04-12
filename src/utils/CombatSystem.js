// =============================================
// CombatSystem — gestion du combat + collectibles
// Gère un tableau d'ennemis
// =============================================
class CombatSystem {

    constructor() {
        this.particles = []; // DustParticle uniquement
    }

    update(player, enemies) {
        for (let enemy of enemies) {
            this.checkPlayerHitsEnemy(player, enemy);
            this.checkEnemyHitsPlayer(player, enemy);
        }
        this.updateParticles();
    }

    checkPlayerHitsEnemy(player, enemy) {
        if (!player.isSlashActive())    return;
        if (enemy.isDead())             return;
        if (enemy.invincibleTimer > 0)  return;

        if (this.aabbOverlap(this.getAttackHitbox(player), this.getHurtbox(enemy))) {
            enemy.takeDamage(5);
            if (enemy.isDead()) {
                this.spawnDeathParticle(enemy);
                soundManager.playEnemyDeath();
            }
        }
    }

    checkEnemyHitsPlayer(player, enemy) {
        if (enemy.state !== "attack")   return;
        if (enemy.isDead())             return;
        if (player.invincibleTimer > 0) return;

        if (this.aabbOverlap(this.getAttackHitbox(enemy), this.getHurtbox(player))) {
            player.takeDamage(5);
        }
    }

    spawnDeathParticle(entity) {
        this.particles.push(new DustParticle(entity.pos.x, entity.pos.y, entity.displaySize));
    }

    updateParticles() {
        for (let p of this.particles) p.update();
        this.particles = this.particles.filter(p => !p.done);
    }

    getHurtbox(entity) {
        let size = entity.displaySize * 0.3;
        return { x: entity.pos.x - size/2, y: entity.pos.y - size/2, w: size, h: size };
    }

    getAttackHitbox(entity) {
        let w    = entity.displaySize * 0.4;
        let h    = entity.displaySize * 0.3;
        let offX = entity.facingRight
            ?  entity.displaySize * 0.2
            : -entity.displaySize * 0.2 - w;
        return { x: entity.pos.x + offX, y: entity.pos.y - h/2, w: w, h: h };
    }

    aabbOverlap(a, b) {
        return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
    }

    show(player, enemies) {
        for (let p of this.particles) p.show();
        if (Vehicle.debug) this.debugDrawHitboxes(player, enemies);
    }

    debugDrawHitboxes(player, enemies) {
        push(); noFill(); strokeWeight(1);

        stroke(0, 100, 255, 200);
        let ph = this.getHurtbox(player);
        rect(ph.x, ph.y, ph.w, ph.h);

        if (player.isSlashActive()) {
            stroke(0, 255, 0, 200);
            let pa = this.getAttackHitbox(player);
            rect(pa.x, pa.y, pa.w, pa.h);
        }

        for (let enemy of enemies) {
            if (!enemy.isDead()) {
                stroke(255, 0, 0, 200);
                let eh = this.getHurtbox(enemy);
                rect(eh.x, eh.y, eh.w, eh.h);
                if (enemy.state === "attack") {
                    stroke(255, 165, 0, 200);
                    let ea = this.getAttackHitbox(enemy);
                    rect(ea.x, ea.y, ea.w, ea.h);
                }
            }
        }
        pop();
    }
}