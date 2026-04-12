// =============================================
// Coin — pièce d'or ramassable
// Extends Collectible → extends Vehicle
// Spawne en groupe (2-6) à la mort de l'ennemi
// =============================================
class Coin extends Collectible {

    static img = null;

    static preload() {
        Coin.img = loadImage("../assets/ui/gold coin.png");
    }

    constructor(x, y) {
        super(x, y);
        this.displaySize = 32;
    }

    onCollect(player) {
        player.coins = (player.coins || 0) + 1;
        soundManager.playCoinCollect();
    }

    show() {
        super.show(); // particule d'apparition

        if (this.collected || !Coin.img) return;

        push();
        imageMode(CENTER);
        image(Coin.img, this.pos.x, this.pos.y, this.displaySize, this.displaySize);
        pop();

        if (Vehicle.debug) {
            push();
            noFill(); stroke(255, 215, 0, 150);
            circle(this.pos.x, this.pos.y, this.attractRadius * 2);
            pop();
        }
    }
}