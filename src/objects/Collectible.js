// =============================================
// Collectible — classe de base des objets ramassables
// Extends Vehicle car il se déplace (seek vers le joueur)
// Seul le joueur peut ramasser les collectibles
// =============================================
class Collectible extends Vehicle {

    constructor(x, y) {
        super(x, y);

        // Offset plus grand au spawn — évite collecte immédiate
        this.pos.x += random(-80, 80);
        this.pos.y += random(-80, 80);

        this.maxSpeed = 0;
        this.maxForce = 0.3;
        this.r        = 20;

        // Rayon réduit — le joueur doit s'approcher
        this.attractRadius = 150;

        this.displaySize = 48;
        this.collected   = false;

        // Vélocité initiale — jaillit dans une direction aléatoire
        let angle = random(TWO_PI);
        let speed = random(3, 6);
        this.vel  = createVector(cos(angle) * speed, sin(angle) * speed);
        this.friction = 0.92; // ralentit progressivement
    }

    update(player) {
        if (this.collected) return;

        // Friction — ralentit avant de seek
        this.vel.mult(this.friction);

        let dist = this.pos.dist(player.pos);

        if (dist < this.attractRadius) {
            this.maxSpeed = map(dist, 0, this.attractRadius, 6, 1);
            let seekForce = this.seek(player.pos);
            seekForce.mult(2.0);
            this.applyForce(seekForce);
        }

        super.update();

        if (dist < this.r + player.r * 0.5) {
            this.onCollect(player);
            this.collected = true;
        }
    }

    onCollect(player) {}

    show() {
        // Surcharger dans les sous-classes
    }
}