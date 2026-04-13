# Refactoring Instructions

Lis attentivement CONSTRAINTS.md et SPECIFICATIONS.md avant de faire quoi que ce soit.

## RÈGLE ABSOLUE

Ne jamais modifier `Vehicle.js` — il est immutable.
Ne jamais créer d'entité animée qui n'étend pas `Vehicle`.
Ne jamais muter `pos` ou `vel` directement — tout passe par `applyForce()`.

---

## 1. Architecture Vehicle

Toute entité qui se déplace doit étendre `Vehicle` :

```js
class Enemy extends Vehicle {}
class Player extends Vehicle {}
class Sheep extends NPC {} // NPC extends Vehicle
class Collectible extends Vehicle {}
```

`Vehicle` contient uniquement les behaviors atomiques de Reynolds :
`seek`, `arrive`, `flee`, `pursue`, `evade`, `wander`, `avoid`, `separate`, `cohesion`, `align`, `boundaries`, `edges`, `followPath`.

Les behaviors composés ou spécifiques à une entité vont dans les sous-classes ou dans le `BehaviorManager`.

---

## 2. Loi de steering (FONDAMENTALE)

Tout behavior doit respecter :

```
steering = desired_velocity - current_velocity
desired_velocity = direction × maxSpeed
steering est limité par maxForce
```

Jamais de mutation directe :

```js
// INTERDIT
this.vel.mult(0.95);
this.pos.x += 10;

// CORRECT — friction via applyForce
const drag = this.vel.copy().mult(-0.05);
this.applyForce(drag);
```

---

## 3. Architecture 3 couches

Chaque entité animée doit respecter cet ordre dans `update()` :

```js
update() {
    this.updateState();      // Couche 1 — Action Selection : décide de l'état
    this.executeState();     // Couche 2 — Steering : applique les forces
    super.update();          // Couche 3 — Locomotion : physique
    this.updateAnimation();  // Couche 3 — Animation
}
```

`updateState()` ne touche qu'à `this.state` — jamais aux forces.
`executeState()` ne touche qu'aux forces — jamais à `this.state`.
`updateAnimation()` lit `this.state` — ne le modifie pas.

---

## 4. BehaviorManager

Chaque `Vehicle` dispose de `this.behaviors = new BehaviorManager(this)`.

API :
```js
this.behaviors.add('avoid', (ctx) => this.avoid(ctx.obstacles), 5.0)
this.behaviors.remove('avoid')
this.behaviors.enable('avoid') / disable('avoid')
this.behaviors.setWeight('avoid', 3.0)
this.behaviors.compute(context)   // retourne la force totale pondérée
this.behaviors.savePreset('patrol')
this.behaviors.loadPreset('patrol')
this.behaviors.list()              // utile pour DebugPanel
```

Les presets sont sauvegardés dans le constructeur après l'enregistrement des behaviors.
Chaque transition d'état appelle `this.behaviors.loadPreset(newState)`.

---

## 5. Hiérarchie de classes

```
Vehicle
├── Player
├── Enemy
├── NPC (classe mère abstraite)
│   └── Sheep
├── Collectible
│   ├── Coin
│   └── Meat
```

`NPC` porte `fleeRadius`, `detectClosestThreat(threats)`, `isThreatened(threats)`.
`Obstacle` ne s'étend pas `Vehicle` car il ne bouge pas — il expose `pos` et `r` pour `avoid()`.

---

## 6. Injection de dépendances

Les entités ne lisent pas les variables globales directement.
Les dépendances sont passées en paramètres d'`update()` :

```js
// INTERDIT
avoid(obstacles) // obstacles lue depuis le scope global

// CORRECT
enemy.update(obstacles, player.pos, player.vel, player.isDead())
sheep.update(sheeps, threats)
collectible.update(player)
```

`Enemy` ne garde pas de référence à `Player` — il reçoit `targetPos`, `targetVel`, `targetIsDead`.

---

## 7. Reset sans mutation directe

Les méthodes `reset()` encapsulent la réinitialisation :

```js
reset(x, y) {
    this.pos.set(x, y);   // set() est autorisé — c'est une réassignation interne
    this.vel.set(0, 0);
    this.acc.set(0, 0);
    this.hp    = this.maxHp;
    this.state = 'idle';
}
```

Jamais depuis l'extérieur :

```js
// INTERDIT
player.pos = createVector(1600, 1600);
player.vel = createVector(0, 0);
```

---

## 8. Structure des fichiers

```
src/
  Vehicle.js              // immutable
  BehaviorManager.js
  sketch.js               // preload, setup, draw, callbacks p5 uniquement
  entities/
    Player.js
    Enemy.js
    NPC.js
    Sheep.js
  objects/
    Collectible.js
    Coin.js
    Meat.js
    Obstacle.js
  ui/
    HUD.js
    InfoPopup.js
    PopupManager.js
    DebugPanel.js
  systems/
    GameManager.js
    CombatSystem.js
    SoundManager.js
    Camera.js
    GameMap.js
  particles/
    DustParticle.js
    StarburstParticle.js
```

---

## 9. Clean Code

**Nommage**
- Noms descriptifs et non ambigus.
- Pas de magic numbers — toute constante est nommée ou exposée comme propriété.
- Méthodes privées préfixées par `_`.

**Fonctions**
- Une fonction fait une seule chose.
- Pas d'arguments booléens (préférer deux méthodes séparées).
- Pas d'effets de bord inattendus.

**Commentaires**
- Ne pas répéter le nom de la méthode dans le commentaire.
- Commenter le *pourquoi*, pas le *quoi*.
- Supprimer les séparateurs décoratifs `=====`.

**Structure**
- Variables déclarées proches de leur usage.
- Fonctions dépendantes placées proches l'une de l'autre.
- `sketch.js` délègue toute logique métier à `GameManager`.

---

## 10. Debug

Chaque behavior dans `Vehicle.js` lit son propre flag statique :

```js
if (Vehicle.debug || Vehicle.debugAvoid) { ... }
```

Flags disponibles :
- `Vehicle.debug` — active tout
- `Vehicle.debugAvoid`
- `Vehicle.debugWander`
- `Vehicle.debugPath`
- `Vehicle.debugPursue`
- `Vehicle.debugBoundaries`
- `Vehicle.debugSeparate`
- `Vehicle.debugCohesion`
- `Vehicle.debugAlign`

Le `DebugPanel` active ces flags via ses toggles — il ne dessine pas lui-même les behaviors gérés par `Vehicle.js`.

---

## 11. Checklist de validation

Avant de soumettre tout refactoring :

- [ ] `Vehicle.js` non modifié (sauf ajout de flags debug)
- [ ] Toutes les entités animées étendent `Vehicle`
- [ ] Aucune mutation directe de `vel` ou `pos`
- [ ] Architecture 3 couches respectée dans chaque `update()`
- [ ] `BehaviorManager` utilisé pour les behaviors composés
- [ ] Dépendances injectées en paramètres, pas lues en global
- [ ] Méthode `reset()` encapsulée dans chaque entité
- [ ] `sketch.js` ne contient que `preload`, `setup`, `draw`, callbacks p5
- [ ] Pas de magic numbers exposés directement
- [ ] Commentaires décoratifs supprimés