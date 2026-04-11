// =============================================
// StarBurstParticle — Animation pure (EXCEPTION)
// Justification: Animation d'effets spritesheet sans
//                mécanique physique ni déplacement.
// =============================================
class StarBurstParticle {

    static img        = null;
    static frameW     = 4096 / 8;  // 512px par colonne
    static frameH     = 4096 / 8;  // ~512px par ligne
    static frameCount = 8;         // colonnes par ligne
    static rowCount   = 8;         // lignes totales

    static preload() {
        StarBurstParticle.img = loadImage("../assets/particle FX/Star_Burst_spritesheet.png");
    }

    constructor(x, y, displaySize = 256) {
        this.pos         = createVector(x, y);
        this.displaySize = displaySize;

        this.animFrame = 0;
        this.row       = 0; // commence à la ligne 0, parcourt toutes les 7
        this.animTimer = 0;
        this.animDelay = 0;
        this.done      = false;
    }

    update() {
        this.animTimer++;
        if (this.animTimer >= this.animDelay) {
            this.animTimer = 0;
            this.animFrame++;

            // Fin d'une ligne → passe à la suivante
            if (this.animFrame >= StarBurstParticle.frameCount) {
                this.animFrame = 0;
                this.row++;

                // Toutes les lignes parcourues → animation terminée
                if (this.row >= StarBurstParticle.rowCount) {
                    this.done = true;
                }
            }
        }
    }

    show() {
        if (this.done || !StarBurstParticle.img) return;

        let sx = this.animFrame * StarBurstParticle.frameW;
        let sy = this.row       * StarBurstParticle.frameH;

        push();
        translate(this.pos.x, this.pos.y);
        imageMode(CENTER);
        image(
            StarBurstParticle.img,
            0, 0,
            this.displaySize, this.displaySize,
            sx, sy,
            StarBurstParticle.frameW, StarBurstParticle.frameH
        );
        pop();
    }
}