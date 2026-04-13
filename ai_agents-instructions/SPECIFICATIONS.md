# SPECIFICATIONS — Realm's Edge

## Concept

Jeu d'action/aventure en navigateur (p5.js). Le joueur incarne un héros qui doit éliminer tous les ennemis dans un temps limité en explorant une map en monde ouvert.

---

## Plateforme

Navigateur — p5.js + p5.sound. Aucun moteur physique externe.

---

## MVP — Éléments implémentés

### 0 — Joueur (entité)

- Spritesheet animée : `idle`, `run`, `attack`, `hurt`
- Sons attachés : déplacement, attaque, blessure
- Seek vers la souris avec arrive (ralentissement naturel)
- Reste dans les limites de la map via `boundaries()`
- Entre en collision avec les obstacles via `avoid()`
- Invincibilité temporaire après dégâts (flash rouge)

### 1 — Déplacement du joueur

- Seek sur la position de la souris dans l'espace monde (`screenToWorld`)
- `arrive()` pour ralentissement naturel à l'approche
- `avoid()` pour contournement des obstacles
- `boundaries()` pour rester dans MAP_W × MAP_H

### 2 — Attaque du joueur

- Attaque au clic gauche — animation one-shot
- Hitbox active sur les frames 3 et 4 de l'animation attack
- Les ennemis touchés perdent des PV
- Les ennemis à 0 PV meurent et disparaissent

### 3 — Ennemis (entité)

- Machine à états : `patrol` → `pursue` → `attack` → `cooldown`
- **Patrol** : `followPath()` sur les chemins Tiled + `avoid()` obstacles
- **Pursue** : `pursue()` vers le joueur + `avoid()` obstacles
- **Attack** : freinage via drag + timer d'attaque
- **Cooldown** : freinage via drag + timer de récupération
- Rayon de poursuite : 300px — rayon de laisse : 400px — rayon d'attaque : 120px
- Spritesheet animée : `idle`, `run`, `attack_right`, `attack_up_right`, `attack_up`, `attack_down`, `attack_down_right`
- Barre de vie affichée au-dessus du sprite
- Attaque à distance (lance) — le joueur perd 5 PV par coup
- Invincibilité temporaire après dégâts

### 4 — NPC : Sheep

- Classe `Sheep extends NPC extends Vehicle`
- **Graze** : flocking — `separate`, `align`, `cohesion`, `avoid`
- **Flee** : `flee()` vers la menace la plus proche + `separate` + `avoid`
- Détection de menace dans un rayon de 200px (joueur ou ennemi vivant)
- Spritesheet animée : `grass` (12 frames), `move` (4 frames)
- `edges()` sur la map (wrapping MAP_W × MAP_H) — non soumis aux limites du canvas
- 3 groupes de moutons spawned au démarrage

### 5 — Collectibles

- `Coin` : seek vers le joueur quand à moins de 150px — incrémente `player.coins`
- `Meat` : seek vers le joueur quand à moins de 150px — +5 HP au joueur
- Impulsion initiale aléatoire au spawn (`p5.Vector.random2D()`)
- Drag via `applyForce` pour décélération naturelle
- Architecture 3 couches : `updateState()` (scatter/attract) → `executeSteering()` → `super.update()`
- spawn des collectibles lorsque d'un mouse shake (3–7 coins + 20% chance de meat)

### 6 — Interface

#### HUD (dessiné hors caméra, superposé)

- Barre de vie joueur style Elsword (BigBar assets)
- Avatar joueur avec cadre ornemental doré
- Compteur ennemis tués / total (banner ennemi)
- Compteur de pièces (banner gold)
- Icône **Info** — ouvre le tutoriel, met le jeu en pause
- Icône **Parameter** — ouvre le panel son (music + SFX sliders)

#### Écrans

- **Menu** : écran de démarrage
- **Game Over** : joueur mort ou timer à 0 — score, rejouer, menu
- **Victoire** : tous les ennemis éliminés — score, rejouer
- **Tutoriel** : 4 onglets (Move, Attack, Collectibles, World)

#### Panels Debug (affiché avec la touche `d`)

- **Panel gauche** — Entités : sliders `maxSpeed` + poids behaviors pour Player, Enemy (tous), Sheep (tous) + add/remove sheep
- **Panel droit** — Debug visuel : toggles par behavior (`avoid`, `followPath`, `boundaries`, `separate`, `cohesion`, `align`) + obstacles colliders + hitboxes AABB + Vehicle.debug global
- Style glassmorphism — fond flouté, texte blanc, font Rajdhani/Exo 2

#### Timer

- 3 minutes (10800 frames à 60fps)
- Affiché en haut au centre du canvas
- Rouge dans les 30 dernières secondes
- Victoire si tous les ennemis morts avant la fin

---

## Architecture technique

### Hiérarchie

```
Vehicle (immutable)
├── Player
├── Enemy
├── NPC
│   └── Sheep
└── Collectible
    ├── Coin
    └── Meat
```

### Systèmes

| Système | Responsabilité |
|---|---|
| `GameManager` | Timer, win/lose, restart, spawn collectibles, mouse shake |
| `CombatSystem` | Hitboxes AABB, dégâts, mort ennemis, spawn particules |
| `Camera` | Lerp suivi joueur, clamp bords map |
| `GameMap` | Parse Tiled JSON, obstacles, patrol paths, rendu layers |
| `BehaviorManager` | Gestion behaviors par entité, presets, poids, enable/disable |
| `SoundManager` | SFX joueur/ennemi/UI, musique fond, volumes réglables |
| `DebugPanel` | Panel HTML/CSS glassmorphism, sliders, toggles debug flags |


## Assets

| Type | Chemin |
|---|---|
| Joueur (Pirate) | `assets/characters/Pirate/` |
| Ennemi (Lancer) | `assets/characters/Lancer/` |
| Mouton | `assets/characters/Sheep/` |
| Map | `assets/world/map.json` + layers PNG |
| UI | `assets/ui/` (banners, bars, icons, fonts, avatar) |
| Sons | `assets/sounds/` |
| Particules | `assets/particle FX/` |