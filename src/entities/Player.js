class Player extends Vehicle {

    constructor(x, y) {
        super(x, y);

        this.maxSpeed    = 3.5;
        this.maxForce    = 0.3;
        this.r           = 32;
        this.displaySize = 256;

        this.animations = {
            idle:   { frames: [], count: 15, folder: "Idle",            name: "Idle" },
            run:    { frames: [], count: 24, folder: "Run",             name: "Run" },
            hurt:   { frames: [], count: 5,  folder: "Hurt",            name: "Hurt" },
            attack: { frames: [], count: 7,  folder: "Attack Standing", name: "Attack_Standing" },
        };

        this.currentAnim = "idle";
        this.frameIndex  = 0;
        this.frameDelay  = 1;
        this.frameTimer  = 0;

        this.state             = "idle";
        this.hp                = 100;
        this.maxHp             = 100;
        this.coins             = 0;
        this.isAttacking       = false;
        this.attackCooldown    = 0;
        this.attackCooldownMax = 30;
        this.isHurt            = false;

        this.invincibleTimer    = 0;
        this.invincibleDuration = 90;
        this.flashTimer         = 0;
        this.flashInterval      = 6;

        this.facingRight = true;

        this._initBehaviors();
    }

    preload() {
        const basePath = "../assets/characters/Pirate";

        for (const animKey in this.animations) {
            const anim = this.animations[animKey];
            for (let i = 1; i <= anim.count; i++) {
                const num  = String(i).padStart(4, "0");
                const file = `Sword Hero - 1 - ${anim.name}${num}.png`;
                anim.frames.push(loadImage(`${basePath}/${anim.folder}/${file}`));
            }
        }
    }

    update() {
        this.updateState();                                              // Couche 1 — décide de l'état
        if (this.state !== "attack" && this.state !== "hurt") {
            this._applyMovement();                                       // Couche 2 — applique les forces
        }
        super.update();                                                  // Couche 3 — physique
        this._updateAnimation();                                         // Couche 3 — animation
        if (this.vel.x !== 0) this.facingRight = this.vel.x > 0;
    }

    // Couche 1 — Action Selection
    // Décide uniquement de l'état courant. Ne touche pas aux forces.
    updateState() {
        if (this.isDead())    { this.state = "dead";   return; }
        if (this.isAttacking) { this.state = "attack"; return; }
        if (this.isHurt)      { this.state = "hurt";   return; }
        this.state = this.vel.mag() > 0.5 ? "run" : "idle";
    }

    // Réinitialise le joueur à une position donnée sans muter pos directement
    reset(x, y) {
        this.pos.set(x, y);
        this.vel.set(0, 0);
        this.acc.set(0, 0);
        this.hp             = this.maxHp;
        this.coins          = 0;
        this.state          = "idle";
        this.isAttacking    = false;
        this.isHurt         = false;
        this.invincibleTimer = 0;
        this.attackCooldown  = 0;
        this._setAnim("idle");
    }

    _initBehaviors() {
        this.behaviors = new BehaviorManager(this);
        this.behaviors
            .add('arrive',     (ctx) => this.arrive(ctx.mouseTarget),          1.0)
            .add('avoid',      (ctx) => this.avoid(ctx.obstacles),             3.0)
            .add('boundaries', (ctx) => this.boundaries(0, 0, MAP_W, MAP_H, 100), 2.0);
    }

    _applyMovement() {
        const mouseTarget = screenToWorld(mouseX, mouseY);
        if (this.pos.dist(mouseTarget) < 20) return;

        const ctx = { mouseTarget, obstacles };
        this.applyForce(this.behaviors.compute(ctx));
    }

    attack() {
        if (this.isAttacking || this.isHurt || this.attackCooldown > 0) return;

        const worldMouse = screenToWorld(mouseX, mouseY);
        this.facingRight    = worldMouse.x > this.pos.x;
        this.isAttacking    = true;
        this.attackCooldown = this.attackCooldownMax;
        this._setAnim("attack");
        soundManager.playSwordSlash();
    }

    isSlashActive() {
        return this.isAttacking &&
               this.currentAnim === "attack" &&
               (this.frameIndex === 3 || this.frameIndex === 4);
    }

    takeDamage(amount) {
        if (this.isHurt || this.invincibleTimer > 0) return;

        this.hp              = max(0, this.hp - amount);
        this.isHurt          = true;
        this.invincibleTimer = this.invincibleDuration;
        soundManager.playHit();

        if (!this.isAttacking) this._setAnim("hurt");
        if (this.isDead())     this.state = "dead";
    }

    isDead() {
        return this.hp <= 0;
    }

    _setAnim(name) {
        if (this.currentAnim === name) return;
        this.currentAnim = name;
        this.frameIndex  = 0;
        this.frameTimer  = 0;
    }

    // Couche 3 — Animation
    // Fait avancer les frames selon l'état courant. Ne décide pas de l'état.
    _updateAnimation() {
        if (this.attackCooldown > 0)   this.attackCooldown--;
        if (this.invincibleTimer > 0)  this.invincibleTimer--;
        if (this.invincibleTimer <= 0) this.isHurt = false;

        // Synchronise l'animation sur l'état décidé par updateState()
        this._setAnim(this.state === "dead" ? "idle" : this.state);

        this.frameTimer++;
        if (this.frameTimer >= this.frameDelay) {
            this.frameTimer = 0;
            const anim = this.animations[this.currentAnim];
            this.frameIndex++;

            if (this.frameIndex >= anim.count) {
                this.frameIndex = 0;
                if (this.currentAnim === "attack") this.isAttacking = false;
                if (this.currentAnim === "hurt")   this.isHurt      = false;
            }
        }
    }

    show() {
        if (this.isDead()) return;

        const anim  = this.animations[this.currentAnim];
        const frame = anim.frames[this.frameIndex];
        if (!frame) return;

        if (this.invincibleTimer > 0) {
            this.flashTimer++;
            const isFlashOn = this.flashTimer % (this.flashInterval * 2) < this.flashInterval;
            tint(isFlashOn ? color(255, 80, 80, 180) : color(255, 255, 255, 80));
        }

        push();
        translate(this.pos.x, this.pos.y);
        if (!this.facingRight) scale(-1, 1);
        imageMode(CENTER);
        image(frame, 0, 0, this.displaySize, this.displaySize);
        pop();

        noTint();
        super.show();

        if (Vehicle.debug) {
            push();
            fill(255); noStroke();
            textSize(12); textAlign(CENTER);
            text(`HP: ${this.hp}`,    this.pos.x, this.pos.y - this.displaySize / 2 - 10);
            text(`[${this.state}]`,   this.pos.x, this.pos.y - this.displaySize / 2 - 25);
            pop();
        }
    }
}