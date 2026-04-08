class Player extends Vehicle {

    constructor(x, y) {
        super(x, y);

        // Paramètres de mouvement
        this.maxSpeed = 3.5;
        this.maxForce = 0.3;
        this.r = 32; // rayon de collision (pas lié à la taille du sprite)

        // Taille d'affichage (2 tiles = 128px)
        // L'image source fait 900x900, on affiche en 128x128
        this.displaySize = 256;

        // =============================================
        // ANIMATIONS — séquences d'images
        // =============================================
        this.animations = {
            idle:   { frames: [], count: 15, folder: "Idle",             name: "Idle" },
            run:    { frames: [], count: 24, folder: "Run",              name: "Run" },
            hurt:   { frames: [], count: 5,  folder: "Hurt",             name: "Hurt" },
            attack: { frames: [], count: 7,  folder: "Attack Standing",  name: "Attack_Standing" },
        };

        // Animation courante
        this.currentAnim = "idle";
        this.frameIndex  = 0;
        this.frameDelay  = 1;   // frames p5 entre chaque image d'animation
        this.frameTimer  = 0;

        // =============================================
        // ÉTAT DU JOUEUR
        // =============================================
        this.state = "idle";    // idle | run | attack | hurt | dead
        this.hp    = 100;
        this.maxHp = 100;
        this.isAttacking = false;
        this.attackCooldown = 0;
        this.attackCooldownMax = 30;
        this.isHurt      = false;

        // Direction du regard (1 = droite, -1 = gauche)
        this.direction = 1;
    }

    // =============================================
    // PRELOAD — à appeler dans preload() de sketch.js
    // =============================================
    preload() {
        const basePath = "../assets/characters/Pirate";

        for (let animKey in this.animations) {
            let anim   = this.animations[animKey];
            let folder = anim.folder;
            let name   = anim.name;

            for (let i = 1; i <= anim.count; i++) {
                // Numéro sur 4 chiffres : 0001, 0002...
                let num      = String(i).padStart(4, "0");
                let fileName = `Sword Hero - 1 - ${name}${num}.png`;
                let path     = `${basePath}/${folder}/${fileName}`;
                anim.frames.push(loadImage(path));
            }
        }
    }

    // =============================================
    // UPDATE — comportements + physique
    // =============================================
    update() {
        // Ne pas bouger si en train d'attaquer ou blessé
        if (!this.isAttacking && !this.isHurt) {
            this._applyMovement();
        }

        // Mise à jour physique (Vehicle)
        super.update();

        // Mise à jour animation
        this._updateAnimation();

        // Direction du regard selon la vitesse
        if (this.vel.x !== 0) {
            this.direction = this.vel.x > 0 ? 1 : -1;
        }
    }

    // =============================================
    // MOUVEMENT — seek souris + avoid obstacles + boundaries
    // =============================================
    _applyMovement() {
        let mouseTarget = createVector(mouseX, mouseY);

        // Distance à la souris — si trop proche on ne bouge pas
        let distMouse = this.pos.dist(mouseTarget, true);
        if (distMouse < 20) return;

        let seekForce  = this.arrive(mouseTarget);
        //let avoidForce = this.avoid(obstacles || []);
        let boundForce = this.boundaries(0, 0, 3200, 3200, 100);

        // Poids des forces
        seekForce.mult(1.0);
       // avoidForce.mult(3.0); // l'évitement est prioritaire
        boundForce.mult(2.0);

        this.applyForce(seekForce);
        //this.applyForce(avoidForce);
        this.applyForce(boundForce);
    }

    // =============================================
    // ATTAQUE — déclenchée au clic gauche
    // =============================================
    attack() {
        if (this.isAttacking || this.isHurt || this.attackCooldown > 0) return;
        this.isAttacking = true;
        this._setAnim("attack");
        this.attackCooldown = this.attackCooldownMax;
    }

    // Retourne true pendant les frames actives du slash (frames 4 et 5)
    isSlashActive() {
        return this.isAttacking &&
               this.currentAnim === "attack" &&
               (this.frameIndex === 3 || this.frameIndex === 4); // index 0-based
    }

    // =============================================
    // DÉGÂTS — appelé quand le joueur est touché
    // =============================================
    takeDamage(amount) {
        if (this.isHurt) return;
        this.hp -= amount;
        this.hp = max(0, this.hp);
        this.isHurt = true;
        this._setAnim("hurt");

        if (this.hp <= 0) {
            this.state = "dead";
        }
    }

    isDead() {
        return this.hp <= 0;
    }

    // =============================================
    // GESTION DES ANIMATIONS
    // =============================================
    _setAnim(name) {
        if (this.currentAnim === name) return;
        this.currentAnim = name;
        this.frameIndex  = 0;
        this.frameTimer  = 0;
    }

    _updateAnimation() {
        if (this.attackCooldown > 0) this.attackCooldown--;

        // Choisir l'animation selon l'état
        if (!this.isAttacking && !this.isHurt) {
            if (this.vel.mag() > 0.5) {
                this._setAnim("run");
                this.state = "run";
            } else {
                this._setAnim("idle");
                this.state = "idle";
            }
        }

        // Avancer les frames
        this.frameTimer++;
        if (this.frameTimer >= this.frameDelay) {
            this.frameTimer = 0;
            let anim = this.animations[this.currentAnim];

            this.frameIndex++;

            // Fin d'animation
            if (this.frameIndex >= anim.count) {
                this.frameIndex = 0;

                // Animations one-shot → retour à idle
                if (this.currentAnim === "attack") this.isAttacking = false;
                if (this.currentAnim === "hurt")   this.isHurt      = false;
            }
        }
    }

    // =============================================
    // SHOW — rendu du sprite + debug
    // =============================================
    show() {
        let anim  = this.animations[this.currentAnim];
        let frame = anim.frames[this.frameIndex];

        if (!frame) return;

        push();
        translate(this.pos.x, this.pos.y);

        // Retourner le sprite selon la direction
        if (this.direction === -1) {
            scale(-1, 1); // flip horizontal
        }

        // Le personnage est centré dans l'image 900x900
        // On affiche en displaySize x displaySize centré sur this.pos
        imageMode(CENTER);
        image(frame, 0, 0, this.displaySize, this.displaySize);

        pop();

        // Debug Vehicle (rayon collision + trainée)
        super.show();

        // Debug HP
        if (Vehicle.debug) {
            push();
            fill(255);
            noStroke();
            textSize(12);
            textAlign(CENTER);
            text(`HP: ${this.hp}`, this.pos.x, this.pos.y - this.displaySize / 2 - 10);
            pop();
        }
    }
}