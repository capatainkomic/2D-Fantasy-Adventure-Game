class Enemy extends Vehicle {

    static imgs = {
        idle:              null,
        run:               null,
        attack_right:      null,
        attack_up_right:   null,
        attack_up:         null,
        attack_down:       null,
        attack_down_right: null,
    };

    static preload() {
        const dir = "../assets/characters/Lancer";
        Enemy.imgs.idle              = loadImage(`${dir}/Lancer_Idle.png`);
        Enemy.imgs.run               = loadImage(`${dir}/Lancer_Run.png`);
        Enemy.imgs.attack_right      = loadImage(`${dir}/Lancer_Right_Attack.png`);
        Enemy.imgs.attack_up_right   = loadImage(`${dir}/Lancer_UpRight_Attack.png`);
        Enemy.imgs.attack_up         = loadImage(`${dir}/Lancer_Up_Attack.png`);
        Enemy.imgs.attack_down       = loadImage(`${dir}/Lancer_Down_Attack.png`);
        Enemy.imgs.attack_down_right = loadImage(`${dir}/Lancer_DownRight_Attack.png`);
    }

    constructor(x, y) {
        super(x, y);

        this.maxSpeed    = 2;
        this.maxForce    = 0.15;
        this.r           = 32;
        this.displaySize = 256;

        this.patrolPath         = [];
        this.patrolArrivalRange = 50;

        this.attackRange  = 120;
        this.pursuitRange = 300;
        this.leashRange   = 400;

        this.attackTimer      = 0;
        this.attackDuration   = 9;
        this.cooldownTimer    = 0;
        this.cooldownDuration = 180;

        this.state = "patrol";

        this.hp                 = 20;
        this.maxHp              = 20;
        this.isHurt             = false;
        this.hurtTimer          = 0;
        this.hurtDuration       = 20;
        this.invincibleTimer    = 0;
        this.invincibleDuration = 30;

        this._targetPos    = null;
        this._targetVel    = null;
        this._targetIsDead = true;

        this.animations = {
            idle:             { get img() { return Enemy.imgs.idle; },              frames: 12, frameW: 3840/12, frameH: 320 },
            run:              { get img() { return Enemy.imgs.run; },               frames: 6,  frameW: 1920/6,  frameH: 320 },
            attack_right:     { get img() { return Enemy.imgs.attack_right; },      frames: 3,  frameW: 960/3,   frameH: 320 },
            attack_up_right:  { get img() { return Enemy.imgs.attack_up_right; },   frames: 3,  frameW: 960/3,   frameH: 320 },
            attack_up:        { get img() { return Enemy.imgs.attack_up; },         frames: 3,  frameW: 960/3,   frameH: 320 },
            attack_down:      { get img() { return Enemy.imgs.attack_down; },       frames: 3,  frameW: 960/3,   frameH: 320 },
            attack_down_right:{ get img() { return Enemy.imgs.attack_down_right; }, frames: 3,  frameW: 960/3,   frameH: 320 },
        };

        this.currentAnim = "idle";
        this.animFrame   = 0;
        this.animDelay   = 3;
        this.animTimer   = 0;
        this.facingRight = true;

        // Enregistrement des behaviors — les poids sont modifiables via behaviors.setWeight()
        this.behaviors = new BehaviorManager(this);
        this.behaviors
            .add('followPath', (ctx) => this.followPath(ctx.path, this.patrolArrivalRange), 1.0)
            .add('pursue',     (ctx) => this.pursue({ pos: ctx.targetPos, vel: ctx.targetVel }), 1.0)
            .add('avoid',      (ctx) => this.avoid(ctx.obstacles), 5.0)
            .add('attackDrag', (ctx) => this.vel.copy().mult(-0.2), 1.0)
            .add('cooldownDrag',(ctx) => this.vel.copy().mult(-0.1), 1.0);

        // Presets par état — sauvegardés une fois le constructeur terminé
        // (savePreset() capture l'état des poids et des enabled au moment de l'appel)
        this._initPresets();
    }

    _initPresets() {
        // Preset patrol : followPath + avoid actifs
        this.behaviors.disable('pursue').disable('attackDrag').disable('cooldownDrag');
        this.behaviors.savePreset('patrol');

        // Preset pursue : pursue + avoid actifs
        this.behaviors.disable('followPath').enable('pursue').disable('attackDrag').disable('cooldownDrag');
        this.behaviors.savePreset('pursue');

        // Preset attack : seul attackDrag actif
        this.behaviors.disable('followPath').disable('pursue').disable('avoid').enable('attackDrag').disable('cooldownDrag');
        this.behaviors.savePreset('attack');

        // Preset cooldown : seul cooldownDrag actif
        this.behaviors.disable('followPath').disable('pursue').disable('avoid').disable('attackDrag').enable('cooldownDrag');
        this.behaviors.savePreset('cooldown');

        // Revenir à l'état patrol par défaut
        this.behaviors.loadPreset('patrol');
        this.behaviors.enable('followPath').enable('avoid');
    }

    update(obstacles, targetPos, targetVel, targetIsDead) {
        if (this.isDead()) return;

        this._targetPos    = targetPos;
        this._targetVel    = targetVel;
        this._targetIsDead = targetIsDead;

        if (this.hurtTimer > 0)       this.hurtTimer--;
        if (this.invincibleTimer > 0) this.invincibleTimer--;
        if (this.hurtTimer <= 0)      this.isHurt = false;

        this.updateState();           // Couche 1 — Action Selection
        this.executeState(obstacles); // Couche 2 — Steering via BehaviorManager
        super.update();               // Couche 3 — Locomotion
        this.updateAnimation();       // Couche 3 — Animation

        if (this.state === "patrol" || this.state === "pursue") {
            if (this.vel.x !== 0) this.facingRight = this.vel.x > 0;
        }
    }

    // Couche 1 — Action Selection
    updateState() {
        if (this._targetIsDead) {
            this._transitionTo("patrol");
            return;
        }

        const distToTarget = this.pos.dist(this._targetPos);

        switch (this.state) {
            case "patrol":
                if (distToTarget < this.pursuitRange) this._transitionTo("pursue");
                break;

            case "pursue":
                if (distToTarget > this.leashRange)       this._transitionTo("patrol");
                else if (distToTarget < this.attackRange) this.startAttack();
                break;

            case "attack":
                break;

            case "cooldown":
                if (this.cooldownTimer <= 0) {
                    if (distToTarget > this.leashRange)        this._transitionTo("patrol");
                    else if (distToTarget >= this.attackRange) this._transitionTo("pursue");
                    else                                       this.startAttack();
                }
                break;
        }
    }

    // Charge le preset correspondant à l'état cible
    _transitionTo(newState) {
        this.state = newState;
        this.behaviors.loadPreset(newState);
    }

    // Couche 2 — Steering via BehaviorManager
    executeState(obstacles) {
        const ctx = {
            obstacles,
            path:      this.patrolPath,
            targetPos: this._targetPos,
            targetVel: this._targetVel,
        };

        if (this.state === "attack") {
            this.attackTimer--;
            if (this.attackTimer <= 0) {
                this.cooldownTimer = this.cooldownDuration;
                this._transitionTo("cooldown");
            }
        }

        if (this.state === "cooldown") this.cooldownTimer--;

        this.applyForce(this.behaviors.compute(ctx));
    }

    startAttack() {
        this._transitionTo("attack");
        this.attackTimer = this.attackDuration;

        const dir = p5.Vector.sub(this._targetPos, this.pos);
        this.setAttackAnimation(dir.heading());
        this.facingRight = this._targetPos.x >= this.pos.x;
    }

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

    takeDamage(amount) {
        if (this.invincibleTimer > 0) return;
        this.hp              = max(0, this.hp - amount);
        this.isHurt          = true;
        this.hurtTimer       = this.hurtDuration;
        this.invincibleTimer = this.invincibleDuration;
    }

    isDead() { return this.hp <= 0; }

    reset(x, y) {
        this.pos.set(x, y);
        this.vel.set(0, 0);
        this.acc.set(0, 0);
        this.hp            = this.maxHp;
        this.cooldownTimer = 0;
        this.attackTimer   = 0;
        this._transitionTo("patrol");
    }

    // Couche 3 — Animation
    setAnim(name) {
        if (this.currentAnim === name) return;
        this.currentAnim = name;
        this.animFrame   = 0;
        this.animTimer   = 0;
    }

    updateAnimation() {
        switch (this.state) {
            case "patrol":
            case "pursue":
                this.setAnim(this.vel.mag() > 0.1 ? "run" : "idle");
                break;
            case "cooldown":
                this.setAnim("idle");
                break;
        }

        this.animTimer++;
        if (this.animTimer >= this.animDelay) {
            this.animTimer = 0;
            const anim = this.animations[this.currentAnim];
            this.animFrame = (this.animFrame + 1) % anim.frames;
        }
    }

    show() {
        if (this.isDead()) return;

        const anim = this.animations[this.currentAnim];
        if (!anim.img) return;

        if (this.isHurt) tint(255, 80, 80, 200);

        push();
        translate(this.pos.x, this.pos.y);
        if (!this.facingRight) scale(-1, 1);
        imageMode(CENTER);
        image(anim.img, 0, 0, this.displaySize, this.displaySize,
              this.animFrame * anim.frameW, 0, anim.frameW, anim.frameH);
        pop();

        noTint();
        this.drawHealthBar();
        super.show();
        if (Vehicle.debug) this.debugDraw();
    }

    drawHealthBar() {
        const barW     = 60;
        const barH     = 6;
        const barX     = this.pos.x - barW / 2;
        const barY     = this.pos.y - this.displaySize / 4 - 5;
        const fillW    = (this.hp / this.maxHp) * barW;
        const barColor = this.hp > this.maxHp * 0.5
            ? color(0, 220, 0)
            : this.hp > this.maxHp * 0.25
                ? color(255, 165, 0)
                : color(220, 0, 0);

        push();
        noStroke();
        fill(60);       rect(barX, barY, barW,  barH, 3);
        fill(barColor); rect(barX, barY, fillW, barH, 3);
        noFill();
        stroke(0);   strokeWeight(2);   rect(barX, barY, barW, barH, 3);
        stroke(255); strokeWeight(0.5); rect(barX, barY, barW, barH, 3);
        pop();
    }

    debugDraw() {
        push();
        noFill();
        stroke(255, 0, 0, 150);   circle(this.pos.x, this.pos.y, this.attackRange  * 2);
        stroke(255, 165, 0, 150); circle(this.pos.x, this.pos.y, this.pursuitRange * 2);
        stroke(255, 255, 0, 100); circle(this.pos.x, this.pos.y, this.leashRange   * 2);

        if (this.patrolPath?.length > 1) {
            stroke(0, 255, 0);
            beginShape();
            for (const p of this.patrolPath) vertex(p.x, p.y);
            endShape(CLOSE);
        }

        // Affiche les behaviors actifs et leurs poids
        const behaviorList = this.behaviors.list();
        fill(255); noStroke(); textSize(10); textAlign(LEFT);
        let debugY = this.pos.y - this.displaySize / 2 - 10;
        for (const b of behaviorList) {
            fill(b.enabled ? color(100, 255, 100) : color(150));
            text(`${b.name}: ${b.weight.toFixed(1)}`, this.pos.x - 40, debugY);
            debugY -= 12;
        }

        fill(255); noStroke(); textSize(12); textAlign(CENTER);
        text(`[${this.state}]`, this.pos.x, this.pos.y - this.displaySize / 2 - 10);
        if (this.cooldownTimer > 0) {
            text(`cd: ${this.cooldownTimer}`, this.pos.x, this.pos.y - this.displaySize / 2 - 25);
        }
        pop();
    }
}