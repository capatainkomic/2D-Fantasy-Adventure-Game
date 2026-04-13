// Gestionnaire de comportements de steering.
// Chaque Vehicle possède une instance via this.behaviors.
//
// Usage :
//   this.behaviors.add('seek', (ctx) => this.seek(ctx.target), 1.0);
//   this.applyForce(this.behaviors.compute(context));
class BehaviorManager {

    constructor(vehicle) {
        this.vehicle   = vehicle;
        // Map nom → { fn, weight, enabled }
        this._behaviors = new Map();
        // Presets sauvegardés : Map id → snapshot sérialisé des behaviors
        this._presets   = new Map();
    }

    // ─── API principale ───────────────────────────────────────────

    // Enregistre un behavior. fn(context) → p5.Vector force.
    add(name, fn, weight = 1.0) {
        this._behaviors.set(name, { fn, weight, enabled: true });
        return this; // chaînable
    }

    remove(name) {
        this._behaviors.delete(name);
        return this;
    }

    enable(name) {
        const b = this._behaviors.get(name);
        if (b) b.enabled = true;
        return this;
    }

    disable(name) {
        const b = this._behaviors.get(name);
        if (b) b.enabled = false;
        return this;
    }

    setWeight(name, weight) {
        const b = this._behaviors.get(name);
        if (b) b.weight = weight;
        return this;
    }

    getWeight(name) {
        return this._behaviors.get(name)?.weight ?? 0;
    }

    isEnabled(name) {
        return this._behaviors.get(name)?.enabled ?? false;
    }

    // Calcule et retourne la somme pondérée de tous les behaviors actifs.
    // context — objet libre passé à chaque fn : { obstacles, target, path, ... }
    compute(context = {}) {
        const total = createVector(0, 0);

        for (const [, b] of this._behaviors) {
            if (!b.enabled) continue;
            const force = b.fn(context);
            if (force) total.add(force.copy().mult(b.weight));
        }

        return total;
    }

    // ─── Presets ──────────────────────────────────────────────────

    // Sauvegarde la configuration actuelle (noms, poids, enabled) sous un id.
    savePreset(id) {
        const snapshot = [];
        for (const [name, b] of this._behaviors) {
            snapshot.push({ name, weight: b.weight, enabled: b.enabled });
        }
        this._presets.set(id, snapshot);
        return this;
    }

    // Charge un preset sauvegardé — ne recrée pas les fn, met à jour poids et enabled.
    loadPreset(id) {
        const snapshot = this._presets.get(id);
        if (!snapshot) return this;

        for (const { name, weight, enabled } of snapshot) {
            const b = this._behaviors.get(name);
            if (!b) continue;
            b.weight  = weight;
            b.enabled = enabled;
        }

        return this;
    }

    // Retourne la liste des behaviors enregistrés — utile pour le debug panel.
    list() {
        const result = [];
        for (const [name, b] of this._behaviors) {
            result.push({ name, weight: b.weight, enabled: b.enabled });
        }
        return result;
    }
}