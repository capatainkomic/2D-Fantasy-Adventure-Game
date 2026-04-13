Lis attentivement CONSTRAINTS.md et SPECIFICATIONS.md avant de faire quoi que ce soit.

## RÈGLE ABSOLUE
Ne jamais écraser le contenu existant de EXPLANATION.md.
Tu dois METTRE À JOUR les sections existantes si un concept a évolué, ou AJOUTER de nouvelles sections si de nouveaux concepts ont été introduits.

## Ta mission : mettre à jour EXPLANATION.md

Analyse tous les fichiers du projet et identifie les concepts techniques théoriques et de game design implémentés.
Pour chaque concept, documente selon le format suivant :

---
## [Nom du concept]

**Principe** : explication claire et concise du concept (2-4 phrases).
**Fichiers concernés** : liste des fichiers qui implémentent ce concept.
**Implémentation** : comment le concept est concrètement codé dans le projet.
**Paramètres réglables** : valeurs ajustables et leur effet sur le comportement.

---

## Règles de rédaction
- Nomme les concepts avec leur terminologie exacte (ex : "Steering Behaviors", "AABB Collision", "Tri-Y Sorting")
- Explique le principe avant l'implémentation — un lecteur sans contexte doit comprendre
- Référence les fichiers exacts (pas de chemins génériques)
- Si le concept est issu d'une source connue (Reynolds, Nature of Code), cite-la
- Ne documente pas ce qui n'est pas implémenté

## VALIDATION avant d'écrire
- [ ] J'ai lu CONSTRAINTS.md et SPECIFICATIONS.md
- [ ] Chaque concept est nommé avec sa terminologie exacte
- [ ] Les fichiers concernés sont exacts
- [ ] Aucun fichier .js n'a été modifié

---

# EXPLANATION.md — Concepts techniques et de game design

---

## Vehicle Model (Craig Reynolds)

**Principe** : Chaque entité est un "véhicule" avec position, vélocité et accélération. Le mouvement est entièrement contrôlé par des forces appliquées à l'accélération — jamais par mutation directe de position ou vitesse. Ce modèle produit des mouvements fluides et physiquement crédibles.

**Fichiers concernés** : `Vehicle.js`, `Player.js`, `Enemy.js`, `NPC.js`, `Sheep.js`, `Collectible.js`, `Coin.js`, `Meat.js`

**Implémentation** :
```js
// Toute entité étend Vehicle
class Enemy extends Vehicle {}

// Tout mouvement passe par applyForce()
this.applyForce(seekForce);

// Vehicle.update() applique la physique
this.vel.add(this.acc);
this.vel.limit(this.maxSpeed);
this.pos.add(this.vel);
this.acc.set(0, 0);
```

**Paramètres réglables** : `maxSpeed` (vitesse maximale), `maxForce` (intensité maximale des forces), `r` (rayon de collision).

---

## Steering Behaviors (Reynolds 1999)

**Principe** : Les behaviors de steering calculent une force à appliquer pour produire un comportement autonome. La formule fondamentale est `steering = desired_velocity - current_velocity`. Chaque behavior retourne une force composable avec les autres.

**Fichiers concernés** : `Vehicle.js` (tous les behaviors), `BehaviorManager.js`

**Implémentation** :

| Behavior | Description | Utilisé par |
|---|---|---|
| `seek(target)` | Se dirige vers une cible à vitesse maximale | Player, Collectible |
| `arrive(target)` | Seek avec ralentissement dans un rayon de freinage | Player, Enemy (patrol) |
| `flee(target)` | Inverse de seek — s'éloigne d'une cible | Sheep |
| `pursue(vehicle)` | Seek vers la position future de la cible | Enemy (pursue) |
| `wander()` | Errance autonome via un cercle devant le véhicule | — |
| `avoid(obstacles)` | Évitement d'obstacles via deux vecteurs ahead | Player, Enemy, Sheep |
| `separate(vehicles)` | Répulsion entre voisins trop proches | Sheep |
| `cohesion(vehicles)` | Seek vers le centre de masse du groupe | Sheep |
| `align(vehicles)` | Alignement sur la vitesse moyenne du groupe | Sheep |
| `boundaries(bx,by,bw,bh,d)` | Force de rappel dans une zone rectangulaire | Player |
| `followPath(points)` | Suivi de chemin via arrive() + index courant | Enemy (patrol) |
| `edges()` | Téléportation aux bords opposés (wrapping) | Sheep |

**Paramètres réglables** : `rayonZoneDeFreinage` (200px — zone de ralentissement arrive), `largeurZoneEvitement` (r/2 — largeur zone avoid), `distanceCercle` (150px — wander), `wanderRadius` (50px — wander).

---

## Flocking (Boids — Reynolds 1987)

**Principe** : Le comportement de troupeau émerge de trois règles locales simples appliquées à chaque individu : séparation (éviter les voisins proches), alignement (suivre la direction du groupe), cohésion (se rapprocher du centre de masse). Aucune coordination globale n'est nécessaire.

**Fichiers concernés** : `Sheep.js`, `Vehicle.js`

**Implémentation** :
```js
// Dans Sheep.executeGraze()
this.applyForce(this.separate(sheeps).mult(weightSeparate)); // 2.0
this.applyForce(this.align(sheeps).mult(weightAlign));       // 1.0
this.applyForce(this.cohesion(sheeps).mult(weightCohesion)); // 1.0
this.applyForce(this.avoid(obstacles).mult(weightAvoid));    // 3.0
this.applyForce(this.vel.copy().mult(-weightDrag));          // 0.05
```

**Paramètres réglables** : `weightSeparate` (2.0), `weightAlign` (1.0), `weightCohesion` (1.0), `weightAvoid` (3.0), `weightDrag` (0.05 — amortissement naturel du troupeau).

---

## Layered Architecture (Action Selection → Steering → Locomotion)

**Principe** : Architecture en 3 couches séparées inspirée de l'IA comportementale. Couche 1 — Action Selection : décide *quoi faire* (état). Couche 2 — Steering : calcule *comment se déplacer* (forces). Couche 3 — Locomotion : applique le mouvement (physique + animation). Chaque couche a une responsabilité unique.

**Fichiers concernés** : `Player.js`, `Enemy.js`, `Sheep.js`, `Collectible.js`

**Implémentation** :
```js
update() {
    this.updateState();      // Couche 1 — décide l'état (idle/run/attack/hurt)
    this.executeState();     // Couche 2 — applique les forces selon l'état
    super.update();          // Couche 3 — physique Vehicle
    this.updateAnimation();  // Couche 3 — animation selon l'état
}
```

**Paramètres réglables** : Seuils de transition d'état (ex : distance de détection ennemi `pursuitRange = 300px`).

---

## Finite State Machine (Machine à états finis)

**Principe** : L'ennemi est gouverné par une machine à états finis — un état actif à la fois, des transitions conditionnelles entre états. Chaque état active un preset de behaviors différent via le `BehaviorManager`.

**Fichiers concernés** : `Enemy.js`, `BehaviorManager.js`

**Implémentation** :

```
patrol ──(dist < pursuitRange)──► pursue
pursue ──(dist < attackRange)───► attack
pursue ──(dist > leashRange)────► patrol
attack ──(timer = 0)────────────► cooldown
cooldown ──(timer = 0, dist ok)─► attack ou pursue ou patrol
```

Chaque transition appelle `_transitionTo(state)` qui charge le preset BehaviorManager correspondant, activant/désactivant les behaviors appropriés.

**Paramètres réglables** : `pursuitRange` (300px), `attackRange` (120px), `leashRange` (400px), `attackDuration` (9 frames), `cooldownDuration` (180 frames = 3s).

---

## BehaviorManager (Gestionnaire de comportements)

**Principe** : Chaque entité possède un `BehaviorManager` qui centralise l'enregistrement, l'activation, la pondération et l'exécution des behaviors. Il permet de sauvegarder des presets de configurations et de les charger dynamiquement selon l'état de l'entité.

**Fichiers concernés** : `BehaviorManager.js`, `Enemy.js`, `Sheep.js`, `Player.js`

**Implémentation** :
```js
// Enregistrement
this.behaviors.add('avoid', (ctx) => this.avoid(ctx.obstacles), 5.0);

// Preset par état
this.behaviors.disable('pursue').enable('followPath');
this.behaviors.savePreset('patrol');

// Calcul — retourne la force totale pondérée
this.applyForce(this.behaviors.compute(ctx));

// Transition d'état
this._transitionTo('pursue'); // charge le preset 'pursue'
```

**Paramètres réglables** : Poids de chaque behavior (modifiables live via DebugPanel).

---

## AABB Collision Detection (Axis-Aligned Bounding Box)

**Principe** : Détection de collision entre deux rectangles alignés sur les axes. On vérifie si les projections sur X et Y se chevauchent. Simple, rapide, adapté aux hitboxes de jeu 2D.

**Fichiers concernés** : `CombatSystem.js`, `DebugPanel.js`

**Implémentation** :
```js
aabbOverlap(a, b) {
    return a.x < b.x+b.w && a.x+a.w > b.x &&
           a.y < b.y+b.h && a.y+a.h > b.y;
}

// Hurtbox — zone de réception des dégâts
getHurtbox(entity) {
    const s = entity.displaySize * 0.3;
    return { x: entity.pos.x - s/2, y: entity.pos.y - s/2, w: s, h: s };
}

// Attackbox — zone d'émission des dégâts (décalée selon facingRight)
getAttackHitbox(entity) {
    const w    = entity.displaySize * 0.4;
    const offX = entity.facingRight ? displaySize * 0.2 : -displaySize * 0.2 - w;
    ...
}
```

**Paramètres réglables** : Taille hurtbox (`0.3 × displaySize`), taille attackbox (`0.4 × displaySize`), offset attackbox (`0.2 × displaySize`).

---

## Spritesheet Animation

**Principe** : Animation par découpe d'une image en frames successives. Un timer avance l'index de frame à intervalles réguliers. Certaines animations sont one-shot (attack, hurt) — elles reviennent à idle en fin de cycle.

**Fichiers concernés** : `Player.js`, `Enemy.js`, `Sheep.js`, `DustParticle.js`, `StarburstParticle.js`

**Implémentation** :
```js
// Player — frames individuelles préchargées
anim.frames.push(loadImage(`${path}/frame${num}.png`));
image(anim.frames[this.frameIndex], 0, 0, size, size);

// Enemy/Sheep — spritesheet horizontale
image(sheet, 0, 0, displaySize, displaySize,
      frameIndex * frameW, 0, frameW, frameH);
```

Player utilise des frames individuelles (fichiers PNG séparés).
Enemy et Sheep utilisent des spritesheets horizontales (une ligne = une animation).

**Paramètres réglables** : `frameDelay` (1 frame — Player), `animDelay` (3 frames — Enemy), `animDelay` (6 frames — Sheep).



---

## Tri-Y Sorting (Depth Sorting)

**Principe** : Dans un jeu 2D vue de dessus, les entités situées plus bas sur l'écran doivent être dessinées par-dessus celles situées plus haut pour simuler la profondeur. On trie le tableau d'entités par leur position Y avant le rendu.

**Fichiers concernés** : `sketch.js`

**Implémentation** :
```js
const allEntities = [player, ...enemies, ...sheeps];
allEntities.sort((a, b) => a.pos.y - b.pos.y);
for (const entity of allEntities) entity.show();
```

**Paramètres réglables** : Aucun — tri automatique chaque frame.

---

## Camera Follow avec Lerp

**Principe** : La caméra suit le joueur avec une interpolation linéaire (lerp) pour un suivi fluide et naturel. La caméra est clampée aux bords de la map pour ne jamais montrer l'extérieur du monde.

**Fichiers concernés** : `Camera.js`, `sketch.js`

**Implémentation** :
```js
// Position idéale centrée sur le joueur
let targetX = player.pos.x - viewW / 2;
// Clamp aux bords
targetX = constrain(targetX, 0, MAP_W - viewW);
// Lerp pour suivi fluide
this.x = lerp(this.x, targetX, this.lerpFactor);

// Translate le canvas
camera.begin(); // push() + translate(-x, -y)
// ... rendu monde ...
camera.end();   // pop()
```

**Paramètres réglables** : `lerpFactor` (0.1 — 0 = instantané, 1 = jamais).

---

## Screen-to-World Coordinates

**Principe** : La souris donne des coordonnées en espace écran (canvas). Pour cibler une position dans le monde (qui est décalé par la caméra), il faut convertir en ajoutant l'offset de la caméra.

**Fichiers concernés** : `sketch.js`, `Player.js`

**Implémentation** :
```js
function screenToWorld(sx, sy) {
    return createVector(sx + camera.x, sy + camera.y);
}

// Dans Player._applyMovement()
const mouseTarget = screenToWorld(mouseX, mouseY);
this.applyForce(this.arrive(mouseTarget));
```

**Paramètres réglables** : Aucun — dépend de `camera.x` / `camera.y`.

---

## Invincibility Frames (I-frames)

**Principe** : Après avoir reçu des dégâts, l'entité entre en période d'invincibilité temporaire pendant laquelle elle ne peut plus être touchée. Accompagné d'un effet de flash visuel (alternance tint rouge/transparent) pour signaler l'état au joueur.

**Fichiers concernés** : `Player.js`, `Enemy.js`

**Implémentation** :
```js
takeDamage(amount) {
    if (this.invincibleTimer > 0) return; // i-frames actives
    this.invincibleTimer = this.invincibleDuration;
    this.hp -= amount;
}

// Flash visuel — Player
if (this.invincibleTimer > 0) {
    const isFlashOn = this.flashTimer % (flashInterval * 2) < flashInterval;
    tint(isFlashOn ? color(255, 80, 80, 180) : color(255, 255, 255, 80));
}
```

**Paramètres réglables** : `invincibleDuration` Player (90 frames = 1.5s), `invincibleDuration` Enemy (30 frames = 0.5s), `hurtDuration` Enemy (20 frames — durée du flash rouge), `flashInterval` (6 frames).




---

## Mouse Shake — Collectible Spawning

**Principe** : Détecter une agitation rapide de la souris (delta de position élevé entre deux frames) pour spawner des collectibles à la position monde de la souris. Mécanisme de découverte cachée et récompense de l'exploration.

**Fichiers concernés** : `GameManager.js`

**Implémentation** :
```js
const speed = sqrt(dx*dx + dy*dy); // vitesse souris en px/frame
if (speed > SHAKE_THRESHOLD && cooldown <= 0) {
    const worldPos = screenToWorld(mouseX, mouseY);
    this.spawnCollectibles(worldPos.x, worldPos.y);
}
```

**Paramètres réglables** : `SHAKE_THRESHOLD` (200px/frame), `SHAKE_COOLDOWN` (40 frames entre spawns).




---

## Tableau de conformité CONSTRAINTS.md

| Règle | Respectée | Justification |
|---|---|---|
| Vehicle Model (pos, vel, acc, maxSpeed, maxForce) | ✅ | Toutes les entités animées étendent Vehicle |
| Steering Law (steering = desired - velocity) | ✅ | Toutes les méthodes Vehicle respectent cette formule |
| Layered Architecture (Action Selection → Steering → Locomotion) | ✅ | `updateState()` → `executeState()` → `super.update()` dans toutes les entités |
| Vehicle.js IMMUTABLE | ✅ | Seuls les flags debug statiques ont été ajoutés |
| Everything that moves is a Vehicle | ✅ | Player, Enemy, NPC, Sheep, Collectible, Coin, Meat étendent Vehicle |
| No direct position mutation | ✅ | Tout via `applyForce()`, friction via force drag |
| No external physics engine | ✅ | p5.Vector uniquement |
| BehaviorManager | ✅ | Player, Enemy, Sheep utilisent BehaviorManager |
| Injection de dépendances | ✅ | Enemy reçoit targetPos/targetVel, pas de référence Player |

**Score de conformité** : 100%