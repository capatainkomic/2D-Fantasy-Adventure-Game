class Sheep extends NPC {

    static imgs = {
        grass: null,
        move:  null,
    };

    static preload() {
        Sheep.imgs.grass = loadImage("./assets/characters/Sheep/Sheep_Grass.png");
        Sheep.imgs.move  = loadImage("./assets/characters/Sheep/Sheep_Move.png");
    }

    constructor(x, y) {
        super(x, y);

        this.maxSpeed   = 3;
        this.maxForce   = 0.2;
        this.r          = 24;
        this.fleeRadius = 200;

        this.displaySize = 96;
        this.facingRight = true;

        this.state = "graze";

        this.animations = {
            grass: { get img() { return Sheep.imgs.grass; }, frames: 12, frameW: 128, frameH: 128 },
            move:  { get img() { return Sheep.imgs.move;  }, frames: 4,  frameW: 128, frameH: 128 },
        };

        this.currentAnim = "grass";
        this.animFrame   = 0;
        this.animTimer   = 0;
        this.animDelay   = 6;

        this.behaviors = new BehaviorManager(this);
        this.behaviors
            .add('separate',  (ctx) => this.separate(ctx.neighbors),  2.0)
            .add('align',     (ctx) => this.align(ctx.neighbors),     1.0)
            .add('cohesion',  (ctx) => this.cohesion(ctx.neighbors),  1.0)
            .add('flee',      (ctx) => ctx.threat ? this.flee(ctx.threat.pos) : createVector(0,0), 3.5)
            .add('avoid',     (ctx) => this.avoid(ctx.obstacles),     3.0)
            .add('drag',      (ctx) => this.vel.copy().mult(-0.05),   1.0);

        // Preset graze : herd + avoid + drag, pas de flee
        this.behaviors.disable('flee');
        this.behaviors.savePreset('graze');

        // Preset flee : flee + separate + avoid, pas de herd complet ni drag
        this.behaviors.enable('flee').disable('align').disable('cohesion').disable('drag');
        this.behaviors.savePreset('flee');

        // Revenir à graze par défaut
        this.behaviors.loadPreset('graze');
    }

    update(sheeps, threats) {
        this.updateState(threats);           // Couche 1 — Action Selection
        this.executeState(sheeps, threats);  // Couche 2 — Steering
        super.update();                      // Couche 3 — Locomotion
        this.edges();                        // Wrapping aux bords — NPC non soumis aux limites de la map
        this.updateAnimation();              // Couche 3 — Animation

        if (this.vel.x !== 0) this.facingRight = this.vel.x > 0;
    }

    // Couche 1 — Action Selection
    updateState(threats) {
        const newState = this.isThreatened(threats) ? "flee" : "graze";
        if (newState !== this.state) {
            this.state = newState;
            this.behaviors.loadPreset(this.state);
        }
    }

    // Couche 2 — Steering via BehaviorManager
    executeState(sheeps, threats) {
        const ctx = {
            neighbors: sheeps,
            obstacles,
            threat: this.detectClosestThreat(threats),
        };
        this.applyForce(this.behaviors.compute(ctx));
    }

    // Couche 3 — Animation
    updateAnimation() {
        this.currentAnim = this.vel.mag() > 0.3 ? "move" : "grass";

        this.animTimer++;
        if (this.animTimer >= this.animDelay) {
            this.animTimer = 0;
            const anim = this.animations[this.currentAnim];
            this.animFrame = (this.animFrame + 1) % anim.frames;
        }
    }

    show() {
        const anim = this.animations[this.currentAnim];
        if (!anim.img) return;

        push();
        translate(this.pos.x, this.pos.y);
        if (!this.facingRight) scale(-1, 1);
        imageMode(CENTER);
        image(anim.img, 0, 0, this.displaySize, this.displaySize,
              this.animFrame * anim.frameW, 0, anim.frameW, anim.frameH);
        pop();

        super.show();
    }
}