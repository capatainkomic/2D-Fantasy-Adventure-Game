// Classe mère de tous les PNJ.
// Porte le comportement commun : détection de menace et flee radius.
// Les sous-classes définissent leurs propres behaviors de steering.
class NPC extends Vehicle {

    constructor(x, y) {
        super(x, y);
        this.fleeRadius = 200;
    }

    // Retourne la menace la plus proche dans fleeRadius, ou null si aucune.
    detectClosestThreat(threats) {
        let closest     = null;
        let closestDist = Infinity;

        for (const threat of threats) {
            if (threat.isDead?.()) continue;
            const d = this.pos.dist(threat.pos);
            if (d < this.fleeRadius && d < closestDist) {
                closestDist = d;
                closest     = threat;
            }
        }

        return closest;
    }

    // Retourne true si au moins une menace est dans fleeRadius.
    isThreatened(threats) {
        return threats.some(t => !t.isDead?.() && this.pos.dist(t.pos) < this.fleeRadius);
    }
}