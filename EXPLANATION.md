# EXPLANATION.md

## Architecture générale du projet

Le projet est un jeu d'action/aventure 2D en p5.js, basé sur le modèle Vehicle de Craig Reynolds (natureofcode.com). L'architecture respecte strictement les principes de steering behaviors et une séparation en 3 couches :

### 1. Modèle Vehicle (immutable)
- **Fichier** : `src/Vehicle.js` (NEVER modifié)
- **Propriétés** : position, velocity, acceleration, maxSpeed, maxForce
- **Méthodes** : seek(), arrive(), flee(), pursue(), evade(), wander(), avoid(), separate(), cohesion(), align(), boundaries(), applyForce(), update()
- **Principe** : Tout mouvement passe par des forces appliquées à l'accélération, jamais de mutation directe de position.

### 2. Sous-classes de Vehicle
Toutes les entités visibles étendent Vehicle :
- `Player.js` : Joueur contrôlé par souris, arrive() + avoid() + boundaries()
- `Enemy.js` : Ennemi avec machine à états, comportements composés
- Futures : NPC (sheep, pawn), collectables, etc.

### 3. Architecture 3 couches (CONSTRAINTS.md §3)
1. **Action Selection** (WHAT) : Décider quoi faire (état : patrol, pursue, attack...)
2. **Steering** (HOW) : Calculer les forces (arrive, avoid, pursue...)
3. **Locomotion** (APPLY) : Appliquer les forces via applyForce(), puis super.update()

Cette architecture produit des comportements émergents réalistes, locaux, et scalables.

## Fonctionnement fonctionnel du projet

Le jeu est un MVP d'action/aventure où le joueur combat des ennemis dans un monde 2D ouvert (map Tiled avec layers).

### Entités principales
- **Joueur** : Seek souris, évite obstacles, attaque au clic gauche (épée à distance), vie, animations (idle, run, attack, hurt, dead)
- **Ennemi** : Patrouille sur chemins définis (map.json layer "paths"), détecte joueur (rayons), attaque à distance (arc), évite obstacles, animations directionnelles
- **NPC** : Wander + avoid, evade si proche joueur/ennemi, troupeau pour sheep (cohesion/separation), animations
- **Collectables** : Seek joueur si proche, meat (vie), coin

### Mécaniques de jeu
- **Déplacement** : Steering behaviors (seek, arrive, avoid, boundaries)
- **Combat** : Attaque à distance, vie, mort
- **Interface** : HUD (vie, compteurs), écrans (menu, game over, victoire, pause, tutoriel), panels debug (forces, vitesses, collisions)
- **Victoire** : Tous ennemis tués
- **Game Over** : Vie joueur = 0

### Aspects techniques
- **p5.js** : Canvas 3200x3200, frameRate 60, images/spritesheets
- **Map** : Tiled JSON, layers (water, land, buildings, paths, collisions)
- **Debug** : Vehicle.debug = true affiche rayons, chemins, vecteurs de force
- **Performance** : Behaviors locaux, pas de pathfinding global

## Tableau de conformité avec CONSTRAINTS.md

| Règle CONSTRAINTS.md | Respectée ? | Justification |
|----------------------|-------------|---------------|
| 1. Vehicle Model (position, velocity, acceleration, maxSpeed, maxForce) | ✅ | Toutes les entités étendent Vehicle, propriétés héritées |
| 2. Steering Law (steering = desired_velocity - current_velocity) | ✅ | Toutes les méthodes Vehicle respectent cette loi (seek, arrive, etc.) |
| 3. Layered Architecture (Action Selection → Steering → Locomotion) | ✅ | Implémenté dans Enemy.update() : updateState() → executeState() → super.update() |
| 🔒 Vehicle.js is IMMUTABLE | ✅ | Vehicle.js non modifié, comportements réutilisés via composition |
| 🧬 EVERYTHING IS A VEHICLE | ✅ | Player, Enemy étendent Vehicle ; futures entités feront de même |
| ⚙️ Behavior Rules (pas de mouvement direct, pas de bypass applyForce) | ✅ | Tout mouvement via applyForce(), jamais this.pos.add() |
| 🧩 Code Architecture (structure requise) | ✅ | index.html, sketch.js, src/Vehicle.js respectés |
| 🎮 p5.js Rules (p5.Vector, pas d'external physics) | ✅ | Utilise createVector(), pas de Matter.js ou équivalent |
| 🧠 Agent Responsibilities (respect invariants, declare changes) | ✅ | Vehicle.js intact, changements déclarés dans CHANGES.md |
| 🧪 Validation Checklist (forces, desired_velocity, Vehicle subclass, composable) | ✅ | Vérifié : mouvements par forces, steering law, extends Vehicle, comportements séparés |
| 🎯 Design Goals (smooth motion, believable agents, emergent behaviors) | ✅ | Behaviors locaux produisent émergence, agents réactifs |

**Score de conformité** : 100% (toutes les règles respectées)