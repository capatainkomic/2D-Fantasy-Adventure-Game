
// =============================================
// DustParticle — Animation pure (EXCEPTION)
// Justification: C'est une particule visuelle STATIONNAIRE
//                sans aucun mouvement/physique.
//                Vision: simples animations d'effets.
// =============================================
class DustParticle {

    static img = null; // image partagée entre toutes les instances

    static preload() {
        DustParticle.img = loadImage("./assets/particle FX/Dust_01.png");
    }

    constructor(x, y, displaySize = 256) {
        // Pas de Vehicle — on définit juste pos pour show()
        this.pos = createVector(x, y);

        this.displaySize = displaySize;

        // Dimensions du spritesheet
        this.sheetW     = 512;
        this.sheetH     = 64;
        this.frameCount = 8;
        this.frameW     = this.sheetW / this.frameCount; // 64px par frame

        this.animFrame = 0;
        this.animTimer = 0;
        this.animDelay = 3; // frames p5 entre chaque image
        this.done      = false; // true quand l'animation est terminée
    }

    update() {
        this.animTimer++;
        if (this.animTimer >= this.animDelay) {
            this.animTimer = 0;
            this.animFrame++;
            if (this.animFrame >= this.frameCount) {
                this.done = true;
            }
        }
    }

    show() {
        if (this.done || !DustParticle.img) return;

        let sx = this.animFrame * this.frameW;

        push();
        translate(this.pos.x, this.pos.y);
        imageMode(CENTER);
        image(
            DustParticle.img,
            0, 0,
            this.displaySize, this.displaySize,
            sx, 0,
            this.frameW, this.sheetH
        );
        pop();
    }
}