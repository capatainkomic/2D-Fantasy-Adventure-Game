// =============================================
// CombatSystem — gestion du combat + collectibles
// =============================================
class CombatSystem {

    constructor() {
        this.particles    = []; // DustParticle actives
        this.collectibles = []; // Coin + Meat actifs
    }

    // =============================================
    // UPDATE
    // =============================================
    update(player, enemy) {
        this.checkPlayerHitsEnemy(player, enemy);
        this.checkEnemyHitsPlayer(player, enemy);
        this.updateParticles();
        this.updateCollectibles(player);
    }

    // =============================================
    // JOUEUR → ENNEMI
    // =============================================
    checkPlayerHitsEnemy(player, enemy) {
        if (!player.isSlashActive())    return;
        if (enemy.isDead())             return;
        if (enemy.invincibleTimer > 0)  return;

        let playerHitbox = this.getAttackHitbox(player);
        let enemyHurtbox = this.getHurtbox(enemy);

        if (this.aabbOverlap(playerHitbox, enemyHurtbox)) {
            enemy.takeDamage(5);
            if (enemy.isDead()) {
                this.spawnDeathParticle(enemy);
                //this.spawnCollectibles(enemy);
            }
        }
    }

    // =============================================
    // ENNEMI → JOUEUR
    // =============================================
    checkEnemyHitsPlayer(player, enemy) {
        if (enemy.state !== "attack")   return;
        if (enemy.isDead())             return;
        if (player.invincibleTimer > 0) return;

        let enemyHitbox   = this.getAttackHitbox(enemy);
        let playerHurtbox = this.getHurtbox(player);

        if (this.aabbOverlap(enemyHitbox, playerHurtbox)) {
            player.takeDamage(5);
        }
    }

    // =============================================
    // SPAWN COLLECTIBLES à la mort de l'ennemi
    // =============================================
    spawnCollectibles(enemy) {
        // Une seule particule pour tout le groupe
        //this.particles.push(new StarBurstParticle(enemy.pos.x, enemy.pos.y + 5, 128));
        
        // Collectibles
        for (let i = 0; i < floor(random(2, 7)); i++) {
            this.collectibles.push(new Coin(enemy.pos.x, enemy.pos.y));
        }
        this.collectibles.push(new Meat(enemy.pos.x, enemy.pos.y));
    }

    // =============================================
    // UPDATE COLLECTIBLES
    // =============================================
    updateCollectibles(player) {
        for (let c of this.collectibles) c.update(player);
        // Supprimer les collectés
        this.collectibles = this.collectibles.filter(c => !c.collected);
    }

    // =============================================
    // PARTICULE DE MORT
    // =============================================
    spawnDeathParticle(entity) {
        let p = new DustParticle(entity.pos.x, entity.pos.y, entity.displaySize);
        this.particles.push(p);
    }

    updateParticles() {
        for (let p of this.particles) p.update();
        this.particles = this.particles.filter(p => !p.done);
    }

    // =============================================
    // HURTBOX
    // =============================================
    getHurtbox(entity) {
        let size = entity.displaySize * 0.3;
        return {
            x: entity.pos.x - size / 2,
            y: entity.pos.y - size / 2,
            w: size, h: size
        };
    }

    // =============================================
    // HITBOX D'ATTAQUE
    // =============================================
    getAttackHitbox(entity) {
        let w    = entity.displaySize * 0.4;
        let h    = entity.displaySize * 0.3;
        let offX = entity.facingRight
            ?  entity.displaySize * 0.2
            : -entity.displaySize * 0.2 - w;
        return {
            x: entity.pos.x + offX,
            y: entity.pos.y - h / 2,
            w: w, h: h
        };
    }

    // =============================================
    // AABB
    // =============================================
    aabbOverlap(a, b) {
        return (
            a.x       < b.x + b.w &&
            a.x + a.w > b.x       &&
            a.y       < b.y + b.h &&
            a.y + a.h > b.y
        );
    }

    // =============================================
    // SHOW
    // =============================================
    show(player, enemy) {
        // Collectibles
        for (let c of this.collectibles) c.show();

        // Particules de mort
        for (let p of this.particles) p.show();

        // Debug hitbox
        if (Vehicle.debug) this.debugDrawHitboxes(player, enemy);
    }

    debugDrawHitboxes(player, enemy) {
        push();
        noFill(); strokeWeight(1);

        stroke(0, 100, 255, 200);
        let ph = this.getHurtbox(player);
        rect(ph.x, ph.y, ph.w, ph.h);

        if (player.isSlashActive()) {
            stroke(0, 255, 0, 200);
            let pa = this.getAttackHitbox(player);
            rect(pa.x, pa.y, pa.w, pa.h);
        }

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

        pop();
    }
}