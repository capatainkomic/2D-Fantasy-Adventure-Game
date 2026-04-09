class Enemy extends Vehicle {

    // =============================================
    // ÉTATS POSSIBLES
    // patrol   → suit le chemin de patrouille
    // pursue   → poursuit le joueur
    // attack   → exécute un coup
    // cooldown → attend entre deux attaques
    // =============================================

    constructor(x, y, gameMap, player) {
        super(x, y);

        // --- Mouvement ---
        this.maxSpeed = 2;
        this.maxForce = 0.15;
        this.r        = 32;

        // --- Affichage ---
        this.displaySize = 256;

        // --- Références externes ---
        this.gameMap = gameMap;
        this.player  = player;

        // --- Poids des forces (réglables via DebugPanel) ---
        this.weightArrive = 1.0;
        this.weightPursue = 1.0;
        this.weightAvoid  = 5.0;

        // --- Patrouille ---
        this.patrolPath         = [];
        this.patrolArrivalRange = 50;

        // --- Rayons de perception ---
        this.attackRange  = 120; // distance → déclenche une attaque
        this.pursuitRange = 300; // distance → déclenche la poursuite
        this.leashRange   = 400; // distance → abandonne et retourne en patrouille

        // --- Attaque ---
        this.attackTimer      = 0;   // décompte de la durée du coup courant
        this.attackDuration   = 9;   // durée d'un coup : 3 frames × frameDelay 3
        this.cooldownTimer    = 0;   // décompte du temps entre deux attaques
        this.cooldownDuration = 180; // 2 secondes à 60fps

        // --- Machine à états ---
        this.state = "patrol";

         // --- Combat ---
        this.hp              = 20;
        this.maxHp           = 20;
        this.isHurt          = false;
        this.hurtTimer       = 0;
        this.hurtDuration    = 20;  // frames du flash rouge
        this.invincibleTimer    = 0;
        this.invincibleDuration = 30; // frames d'invincibilité

        // --- Animations (spritesheet une ligne par animation) ---
        this.animations = {
            idle:             { img: null, frames: 12, frameW: 3840/12, frameH: 320 },
            run:              { img: null, frames: 6,  frameW: 1920/6,  frameH: 320 },
            attack_right:     { img: null, frames: 3,  frameW: 960/3,   frameH: 320 },
            attack_up_right:  { img: null, frames: 3,  frameW: 960/3,   frameH: 320 },
            attack_up:        { img: null, frames: 3,  frameW: 960/3,   frameH: 320 },
            attack_down:      { img: null, frames: 3,  frameW: 960/3,   frameH: 320 },
            attack_down_right:{ img: null, frames: 3,  frameW: 960/3,   frameH: 320 },
        };

        this.currentAnim  = "idle";
        this.animFrame    = 0;
        this.animDelay    = 3; // frames p5 entre chaque image
        this.animTimer    = 0;
        this.facingRight  = true; // true = droite, false = gauche (flip)
    }

    // =============================================
    // PRELOAD — charger les spritesheets
    // =============================================
    preload() {
        const dir = "../assets/characters/Lancer";
        this.animations.idle.img             = loadImage(`${dir}/Lancer_Idle.png`);
        this.animations.run.img              = loadImage(`${dir}/Lancer_Run.png`);
        this.animations.attack_right.img     = loadImage(`${dir}/Lancer_Right_Attack.png`);
        this.animations.attack_up_right.img  = loadImage(`${dir}/Lancer_UpRight_Attack.png`);
        this.animations.attack_up.img        = loadImage(`${dir}/Lancer_Up_Attack.png`);
        this.animations.attack_down.img      = loadImage(`${dir}/Lancer_Down_Attack.png`);
        this.animations.attack_down_right.img= loadImage(`${dir}/Lancer_DownRight_Attack.png`);
    }

    // =============================================
    // UPDATE — Architecture 3 couches (CONSTRAINTS.md)
    // Couche 1 : Action Selection → updateState()
    // Couche 2 : Steering         → executeState()
    // Couche 3 : Locomotion       → super.update()
    // =============================================
    update() {
        if (this.isDead()) return; // ne plus updater si mort
 
        if (this.hurtTimer > 0)       this.hurtTimer--;
        if (this.invincibleTimer > 0) this.invincibleTimer--;
        if (this.hurtTimer <= 0)      this.isHurt = false;

        this.updateState();
        this.executeState();
        super.update();
        this.updateAnimation();

        // Direction du regard uniquement quand l'ennemi se déplace
        if (this.state === "patrol" || this.state === "pursue") {
            if (this.vel.x !== 0) {
                this.facingRight = this.vel.x > 0;
            }
        }
    }

    // =============================================
    // COUCHE 1 — Mise à jour de l'état
    // Gère UNIQUEMENT les transitions entre états
    // =============================================
    updateState() {
        // Si le joueur est mort → retour en patrouille, on arrête tout
        if (this.player.isDead()) {
            this.state = "patrol";
            return;
        }

        const distToPlayer = this.pos.dist(this.player.pos);

        switch (this.state) {

            case "patrol":
                if (distToPlayer < this.pursuitRange) {
                    this.state = "pursue";
                }
                break;

            case "pursue":
                if (distToPlayer > this.leashRange) {
                    this.state = "patrol";
                } else if (distToPlayer < this.attackRange) {
                    this.startAttack();
                }
                break;

            case "attack":
                // La fin de l'attaque est gérée dans executeAttack()
                break;

            case "cooldown":
                if (this.cooldownTimer <= 0) {
                    if (distToPlayer > this.leashRange) {
                        // Joueur trop loin → abandon
                        this.state = "patrol";
                        this.cooldownTimer = 0;
                    } else if (distToPlayer >= this.attackRange) {
                        // Joueur s'éloigne → poursuite
                        this.state = "pursue";
                        this.cooldownTimer = 0;
                    } else {
                        // Joueur encore à portée → attaque
                        this.startAttack();
                    }
                }

                break;
        }
    }

    // =============================================
    // COUCHE 2 — Exécution du comportement courant
    // Chaque état applique ses forces via applyForce()
    // =============================================
    executeState() {
        switch (this.state) {
            case "patrol":   this.executePatrol();   break;
            case "pursue":   this.executePursue();   break;
            case "attack":   this.executeAttack();   break;
            case "cooldown": this.executeCooldown(); break;
        }
    }

    executePatrol() {
        let followForce = this.followPath(this.patrolPath, this.patrolArrivalRange);
        followForce.mult(this.weightArrive);
        this.applyForce(followForce);

        let avoidForce = this.avoid(obstacles);
        avoidForce.mult(this.weightAvoid);
        this.applyForce(avoidForce);
    }

    executePursue() {
        let force = this.pursue(this.player);
        force.mult(this.weightPursue);
        this.applyForce(force);

        let avoidForce = this.avoid(obstacles);
        avoidForce.mult(this.weightAvoid);
        this.applyForce(avoidForce);
    }

    // --- Attack : freinage + décompte du coup ---
    executeAttack() {
        this.vel.mult(0.8); // freine pour s'arrêter pendant le coup
        this.attackTimer--;

        if (this.attackTimer <= 0) {
            // Coup terminé → passe en cooldown
            this.state = "cooldown";
            this.cooldownTimer = this.cooldownDuration;
        }
    }

    // --- Cooldown : attend sur place ---
    executeCooldown() {
        this.vel.mult(0.9);
        this.cooldownTimer--;
    }


    // =============================================
    // COMBAT
    // =============================================
    takeDamage(amount) {
        if (this.invincibleTimer > 0) return;
        this.hp           = max(0, this.hp - amount);
        this.isHurt       = true;
        this.hurtTimer    = this.hurtDuration;
        this.invincibleTimer = this.invincibleDuration;
    }
 
    isDead() {
        return this.hp <= 0;
    }

    // =============================================
    // LANCER UNE ATTAQUE
    // Calcule l'angle UNE SEULE FOIS et fige l'animation
    // =============================================
    startAttack() {
        this.state       = "attack";
        this.attackTimer = this.attackDuration;

        // Direction vers le joueur au moment du lancement
        let dir   = p5.Vector.sub(this.player.pos, this.pos);
        let angle = dir.heading();

        this.setAttackAnimation(angle);
        this.facingRight = this.player.pos.x >= this.pos.x;
    }

    // =============================================
    // CHOISIR L'ANIMATION D'ATTAQUE selon l'angle
    // Secteurs de 45° couvrant les 8 directions
    // =============================================
    setAttackAnimation(angle) {
        let deg = degrees(angle);
        if (deg < 0) deg += 360;

        if      (deg >= 337.5 || deg < 22.5)  this.setAnim("attack_right");
        else if (deg >= 22.5  && deg < 67.5)  this.setAnim("attack_down_right");
        else if (deg >= 67.5  && deg < 112.5) this.setAnim("attack_down");
        else if (deg >= 112.5 && deg < 157.5) { this.setAnim("attack_down_right"); this.facingRight = false; }
        else if (deg >= 157.5 && deg < 202.5) { this.setAnim("attack_right");      this.facingRight = false; }
        else if (deg >= 202.5 && deg < 247.5) { this.setAnim("attack_up_right");   this.facingRight = false; }
        else if (deg >= 247.5 && deg < 292.5) this.setAnim("attack_up");
        else                                   this.setAnim("attack_up_right");
    }

    // =============================================
    // GESTION DES ANIMATIONS
    // =============================================
    setAnim(name) {
        if (this.currentAnim === name) return;
        this.currentAnim = name;
        this.animFrame   = 0;
        this.animTimer   = 0;
    }

    updateAnimation() {
        // Chaque état dicte son animation
        switch (this.state) {
            case "patrol":
            case "pursue":
                this.setAnim(this.vel.mag() > 0.1 ? "run" : "idle");
                break;
            case "attack":
                // Animation figée — définie dans startAttack()
                break;
            case "cooldown":
                this.setAnim("idle");
                break;
        }

        // Avance les frames
        this.animTimer++;
        if (this.animTimer >= this.animDelay) {
            this.animTimer = 0;
            let anim = this.animations[this.currentAnim];
            this.animFrame = (this.animFrame + 1) % anim.frames;
        }
    }

    // =============================================
    // SHOW — rendu sprite + debug
    // =============================================
    show() {
        if (this.isDead()) return; // ne rien afficher si mort

        let anim = this.animations[this.currentAnim];
        if (!anim.img) return;

        let sx = this.animFrame * anim.frameW;

        // Flash rouge si blessé
        if (this.isHurt) {
            tint(255, 80, 80, 200);
        }

        push();
        translate(this.pos.x, this.pos.y);
        if (!this.facingRight) scale(-1, 1);
        imageMode(CENTER);
        image(anim.img, 0, 0, this.displaySize, this.displaySize, sx, 0, anim.frameW, anim.frameH);
        pop();

        noTint();

        // Barre de vie au-dessus de l'ennemi
        this.drawHealthBar();

        super.show();
        if (Vehicle.debug) this.debugDraw();
    }


    // =============================================
    // BARRE DE VIE
    // =============================================
    drawHealthBar() {
        let barW    = 60;
        let barH    = 6;
        let barX    = this.pos.x - barW / 2;
        let barY    = this.pos.y - this.displaySize /4 - 5;
        let fillW   = (this.hp / this.maxHp) * barW;
 
        // Couleur selon % de vie
        let barColor = this.hp > this.maxHp * 0.5
            ? color(0, 220, 0)    // vert > 50%
            : this.hp > this.maxHp * 0.25
                ? color(255, 165, 0) // orange > 25%
                : color(220, 0, 0);  // rouge ≤ 25%
 
        push();
        noStroke();
        // Fond gris
        fill(60);
        rect(barX, barY, barW, barH, 3);
        // Vie restante
        fill(barColor);
        rect(barX, barY, fillW, barH, 3);
        // Contour noir pour contraste
        noFill();
        stroke(0);
        strokeWeight(2);
        rect(barX, barY, barW, barH, 3);
        // Contour blanc fin
        stroke(255);
        strokeWeight(0.5);
        rect(barX, barY, barW, barH, 3);
        pop();
    }
 

    // =============================================
    // DEBUG
    // =============================================
    debugDraw() {
        push();
        noFill();

        // Rouge  = portée d'attaque
        stroke(255, 0, 0, 150);
        circle(this.pos.x, this.pos.y, this.attackRange * 2);

        // Orange = portée de poursuite
        stroke(255, 165, 0, 150);
        circle(this.pos.x, this.pos.y, this.pursuitRange * 2);

        // Jaune  = portée de laisse (retour patrouille)
        stroke(255, 255, 0, 100);
        circle(this.pos.x, this.pos.y, this.leashRange * 2);

        // Chemin de patrouille
        if (this.patrolPath && this.patrolPath.length > 1) {
            stroke(0, 255, 0);
            beginShape();
            for (let p of this.patrolPath) vertex(p.x, p.y);
            endShape(CLOSE);
        }

        // Point cible courant sur le chemin
        if (this.patrolPath.length > 0) {
            let target = this.patrolPath[this._pathIndex % this.patrolPath.length];
            fill(255, 0, 255); noStroke();
            circle(target.x, target.y, 10);
        }

        // État + cooldown
        fill(255); noStroke();
        textSize(12); textAlign(CENTER);
        text(`[${this.state}]`, this.pos.x, this.pos.y - this.displaySize / 2 - 10);
        if (this.cooldownTimer > 0) {
            text(`cd: ${this.cooldownTimer}`, this.pos.x, this.pos.y - this.displaySize / 2 - 25);
        }

        pop();
    }
}