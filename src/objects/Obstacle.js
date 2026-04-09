// =============================================
// Obstacle — rocher doré animé
// N'étend PAS Vehicle — ne se déplace pas
// Possède pos et r pour être compatible avec avoid() de Vehicle.js
// Spritesheet : 768x128, 8 frames, animé en boucle
// =============================================
class Obstacle {

    static img        = null;
    static frameW     = 128
    static frameH     = 128;
    static frameCount = 6;

    static preload() {
        Obstacle.img = loadImage("../assets/world/sprites/Gold Stones/Gold Stone 6_Highlight.png");
    }

    constructor(x, y, displaySize = 128) {
        // pos et r — les deux seules propriétés requises par avoid() dans Vehicle.js
        this.pos         = createVector(x, y);
        this.displaySize = displaySize;
        this.r           = displaySize * 0.4; // rayon de collision proportionnel

        // Animation en boucle
        this.animFrame = 0;
        this.animTimer = 0;
        this.animDelay = 3;
    }

    update() {
        this.animTimer++;
        if (this.animTimer >= this.animDelay) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % Obstacle.frameCount;
        }
    }

    show() {
        if (!Obstacle.img) return;

        let sx = this.animFrame * Obstacle.frameW;

        push();
        imageMode(CENTER);
        image(
            Obstacle.img,
            this.pos.x, this.pos.y,
            this.displaySize, this.displaySize,
            sx, 0,
            Obstacle.frameW, Obstacle.frameH
        );
        pop();

        if (typeof Vehicle !== 'undefined' && Vehicle.debug || true) {
            push();
            fill(255, 50, 0, 150);
            stroke(255, 50, 0, 150);
            strokeWeight(1);
            circle(this.pos.x, this.pos.y, this.r * 2);
            pop();
        }
    }
}