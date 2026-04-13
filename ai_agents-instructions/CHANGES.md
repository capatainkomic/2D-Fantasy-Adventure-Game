Lis attentivement CONSTRAINTS.md et SPECIFICATIONS.md avant de faire quoi que ce soit.

## RÈGLE ABSOLUE
Ne jamais écraser le contenu existant de CHANGES.md.
Tu dois AJOUTER les nouvelles modifications à la suite du contenu existant.
Si CHANGES.md n'existe pas encore, crée-le. Sinon, append uniquement.

## Ta mission : mettre à jour CHANGES.md

Analyse tous les fichiers du projet et identifie ce qui a changé depuis la dernière entrée dans CHANGES.md.
Ajoute une nouvelle section datée en bas du fichier avec le format suivant :

---
## Session du [date] — [titre court décrivant les changements]

### Fichier : NomDuFichier.js
- Ce qui a changé : description précise et fonctionnelle et technique des modifications
- Justification : pourquoi cette décision a été prise (contrainte technique, gameplay, respect de CONSTRAINTS.md)
- Paramètres réglables : liste des valeurs ajustables et leur impact sur le jeu

---

## Règles de rédaction
- Sois précis et technique — pas de descriptions vagues comme "amélioration du code"
- Justifie chaque décision en référençant CONSTRAINTS.md ou SPECIFICATIONS.md quand pertinent
- Si une force steering est utilisée, documente son poids et son rôle dans la composition
- Si un paramètre est réglable (timer, seuil, distance), indique sa valeur actuelle et son effet
- Ne documente pas ce qui n'a pas changé
- Ne modifie aucun fichier .js — CHANGES.md uniquement

## VALIDATION avant d'écrire
- [ ] J'ai lu CONSTRAINTS.md et SPECIFICATIONS.md
- [ ] Le contenu existant de CHANGES.md est préservé
- [ ] Chaque changement est justifié techniquement
- [ ] Aucun fichier .js n'a été modifié

---

## Session du 2026-04-08 — Création initiale Enemy.js et corrections GameMap/sketch

### Fichier : Enemy.js
- Ce qui a changé : Création de la classe Enemy étendant Vehicle avec comportements de patrouille et attaque.
- Justification : Respecte SPECIFICATIONS.md §3 (ennemi patrouille, attaque, évite obstacles). Utilise `arrive()` et `avoid()` via `applyForce()` conformément à CONSTRAINTS.md.
- Paramètres réglables : `poidsArrive` (1.0), `poidsAvoid` (3.0), rayon détection (200px), rayon retour (300px).

### Fichier : GameMap.js
- Ce qui a changé : Ajout du parsing du layer "paths" et méthode `getPatrolPath()`.
- Justification : Permet plusieurs chemins de patrouille dans la map Tiled pour différencier les ennemis.
- Paramètres réglables : Aucun — parsing statique du JSON Tiled.

### Fichier : sketch.js
- Ce qui a changé : Correction de l'initialisation de `enemy.patrolPath` après `gameMap.parse()`.
- Justification : Corrige le timing d'initialisation (preload → setup → draw de p5.js) — patrolPath était vide car appelé avant parse().
- Paramètres réglables : Aucun.

---

## Session du 2026-04-08 — Machine à états Enemy et animations

### Fichier : Enemy.js
- Ce qui a changé : Ajout machine à états finis (`patrol`, `pursue`, `attack`, `cooldown`). Poids des forces (`weightArrive=1.0`, `weightPursue=1.0`, `weightAvoid=3.0`). Animations spritesheet (`idle:12`, `run:6`, `attacks:3` frames). Debug visuel (rayons détection/retour, chemin, vecteurs).
- Justification : Respecte layered architecture CONSTRAINTS.md — `updateState()` / `executeState()` / `super.update()`. Utilise uniquement les méthodes Vehicle via `applyForce()`.
- Paramètres réglables : `attackRange` (120px), `pursuitRange` (300px), `leashRange` (400px), `attackDuration` (9 frames), `cooldownDuration` (180 frames), `maxSpeed`, `maxForce`.

### Fichier : GameMap.js
- Ce qui a changé : Extension parsing pour extraire polylines du layer "paths" en `p5.Vector[]`, stockage dans `patrolPaths[]`, ajout `getPatrolPath(index)`.
- Justification : Permet plusieurs chemins différenciés par ennemi.
- Paramètres réglables : Aucun.

### Fichier : sketch.js
- Ce qui a changé : Positionnement initial ennemi au premier point du chemin après parse().
- Justification : Cohérence visuelle — ennemi visible dès le démarrage.
- Paramètres réglables : Aucun.

---

## Session du 2026-04-09 — Systèmes combat, collectibles, caméra et HUD

### Fichier : CombatSystem.js
- Ce qui a changé : Création — collisions AABB attaque/défense joueur-ennemi, spawn collectibles à la mort, particules `DustParticle`, debug hitboxes.
- Justification : SPECIFICATIONS.md §2-3 — attaque joueur distance, attaque ennemi distance, mort et disparition.
- Paramètres réglables : Hitbox sizes (`0.4` / `0.3` × `displaySize`).

### Fichier : Collectible.js
- Ce qui a changé : Création — `Vehicle` seek vers joueur, vélocité initiale aléatoire, friction, `onCollect()` abstraite.
- Justification : SPECIFICATIONS.md §5 — collectables se déplacent vers joueur. Utilise Vehicle pour cohérence architecture.
- Paramètres réglables : `attractRadius` (150px), `friction` (0.92), `maxSpeed` variable selon distance.

### Fichier : Coin.js / Meat.js
- Ce qui a changé : Création — sous-classes Collectible. Coin incrémente `player.coins`. Meat redonne 5 HP.
- Justification : SPECIFICATIONS.md §5.
- Paramètres réglables : Heal amount Meat (5 HP).

### Fichier : Camera.js
- Ce qui a changé : Création — lerp suivi joueur, clamp bords map, `begin()`/`end()` translate canvas.
- Justification : Map plus grande que l'écran, rendu centré sur joueur.
- Paramètres réglables : `lerpFactor` (0.1) — plus élevé = suivi plus réactif.

### Fichier : HUD.js
- Ce qui a changé : Création — barre de vie joueur style Elsword, avatar ornemental, compteur ennemis, compteur pièces. Dessiné hors caméra.
- Justification : SPECIFICATIONS.md §6 HUD.
- Paramètres réglables : Positions et tailles des éléments UI.

---

## Session du 2026-04-09 — Corrections healthbar Enemy

### Fichier : Enemy.js
- Ce qui a changé : Position verticale healthbar ajustée (`displaySize/4` au lieu de `/2`). Contour noir épais (`strokeWeight=2`) + contour blanc fin pour contraste.
- Justification : Meilleure lisibilité en jeu — SPECIFICATIONS.md §6 barres de vie ennemis.
- Paramètres réglables : Aucun nouveau.

---

## Session du 2026-04-13 — Refactoring complet Phase 1 : paradigme forces

### Fichier : Collectible.js
- Ce qui a changé : `this.pos.x += random()` remplacé par `this.vel = p5.Vector.random2D().mult(random(3,6))`. `this.vel.mult(friction)` remplacé par drag via `applyForce(this.vel.copy().mult(-0.08))`. Suppression de la propriété `friction`.
- Justification : CONSTRAINTS.md — mutation directe de `pos` et `vel` interdite. Tout changement de mouvement passe par `applyForce()`.
- Paramètres réglables : Coefficient drag (`0.08`).

### Fichier : Sheep.js
- Ce qui a changé : `this.vel.mult(0.95)` dans `executeGraze()` remplacé par `applyForce(this.vel.copy().mult(-weightDrag))`. Ajout propriété `weightDrag = 0.05`.
- Justification : CONSTRAINTS.md — mutation vel interdite.
- Paramètres réglables : `weightDrag` (0.05) — amortissement naturel du troupeau.

### Fichier : Enemy.js
- Ce qui a changé : `this.vel.mult(0.8)` dans `executeAttack()` et `this.vel.mult(0.9)` dans `executeCooldown()` remplacés par drags via `applyForce`. Ajout `weightAttackDrag = 0.2` et `weightCooldownDrag = 0.1`. Ajout méthode `reset(x, y)`.
- Justification : CONSTRAINTS.md — mutation vel interdite.
- Paramètres réglables : `weightAttackDrag` (0.2), `weightCooldownDrag` (0.1).

### Fichier : Player.js
- Ce qui a changé : Ajout méthode `reset(x, y)` encapsulant la réinitialisation complète. Suppression commentaires décoratifs `=====`.
- Justification : CONSTRAINTS.md — mutation directe de `pos` depuis `sketch.js` interdite.
- Paramètres réglables : Aucun nouveau.

### Fichier : sketch.js
- Ce qui a changé : `_restartGame()` utilise `player.reset(1600, 1600)` et `enemies[i].reset(x, y)` au lieu de muter `pos`, `vel`, `hp`, `state` directement.
- Justification : CONSTRAINTS.md — encapsulation des mutations dans les entités.
- Paramètres réglables : Spawn position joueur (1600, 1600).

---

## Session du 2026-04-13 — Refactoring Phase 2 : architecture 3 couches

### Fichier : Player.js
- Ce qui a changé : Ajout `updateState()` séparant la décision d'état de l'animation. `update()` restructuré : `updateState()` → `_applyMovement()` → `super.update()` → `_updateAnimation()`. `_updateAnimation()` ne modifie plus `this.state` — lit seulement l'état décidé par `updateState()`.
- Justification : CONSTRAINTS.md layered architecture — couche 1 Action Selection séparée des couches 2 et 3.
- Paramètres réglables : Aucun nouveau.

### Fichier : Collectible.js
- Ce qui a changé : Ajout `updateState(player)` décidant de `scatter` ou `attract`. Ajout `executeSteering(player)` appliquant les forces. `update()` restructuré en 3 couches.
- Justification : CONSTRAINTS.md layered architecture.
- Paramètres réglables : `attractRadius` (150px).

---

## Session du 2026-04-13 — Refactoring Phase 3 : hiérarchie et injection dépendances

### Fichier : NPC.js (nouveau)
- Ce qui a changé : Création classe mère abstraite pour tous les PNJ. Porte `fleeRadius`, `detectClosestThreat(threats)`, `isThreatened(threats)`.
- Justification : SPECIFICATIONS.md hiérarchie `NPC extends Vehicle`. Évite duplication entre futurs PNJ.
- Paramètres réglables : `fleeRadius` (200px par défaut, surchargeable).

### Fichier : Sheep.js
- Ce qui a changé : Étend `NPC` au lieu de `Vehicle`. `updateState()` utilise `this.isThreatened()`. `executeFlee()` utilise `this.detectClosestThreat()`. Suppression de la logique dupliquée de détection.
- Justification : CONSTRAINTS.md hiérarchie — réutilisation du comportement commun NPC.
- Paramètres réglables : `fleeRadius` (200px).

### Fichier : Enemy.js
- Ce qui a changé : Suppression `this.player` et `this.gameMap` du constructeur. `update()` reçoit `(obstacles, targetPos, targetVel, targetIsDead)`. `executePursue()` construit `{ pos, vel }` minimal pour `pursue()`. `_transitionTo(state)` centralise les transitions avec `loadPreset()`.
- Justification : CONSTRAINTS.md Law of Demeter — Enemy ne connaît pas Player, seulement des données.
- Paramètres réglables : Aucun nouveau.

### Fichier : sketch.js
- Ce qui a changé : `new Enemy(0, 0)` au lieu de `new Enemy(0, 0, gameMap, player)`. Boucle update séparée : `player.update()` + `enemy.update(obstacles, player.pos, player.vel, player.isDead())`.
- Justification : Injection de dépendances — découplage Enemy/Player.
- Paramètres réglables : Aucun nouveau.

---

## Session du 2026-04-13 — Refactoring Phase 4 : BehaviorManager

### Fichier : BehaviorManager.js (nouveau)
- Ce qui a changé : Création — API `add/remove/enable/disable/setWeight/compute/savePreset/loadPreset/list`. `compute(context)` itère les behaviors actifs, applique les poids, retourne la force totale.
- Justification : SPECIFICATIONS.md panel debug — poids modifiables en live. Centralise la gestion des behaviors composés.
- Paramètres réglables : Poids par behavior, activation individuelle, presets nommés.

### Fichier : Enemy.js
- Ce qui a changé : 5 behaviors enregistrés (`followPath`, `pursue`, `avoid`, `attackDrag`, `cooldownDrag`). 4 presets (`patrol`, `pursue`, `attack`, `cooldown`). `executeState()` appelle `this.behaviors.compute(ctx)`.
- Justification : Composition de forces via BehaviorManager — poids exposés au DebugPanel.
- Paramètres réglables : Tous les poids via `behaviors.setWeight()`.

### Fichier : Sheep.js
- Ce qui a changé : 6 behaviors enregistrés. 2 presets (`graze`, `flee`). `executeState()` appelle `this.behaviors.compute(ctx)`.
- Justification : Idem Enemy — composition et debug live.
- Paramètres réglables : `weightSeparate`, `weightAlign`, `weightCohesion`, `weightFlee`, `weightAvoid`, `weightDrag`.

### Fichier : Player.js
- Ce qui a changé : `_initBehaviors()` enregistre `arrive`, `avoid`, `boundaries`. `_applyMovement()` appelle `this.behaviors.compute(ctx)`.
- Justification : Cohérence architecturale — Player exposé au DebugPanel.
- Paramètres réglables : Poids `arrive`, `avoid`, `boundaries`.

---

## Session du 2026-04-13 — Refactoring Phase 5 : GameManager et structure

### Fichier : GameManager.js (nouveau)
- Ce qui a changé : Extraction de `sketch.js` — timer, win/lose, restart, spawn collectibles, détection mouse shake. Constantes nommées (`TIMER_DURATION`, `SHAKE_THRESHOLD`, etc.). Injection de dépendances dans le constructeur.
- Justification : CONSTRAINTS.md clean code — `sketch.js` ne doit contenir que les callbacks p5. Single Responsibility Principle.
- Paramètres réglables : `TIMER_DURATION` (10800 frames), `SHAKE_THRESHOLD` (200px/frame), `SHAKE_COOLDOWN` (40 frames), `COIN_SPAWN_MIN/MAX` (3-7), `MEAT_SPAWN_CHANCE` (0.2).

### Fichier : sketch.js
- Ce qui a changé : Réduit de ~316 à ~160 lignes. Ne contient plus que `preload()`, `setup()`, `draw()`, `mousePressed()`, `mouseReleased()`, `keyPressed()`, `windowResized()`, `screenToWorld()`, `updateCanvasPosition()`.
- Justification : Séparation des responsabilités.
- Paramètres réglables : Aucun — délégués à GameManager.

### Fichier : CombatSystem.js
- Ce qui a changé : Constructeur reçoit `onEnemyDeath` callback. Spawn collectibles via callback à la mort d'un ennemi. `updateParticles()` utilise `splice` pour mutation en place.
- Justification : Découplage CombatSystem/GameManager. `collectibles` référence partagée préservée.
- Paramètres réglables : Callback `onEnemyDeath`.

---

## Session du 2026-04-13 — DebugPanel : glassmorphism et améliorations UI

### Fichier : DebugPanel.js (nouveau)
- Ce qui a changé : Création panel HTML/CSS injecté dynamiquement. Panel gauche (entités + sliders) et panel droit (toggles debug visuel). Touche `d` via `window.addEventListener`. Positionnement via variables CSS `--canvas-left` / `--canvas-w`. Style glassmorphism — `rgba(8,12,28,0.50)`, `backdrop-filter: blur(32px)`, texte blanc, font Rajdhani/Exo 2. Avatars 54px. Sliders propagés à tous les ennemis/sheep. `+ Sheep` / `- Sheep` avec spawn sur la map.
- Justification : SPECIFICATIONS.md §6 panels debug. Positionnement cohérent avec les nuages CSS.
- Paramètres réglables : Largeur panels (420px), blur (32px), taille avatars (54px).

### Fichier : Vehicle.js
- Ce qui a changé : Flags debug individuels ajoutés (`debugAvoid`, `debugWander`, `debugPath`, `debugPursue`, `debugBoundaries`, `debugSeparate`, `debugCohesion`, `debugAlign`). Debug visuel enrichi dans chaque behavior : `avoid` (vecteurs jaune/violet + zones), `wander` (cercle + points + ligne jaune), `followPath` (chemin gris épais + ligne noire), `pursue` (flèche rouge + cercle vert), `boundaries` (rectangles blanc/rouge), `separate` (cercle + flèches répulsion), `cohesion` (cercle + point centre + flèche), `align` (cercle pointillé + flèches voisins + flèche résultante). `edges()` adapté à MAP_W/MAP_H.
- Justification : Debug par behavior isolé — DebugPanel active chaque flag indépendamment sans activer Vehicle.debug global.
- Paramètres réglables : Flags statiques `Vehicle.debugXxx`.

---

## Session du 2026-04-13 — HUD : icône parameter et panel son

### Fichier : HUD.js
- Ce qui a changé : Ajout icône `parameter.png` à gauche de l'icône info avec scale up au hover. Toggle `_paramPanelOpen`. `drawParamPanel()` affiche wood banner avec deux rows Music et SFX — slider custom p5 (track bois sombre, fill doré, poignée dorée), icône son + croix rouge si volume = 0. Interaction souris sur le slider en temps réel (`mouseIsPressed`). Chargement `soundIcon`, `crossIcon`, `woodBanner` dans `preload()`.
- Justification : SPECIFICATIONS.md §6 panel paramétrage son SFX + musique.
- Paramètres réglables : Volumes music (`_musicVolume`) et SFX (`_sfxVolume`) via sliders 0–1.

### Fichier : sketch.js
- Ce qui a changé : `isParamIconClicked()` branché dans `mousePressed()` avant le clic info.
- Justification : Priorité de gestion des clics UI.
- Paramètres réglables : Aucun.

### Fichier : Sheep.js
- Ce qui a changé : Ajout `this.edges()` dans `update()` après `super.update()`.
- Justification : SPECIFICATIONS.md §4 — NPC non soumis aux limites du canvas mais doivent wrapper sur la map. `edges()` utilise maintenant MAP_W/MAP_H.
- Paramètres réglables : Aucun.