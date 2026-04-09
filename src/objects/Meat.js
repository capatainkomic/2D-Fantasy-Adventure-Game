// =============================================
// Meat — viande ramassable
// Extends Collectible → extends Vehicle
// Spawne 1 à la mort de l'ennemi
// Redonne 5 HP au joueur
// =============================================
class Meat extends Collectible {

    static img = null;

    static preload() {
        Meat.img = loadImage("../assets/world/objects/Meat Resource.png");
    }

    constructor(x, y) {
        super(x, y);
        this.displaySize = 40;
    }

    onCollect(player) {
        player.hp = min(player.maxHp, player.hp + 5);
    }

    show() {
        super.show(); // particule d'apparition

        if (this.collected || !Meat.img) return;

        push();
        imageMode(CENTER);
        image(Meat.img, this.pos.x, this.pos.y, this.displaySize, this.displaySize);
        pop();

        if (Vehicle.debug) {
            push();
            noFill(); stroke(200, 50, 50, 150);
            circle(this.pos.x, this.pos.y, this.attractRadius * 2);
            pop();
        }
    }
}