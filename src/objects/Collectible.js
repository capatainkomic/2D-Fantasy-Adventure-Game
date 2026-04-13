class Collectible extends Vehicle {

    constructor(x, y) {
        super(x, y);

        this.maxSpeed = 6;
        this.maxForce = 0.3;
        this.r        = 20;

        this.attractRadius = 150;
        this.displaySize   = 48;
        this.collected     = false;
        this.state         = "scatter"; // scatter | attract

        // Impulsion initiale aléatoire — jaillit du point de spawn
        this.vel = p5.Vector.random2D().mult(random(3, 6));
    }

    update(player) {
        if (this.collected) return;

        this.updateState(player);      // Couche 1 — Action Selection
        this.executeSteering(player);  // Couche 2 — Steering
        super.update();                // Couche 3 — Locomotion

        if (this.pos.dist(player.pos) < this.r + player.r * 0.5) {
            this.onCollect(player);
            this.collected = true;
        }
    }

    // Couche 1 — Action Selection
    // Décide du mode : scatter (juste spawné) ou attract (joueur proche)
    updateState(player) {
        const dist = this.pos.dist(player.pos);
        this.state = dist < this.attractRadius ? "attract" : "scatter";
        // Vitesse max adaptée à la distance — ralentit en s'approchant
        this.maxSpeed = this.state === "attract"
            ? map(dist, 0, this.attractRadius, 6, 1)
            : 6;
    }

    // Couche 2 — Steering
    // Applique les forces selon l'état décidé par updateState()
    executeSteering(player) {
        const drag = this.vel.copy().mult(-0.08);
        this.applyForce(drag);

        if (this.state === "attract") {
            this.applyForce(this.seek(player.pos).mult(2.0));
        }
    }

    onCollect(player) {}

    show() {}
}