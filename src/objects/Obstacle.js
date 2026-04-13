class Obstacle {

    static img        = null;
    static frameW     = 128;
    static frameH     = 128;
    static frameCount = 6;

    static preload() {
        Obstacle.img = loadImage("../assets/world/sprites/Gold Stones/Gold Stone 6_Highlight.png");
    }

    constructor(x, y, displaySize = 128) {
        this.pos         = createVector(x, y);
        this.displaySize = displaySize;
        this.r           = displaySize * 0.4;

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

        const sx = this.animFrame * Obstacle.frameW;

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

        // Rayon de collision — affiché uniquement en mode debug
        if (Vehicle.debug) {
            push();
            noFill();
            stroke(255, 50, 0, 150);
            strokeWeight(1);
            circle(this.pos.x, this.pos.y, this.r * 2);
            pop();
        }
    }
}