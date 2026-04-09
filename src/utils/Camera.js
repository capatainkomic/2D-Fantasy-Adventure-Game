// =============================================
// Camera — suit le joueur avec lerp (lissage)
// Gère le translate du canvas avant le rendu
// et le responsive scaling
// =============================================
class Camera {

    constructor(mapW, mapH) {
        this.mapW = mapW; // largeur totale de la map en pixels
        this.mapH = mapH;

        // Position courante de la caméra (coin haut-gauche)
        this.x = 0;
        this.y = 0;

        // Lissage du suivi (0 = instantané, 1 = jamais)
        this.lerpFactor = 0.1;
    }

    // =============================================
    // UPDATE — calcule la position de la caméra
    // Centrée sur la cible (le joueur)
    // Clampée aux bords de la map
    // =============================================
    update(target, viewW, viewH) {
        // Position idéale : cible au centre de l'écran
        let targetX = target.pos.x - viewW / 2;
        let targetY = target.pos.y - viewH / 2;

        // Clamp aux bords de la map
        targetX = constrain(targetX, 0, this.mapW - viewW);
        targetY = constrain(targetY, 0, this.mapH - viewH);

        // Lerp pour un suivi fluide
        this.x = lerp(this.x, targetX, this.lerpFactor);
        this.y = lerp(this.y, targetY, this.lerpFactor);
    }

    // =============================================
    // BEGIN — applique le translate de la caméra
    // Tout ce qui est dessiné après sera décalé
    // =============================================
    begin() {
        push();
        translate(-this.x, -this.y);
    }

    // =============================================
    // END — annule le translate
    // Tout ce qui est dessiné après est en coords écran
    // =============================================
    end() {
        pop();
    }
}