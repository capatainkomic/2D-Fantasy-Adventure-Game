// =============================================
// Sheep — NPC avec comportements de troupeau
// Extends Vehicle — CONSTRAINTS.md
//
// Couche 1 : Action Selection → updateState()
// Couche 2 : Steering         → executeState()
// Couche 3 : Locomotion       → super.update()
//
// Behaviours :
//   - herd    : separation + alignment + cohesion (flocking)
//   - flee    : fuit player et enemies
//   - avoid   : évite les obstacles
// =============================================
class Sheep extends Vehicle {

    static imgs = {
        grass: null,
        move:  null,
    };

    static preload() {
        Sheep.imgs.grass = loadImage("../assets/characters/Sheep/Sheep_Grass.png");
        Sheep.imgs.move  = loadImage("../assets/characters/Sheep/Sheep_Move.png");
    }

    constructor(x, y) {
        super(x, y);

        // --- Mouvement ---
        this.maxSpeed = 3;
        this.maxForce = 0.2;
        this.r        = 24;

        // --- Affichage ---
        this.displaySize = 96;
        this.facingRight = true;

        // --- Poids des forces ---
        this.weightSeparate  = 2.0;
        this.weightAlign     = 1.0;
        this.weightCohesion  = 1.0;
        this.weightFlee      = 3.5; // prioritaire sur le herd
        this.weightAvoid     = 3.0;

        // --- Seuils ---
        this.fleeRadius = 200; // distance de détection player/enemy

        // --- États ---
        this.state = "graze"; // graze | flee

        // --- Animations ---
        this.animations = {
            grass: { get img() { return Sheep.imgs.grass; }, frames: 12, frameW: 128, frameH: 128 },
            move:  { get img() { return Sheep.imgs.move;  }, frames: 4,  frameW: 128, frameH: 128 },
        };

        this.currentAnim = "grass";
        this.animFrame   = 0;
        this.animTimer   = 0;
        this.animDelay   = 6;
    }

    // =============================================
    // UPDATE — 3 couches
    // =============================================
    update(sheeps, threats) {
        this.updateState(threats);
        this.executeState(sheeps, threats);
        super.update();
        this.updateAnimation();

        if (this.vel.x !== 0) this.facingRight = this.vel.x > 0;
    }

    // =============================================
    // COUCHE 1 — Action Selection
    // =============================================
    updateState(threats) {
        let threatened = false;

        for (let t of threats) {
            if (t.isDead && t.isDead()) continue;
            if (this.pos.dist(t.pos) < this.fleeRadius) {
                threatened = true;
                break;
            }
        }

        this.state = threatened ? "flee" : "graze";
    }

    // =============================================
    // COUCHE 2 — Steering
    // =============================================
    executeState(sheeps, threats) {
        switch (this.state) {
            case "graze": this.executeGraze(sheeps); break;
            case "flee":  this.executeFlee(sheeps, threats); break;
        }
    }

    // --- Graze : herd + avoid ---
    executeGraze(sheeps) {
        let sepForce = this.separate(sheeps);
        let aliForce = this.align(sheeps);
        let cohForce = this.cohesion(sheeps);
        let avoForce = this.avoid(obstacles);

        sepForce.mult(this.weightSeparate);
        aliForce.mult(this.weightAlign);
        cohForce.mult(this.weightCohesion);
        avoForce.mult(this.weightAvoid);

        this.applyForce(sepForce);
        this.applyForce(aliForce);
        this.applyForce(cohForce);
        this.applyForce(avoForce);

        // Amortissement — le troupeau ralentit naturellement
        this.vel.mult(0.95);
    }

    // --- Flee : fuite + herd + avoid ---
    executeFlee(sheeps, threats) {
        // Fuit la menace la plus proche
        let closest     = null;
        let closestDist = Infinity;

        for (let t of threats) {
            if (t.isDead && t.isDead()) continue;
            let d = this.pos.dist(t.pos);
            if (d < closestDist) {
                closestDist = d;
                closest     = t;
            }
        }

        if (closest) {
            let fleeForce = this.flee(closest.pos);
            fleeForce.mult(this.weightFlee);
            this.applyForce(fleeForce);
        }

        // Continue de respecter le herd même en fuite
        let sepForce = this.separate(sheeps);
        let avoForce = this.avoid(obstacles);

        sepForce.mult(this.weightSeparate);
        avoForce.mult(this.weightAvoid);

        this.applyForce(sepForce);
        this.applyForce(avoForce);
    }

    // =============================================
    // ANIMATION
    // =============================================
    updateAnimation() {
        // Choisir l'animation selon le mouvement
        let moving = this.vel.mag() > 0.3;
        this.currentAnim = moving ? "move" : "grass";

        this.animTimer++;
        if (this.animTimer >= this.animDelay) {
            this.animTimer = 0;
            let anim = this.animations[this.currentAnim];
            this.animFrame = (this.animFrame + 1) % anim.frames;
        }
    }

    // =============================================
    // SHOW
    // =============================================
    show() {
        let anim = this.animations[this.currentAnim];
        if (!anim.img) return;

        let sx = this.animFrame * anim.frameW;

        push();
        translate(this.pos.x, this.pos.y);
        if (!this.facingRight) scale(-1, 1);
        imageMode(CENTER);
        image(
            anim.img,
            0, 0,
            this.displaySize, this.displaySize,
            sx, 0,
            anim.frameW, anim.frameH
        );
        pop();

        super.show();
    }
}