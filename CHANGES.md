# CHANGES.md

## Fichiers créés
- `src/entities/Enemy.js` : Classe Enemy étendant Vehicle avec comportements de patrouille et attaque.

## Fichiers modifiés
- `src/utils/GameMap.js` : Ajout du parsing du layer "paths" et méthode getPatrolPath().
- `src/sketch.js` : Correction de l'initialisation du patrolPath après parse().

## Justification des comportements

### Patrouille (path following + arrival)
- Utilise arrive() pour se diriger vers les points du chemin récupéré depuis map.json (layer "paths").
- Hystérésis (50px) pour éviter les oscillations autour des points cibles.
- Combine avec avoid() pour éviter les obstacles pendant les déplacements.
- Poids réglable (poidsArrive = 1.0, poidsAvoid = 3.0) pour prioriser l'évitement.

### Détection du joueur
- Rayon de détection (200px) : passe en mode attaque si joueur dedans.
- Rayon de retour (300px) : reprend patrouille si joueur sort.
- En attaque : se tourne vers le joueur, animation selon l'angle (8 directions simplifiées à 5).

### Animations
- Spritesheets une ligne : idle (12 frames), run (6 frames), attaques (3 frames chacune).
- Animation d'attaque choisie automatiquement selon l'angle vers le joueur.
- Flip horizontal si direction gauche (vel.x < 0).

### Poids des forces
- poidsArrive : contrôle l'intensité de l'arrivée aux points (1.0 = normal).
- poidsAvoid : contrôle l'évitement d'obstacles (3.0 = prioritaire).
- Effet : permet de régler facilement depuis DebugPanel pour équilibrer les comportements.

### Debug
- Rayon de détection (jaune).
- Rayon de retour (rouge).
- Chemin de patrouille (vert, lignes).
- Point cible actuel (magenta, cercle).
- Vecteurs de force via drawVector() (hérité de Vehicle).

## Cause du problème identifiée
- Le patrolPath était appelé dans le constructeur de Enemy, avant que gameMap.parse() soit exécuté dans setup().
- Résultat : patrolPath restait vide, l'ennemi ne bougeait pas, et restait à sa position initiale (1600,1700), potentiellement hors de la zone visible du canvas.

## Correction appliquée
- Déplacement de l'initialisation de enemy.patrolPath dans setup(), après gameMap.parse().
- Cela garantit que le chemin de patrouille est correctement chargé avant utilisation.

## Pourquoi cette correction est la bonne
- Respecte l'ordre d'exécution de p5.js : preload() pour le chargement, setup() pour l'initialisation.
- Assure que les données de la map sont parsées avant d'être utilisées.
- Permet à l'ennemi de suivre le chemin et de se déplacer, rendant son affichage visible lors des tests.

## Validation
- [x] CONSTRAINTS.md respecté ?
- [x] SPECIFICATIONS.md respecté ?
- [x] Vehicle.js non modifié ?
- [x] Tous les mouvements passent par applyForce ?

---

## Session du 2026-04-08 — Mise à jour Enemy.js avec machine à états et corrections

### Fichier : Enemy.js
- Ce qui a changé : Ajout d'une machine à états finis (patrol, pursue, attack, cooldown) pour gérer les comportements de patrouille, détection du joueur, attaque et récupération. Implémentation de poids des forces (weightArrive=1.0, weightPursue=1.0, weightAvoid=3.0) pour équilibrer les comportements composés. Ajout d'animations spritesheet avec calcul automatique des frames (idle:12, run:6, attacks:3 chacun). Intégration du debug visuel (rayons de détection/retour, chemin, cible, vecteurs de force).
- Justification : Respecte la layered architecture (Action Selection → Steering → Locomotion) en séparant updateState(), executeState(), et super.update(). Utilise uniquement les méthodes Vehicle (arrive, pursue, avoid) via applyForce(), sans modifier Vehicle.js. Permet des comportements émergents réalistes et réglables.

### Fichier : GameMap.js
- Ce qui a changé : Extension du parsing pour extraire les polylines du layer "paths" en tableaux de p5.Vector, stockage dans patrolPaths[], ajout de getPatrolPath(index) pour récupérer un chemin spécifique.
- Justification : Permet plusieurs chemins de patrouille dans la map Tiled, facilitant la différenciation des ennemis. Respecte la structure JSON de Tiled et optimise le stockage des chemins pour une réutilisation efficace.

### Fichier : sketch.js
- Ce qui a changé : Déplacement de l'initialisation de enemy.patrolPath dans setup() après gameMap.parse(), positionnement initial de l'ennemi au premier point du chemin pour cohérence.
- Justification : Corrige le timing d'initialisation pour éviter un patrolPath vide, respectant le cycle p5.js (preload → setup → draw). Assure la visibilité immédiate de l'ennemi et évite les bugs de position hors viewport.

### Poids des forces utilisés et leur effet
- weightArrive (1.0) : Contrôle l'intensité de l'arrivée aux points de patrouille ; valeur normale permet un arrêt naturel sans oscillation excessive.
- weightPursue (1.0) : Pondère la poursuite du joueur ; équilibré pour une approche fluide sans dépassement.
- weightAvoid (3.0) : Priorise l'évitement des obstacles ; valeur élevée assure la sécurité pendant les déplacements, évitant les collisions.

### Paramètres réglables et leur impact
- attackRange (120px) : Distance pour déclencher l'attaque ; impacte l'agressivité de l'ennemi (plus petit = plus agressif).
- pursuitRange (300px) : Rayon de poursuite ; définit quand l'ennemi cesse de patrouiller (plus grand = détection précoce).
- leashRange (400px) : Limite de retour à la patrouille ; empêche l'ennemi de s'éloigner trop (plus grand = plus persévérant).
- attackDuration (9 frames), cooldownDuration (180 frames) : Timers pour l'attaque et récupération ; règlent la fréquence des attaques (plus courts = plus rapide).
- maxSpeed, maxForce : Hérités de Vehicle, ajustables pour vitesse globale (plus élevés = plus rapide/réactif).

---

## Session du 2026-04-09 — Création des systèmes de combat, collectibles et UI

### Fichier : CombatSystem.js
- Ce qui a changé : Création d'une classe gérant les collisions attaque/défense entre joueur et ennemi, spawn de collectibles à la mort de l'ennemi, gestion des particules de mort (DustParticle), et debug des hitboxes/hurtboxes.
- Justification : Respecte SPECIFICATIONS.md §2-3 (attaque joueur à distance, attaque ennemi à distance, mort et disparition des ennemis). Implémente la logique de combat sans modifier Vehicle.js, utilisant des AABB pour les collisions.

### Fichier : Collectible.js
- Ce qui a changé : Classe de base pour les objets ramassables étendant Vehicle, avec seek vers le joueur quand proche, vélocité initiale aléatoire, friction pour ralentissement, et méthode onCollect() abstraite.
- Justification : Respecte SPECIFICATIONS.md §5 (collectables se déplacent vers le joueur quand proche). Utilise Vehicle pour le mouvement (seek), assurant cohérence avec l'architecture.

### Fichier : Coin.js
- Ce qui a changé : Sous-classe de Collectible pour les pièces d'or, spawn en groupe (2-6) à la mort de l'ennemi, incrémente player.coins, affichage avec debug attractRadius.
- Justification : Respecte SPECIFICATIONS.md §5 (objet collectable coin). Hérite de Collectible pour réutiliser la logique de mouvement et collecte.

### Fichier : Meat.js
- Ce qui a changé : Sous-classe de Collectible pour la viande, spawn 1 à la mort de l'ennemi, redonne 5 HP au joueur, affichage avec debug attractRadius.
- Justification : Respecte SPECIFICATIONS.md §5 (objet collectable meat qui redonne vie). Hérite de Collectible pour cohérence.

### Fichier : DustParticle.js
- Ce qui a changé : Classe de particule de mort pour ennemis, spritesheet horizontal 8 frames, animation non-bouclante, taille ajustable, preload partagé.
- Justification : Améliore l'expérience visuelle à la mort des ennemis (SPECIFICATIONS.md §3). N'étend pas Vehicle car statique, optimisant les performances.

### Fichier : StarburstParticle.js
- Ce qui a changé : Classe de particule d'apparition, spritesheet 7 lignes × 8 colonnes, parcourt toutes les lignes une fois, preload partagé.
- Justification : Prévu pour les collectibles (non activé dans CombatSystem), améliore l'immersion visuelle sans impacter les performances.

### Fichier : Camera.js
- Ce qui a changé : Classe de caméra suivant le joueur avec lerp pour lissage, clamp aux bords de la map, méthodes begin()/end() pour translate du canvas.
- Justification : Permet un rendu centré sur le joueur dans une map plus grande que l'écran, essentiel pour SPECIFICATIONS.md (déplacement joueur, monde ouvert).

### Fichier : HUD.js
- Ce qui a changé : Interface utilisateur superposée (barre de vie joueur style Elsword avec avatar, compteur ennemis, compteur pièces), utilise images assets pour bannières et barres.
- Justification : Respecte SPECIFICATIONS.md §6 (HUD avec barres de vie, compteurs). Dessiné hors caméra pour superposition propre.

### Fichier : style.css
- Ce qui a changé : Styles CSS pour le HTML (background image, canvas centré avec ombre, nuages fixes positionnés aux bords du canvas).
- Justification : Améliore l'esthétique globale (SPECIFICATIONS.md §6 écrans), prépare pour les écrans menu/pause/victoire.

### Fichier : assets/ui/Human Avatars/Avatar_Sword_Hero.png
- Ce qui a changé : Nouvel asset image ajouté pour l'avatar du joueur dans le HUD.
- Justification : Nécessaire pour HUD.js, complète les assets UI (SPECIFICATIONS.md §6).

### Paramètres réglables et leur impact
- CombatSystem : attractRadius (150px) pour collectibles — plus grand = collecte plus facile ; hitbox sizes (0.4/0.3 displaySize) — ajustent la précision des attaques.
- Collectible : friction (0.92) — contrôle le ralentissement initial ; maxSpeed variable selon distance — influence la vitesse d'attraction.
- DustParticle : animDelay (3 frames) — rythme l'animation de mort ; displaySize — taille de la particule.
- Camera : lerpFactor (0.1) — plus élevé = suivi plus fluide mais moins réactif.
- HUD : positions et tailles des éléments — ajustables pour responsive design.

### Modifications mineures du 2026-04-09 (conformité contraintes)
- DustParticle.js : Ajout d'un commentaire de justification pour l'exception (particule statique sans mouvement).
- StarburstParticle.js : Ajout d'un commentaire de justification pour l'exception (animation spritesheet sans physique).
- Justification : Respecte CONSTRAINTS.md §4 (hard constraints) en documentant les exceptions pour les particules visuelles stationnaires.

---

## Session du 2026-04-09 — Amélioration de la visibilité de la healthbar Enemy

### Fichier : Enemy.js
- Ce qui a changé : Ajustement de la position verticale de la healthbar (offset réduit de -15 à -5 pixels au-dessus du centre du sprite, et calcul basé sur displaySize/4 au lieu de /2 pour une position plus basse) ; ajout d'un contour noir épais (strokeWeight=2) autour de la barre avant le contour blanc fin pour améliorer le contraste visuel.
- Justification : Respecte SPECIFICATIONS.md §6 (HUD avec barres de vie ennemis affichées au-dessus du canvas). Le contour noir assure une meilleure visibilité contre le fond du jeu, facilitant la perception de l'état de santé de l'ennemi pendant le gameplay.
- Paramètres réglables : Aucun nouveau paramètre ajouté ; les valeurs d'offset (-5) et d'épaisseur de contour (2) sont des constantes UI fixes pour cohérence visuelle.