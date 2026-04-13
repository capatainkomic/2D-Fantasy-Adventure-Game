# ⚔️ The Adventure of The Sword Hero


<p align="center">
  <img src="./assets/images/hero_running_banner.png" alt="Sword Hero Running" width="100%">
</p>



## 🌟 Introduction

Les steering behaviors sont un ensemble de techniques introduites par Craig Reynolds à la fin des années 1980 pour simuler le déplacement autonome de personnages virtuels. Ces comportements permettent à des agents (appelés autonomous characters) de se déplacer de manière réaliste dans un environnement, sans suivre de trajectoire prédéfinie.   

Le projet est né dans le but d’implémenter certaines de ces techniques à travers un jeu 2D ludique. 

<br>

## 🛠️ Environnement de Développement
* **IDE** : `VS Code` 
* **Modèles IA utilisés** : `Claude 3.5 Sonnet` & `Claude 3 Haiku`
* **Librairie Graphique** : `p5.js`

<br>


## 🎮 Description du jeu 
**The Adventure of The Sword Hero** est un jeu d'aventure et d'action 2D où vous incarnez un héros solitaire. Votre mission est simple mais périlleuse : explorer la carte et éliminer tous les ennemis pour triompher.

### Contrôles 

<table border="0">
  <tr>
    <td width="25%" align="center">
      <img src="./assets/images/how_to_move.gif" width="150"><br>
      <b>Deplacement du héro</b><br>Contrôle à l'aide de la souris 
    </td>
    <td width="25%" align="center">
      <img src="./assets/images/player_attack.gif" width="250"><br>
      <b>Attaque contre les ennemis</b><br>Contrôle à l'aide du clique gauche
    </td>
    <td width="25%" align="center">
      <img src="./assets/images/mouse_shake.gif" width="150"><br>
      <b>Resource Spawning</b><br>Secouez la souris pour générer des <i>pièces</i> et de la <i>Viande</i>.
    </td>
    <td width="25%" align="center">
      <img src="./assets/images/gold_stone_img.png" width="150"><br>
      <b>Obstacles</b><br>Eviter les obstacles sur votre chemin.
    </td>
  </tr>
</table>

<br>


### HUD & Interactive Elements
L'interface affiche les données vitales du jeu en haut de la page.

| Élément | Visuel | Description |
| :--- | :---: | :--- |
| **Barre de vie du joueur** | <img src="./assets/images/player_healthbar_img.png" width="250"> | Suivi des points de vie du héros. |
| **Timer** | <img src="./assets/images/timer_img.png" width="250"> | Compte à rebours. |
| **Compteurs** | <img src="./assets/images/counters_img.png" width="250"> | Compteur de pièces d'or et compteur d'ennemis eliminés |
| **Info popup** | <img src="./assets/images/info pop up .gif" width="250"> | Accès instantané au tutoriel et règles du jeu |
| **Settings** | <img src="./assets/images/sound_setting_img.png" width="250"> | Panel de configuration pour le ajuster le volume de l'audio  |

<br>

### Système de Debug Avancé 
Pour les besoins du cours, un système de debug complet a été intégré. Il permet d'analyser les vecteurs de force qui dictent les mouvements des entités.

<p align="center">
  <img src="./assets/images/debug_panel_view_1.png" width="200">
  <img src="./assets/images/debug_panel.gif" width="600" alt="Debug Transition">
  <img src="./assets/images/debug_panel_view_2.png" width="200">
</p>

<p align="center">Appuyez sur la touche <b>'D'</b> pour afficher les pannel de debug</p>


<br>


---


<br>

## 🧠 Le Laboratoire des Steering Behaviors

Le cœur du projet repose sur l'implémentation des algorithmes de **Craig Reynolds**. Chaque entité possède un "cerveau" composé de plusieurs forces cumulées qui dictent son comportement de manière organique.

### Analyse des Entités

<table border="0">
  <tr>
    <td><img src="./assets/ui/Human Avatars/Avatar_Sword_Hero.png" width="300"></td>
    <td>
      <b>Le Héros</b><br>
      <ul>
        <br>
        <li><b>Seek + Arrive</b> : Se dirige vers le curseur et ralentit naturellement à l'approche du point cible.</li>
        <li><b>Obstacle Avoidance</b> : Calcule des forces de répulsion pour contourner les pierres d'or.</li>
        <li><b>Boundaries</b> : Reste confiné à l'intérieur des limites de la carte.</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td align="center"><img src="./assets/ui/Human Avatars/Avatar_Enemy.png" width="200"></td>
    <td>
      <b>L'Ennemi</b><br>
      <br>
      <ul>
        <li><b>Path Following</b> : Suit un chemin de patrouille prédéfini tant qu'aucune cible n'est détectée.</li>
        <li><b>Pursue</b> : Prédit la position future du joueur pour l'intercepter efficacement.</li>
        <li><b>Obstacle Avoidance</b> : Évite les collisions avec l'environnement pendant son deplacement</li>
      </ul>
    </td>
  </tr>

  <tr>
    <td align="center"><img src="./assets/ui/Human Avatars/Avatar_Sheep.png" width="100"></td>
    <td height="230">
      <b>Le Mouton</b><br>
      <br>
      <ul>
        <li><b>Herd (Boids)</b> : Utilise <i>Separation</i> (ne pas s'entrechoquer), <i>Alignment</i> (suivre la direction du groupe) et <i>Cohesion</i> (rester groupés).</li>
        <li><b>Flee</b> : S'enfuit paniqué à l'approche du joueur ou d'un ennemi.</li>
        <li><b>Obstacle Avoidance</b> : Évite les collisions avec l'environnement pendant son deplacement.</li>
        <li><b>Edges</b> : Peut se teleporter de l'autre coté de la map</li>
      </ul>
    </td>
  </tr>

  <tr>
    <td align="center"><img src="./assets/ui/gold coin.png" width="50"><img src="./assets/world/objects/Meat Resource.png" width="50"></td>
    <td height="100">
      <b>Collectibles (Pièces & Viande)</b><br>
      <br>
      <ul>
        <li><b>Seek</b> : Ces objets sont attirés par le joueur.</li>
      </ul>
    </td>
  </tr>
</table>

<br>

## 🤖 Utilisation de l'assistant IA : processus et retour d'expérience

### L’approche : hybride et itérative

Plutôt que de tout déléguer à l’IA, j’ai choisi une approche **mixte** :

- **Moi** : conception des spécifications, écriture des fichiers fondateurs (`Vehicle.js`, `sketch.js`), implémentation du code qui touche ux steeringbehaviour, refactorisation,  validation finale
- **L’IA (Claude 3.5 Sonnet & Haiku)** : génération du code fonctionnel annexe qui touche a la théorie de jeu, refactorisation, documentation, correction de bugs

L’objectif : **comprendre profondément les steering behaviors** en touchant moi-même à ce qui compte vraiment, tout en laissant l’IA gérer la masse de code annexe. 

<br>

### Phase 1 — Spécifications d’abord
Avant chaque prompt, je fournissais systématiquement à l’IA :

- `CONSTRAINTS.md` — les règles imposées par le professeur (Vehicle immutable, loi de steering, architecture 3 couches…)
- `SPECIFICATIONS.md` — mes propres exigences fonctionnelles pour le MVP du projet

Résultat : le code respectait les contraintes dans environ 70% des cas. Le reste du temps, l’IA “oubliait” certaines règles (mutations directes de vel, comportements monolithiques…).


### Phase 2 — Le problème du code “pas assez propre”
Au fil des itérations, le code fonctionnait… mais devenait difficile à maintenir :

- Il y avait beaucoup de duplication
- Pas de séparation claire des responsabilités
- Les corrections introduisaient parfois de nouveaux bugs

J’ai donc changé de méthode.

### Phase 3 — Restructuraction du processus d'implémentation
J’ai mis en place un processus en 4 fichiers + 1 donné par le professeur:

| Fichier | Rôle |
| :--- | :---: |
| SPECIFICATIONS.md | Ce que le jeu doit faire (MVP). j'ai mis a jour et completer les spécification du projet |
| CONSTRAINTS.md | Les règles techniques imposées |
| REFACTORING_INSTRUCTIONS.md | l'ensemble des travaux de refactoring à effectuer ainsi que Les principes de clean code à respecter |
| CHANGES.md | Trace de chaque modification |
| EXPLANATION.md | Documentation des concepts de jeu théoriques implémenté dans le projet|

#### Structuration des prompts 

**Des prompts intégrés directement dans les fichiers**
Plutôt que d’écrire des prompts “à la volée”, j’ai conçu chaque fichier (CHANGES.md, EXPLANATION.md, REFACTORING_INSTRUCTIONS.md, etc.) avec un prompt en tête de fichier.

Ces prompts servent de mode d’emploi permanent pour l’IA.

**Un prompt adapté à l’objectif de chaque fichier**
Chaque fichier impose un comportement différent à l’IA :

`CHANGES.md — prompt de traçabilité technique`

Le prompt force l’IA à :

- ne jamais écraser le contenu existant
- ajouter uniquement à la fin (append)
- décrire les changements de manière technique et justifiée
- référencer les contraintes et spécifications


`EXPLANATION.md — prompt pédagogique`

Le prompt impose :

- de nommer correctement les concepts (terminologie exacte)
- d’expliquer le principe avant l’implémentation
- de lier chaque concept aux fichiers du projet
- de documenter uniquement ce qui est réellement implémenté

`REFACTORING_INSTRUCTIONS.md — prompt de revison de code`

Ce fichier contient un prompt qui :

- impose un plan de refactorrisation à effectuer 
- interdit certaines actions (mutation de pos, modification de Vehicle.js, etc.)
- définit des règles de clean code strictes à respecter

#### Le cycle de processus 

Le cycle :

- Je demande une fonctionnalité à l’IA + lire CONSTRAINTS + SPECIFICATIONS / Je developpe une fonctionnalité 
- L’IA génère le code (ou on saute cette étape) 
- Je valide
- Je demande à li'IA de refactorer le code en respectant les consigne du fichier REFACTORING_INSTRUCTIONS 
- L'IA refactorise le code 
- Je demande à l'IA  de mettre à jour CHANGES.md en respectant ses contraintes 
-L'IA met à jour le fichier CHANGES.md 
- Je demande à l'IA  de mettre à jour EXPLANATION.md en respectant ses contraintes
- L'IA met a jour le fichier EXPLANATION.md 

#### Ce que ça a changé

|Avant | Après |
| :--- | :---: |
| Code fonctionnel mais brouillon |	Code structuré, maintenable , lisible |
| Documentation non encadré	|  CHANGES.md + EXPLANATION.md complets et structure cohérente dans tout le fichier |
| Refactoring manuel long	| Refactoring automatisé et cohérent |

### Mon Expérience

#### Ce que j'ai aimé
- La satisfaction visuelle de voir le projet prendre vie : L'intégration des assets, de la map et des animations a rendu le projet concret et gratifiant.

- La puissance des comportements : Voir par exemple les moutons se regrouper (Herd) et fuir devant moi de manière fluide et naturel .

#### Ce que j'ai moins aimé
Les phases de refactorisation longues dues à des prompts imprécis au début. Cela m'a appris l'importance de la clarté dans la communication avec une IA.

### CREDITS
#### AUDIO
*Sound effects provided by Pixabay and independent artists*

| Catégorie | Élément | Auteur / Source |
| :--- | :--- | :--- |
| **Sons d'interface** | Game Hover | [Mori_sound](https://pixabay.com/fr/users/mori_sound-54904477/) |
| | UI Hover | [Floraphonic](https://pixabay.com/fr/users/floraphonic-38928062/) |
| **Combat** | Sword Slash | [Freesound Community](https://pixabay.com/fr/users/freesound_community-46691455/) |
| | Hit Sound | [u_xjrmmgxfru](https://pixabay.com/fr/users/u_xjrmmgxfru-47169417/) |
| | Enemy Death | [Krzysztof Szymanski](https://pixabay.com/fr/users/djartmusic-46635386/) |
| **Feedback** | Winner Sound | [Mori_sound](https://pixabay.com/fr/users/mori_sound-54904477/) |
| | Coin Collect | [Driken Stan](https://pixabay.com/fr/users/driken5482-45721595/) |
| | Sparkle Magic | [LIECIO](https://pixabay.com/fr/users/liecio-3298866/) |
| | Heal Sound | ([leohpaz](https://opengameart.org/content/8-heals-and-buffs-sfx)) — Licence [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)|
|**Musique de fond** | Battle I | ([xDeviruchi](https://xdeviruchi.itch.io/16-bit-fantasy-adventure-music-pack)) |


---

#### ASSETS GRAPHIQUES
*Environnements et Personnages*

| Élément | Auteur / Source |  
| :--- | :--- |   
| **Tiny Sword Asset Pack**  |  [Pixel Frog](https://pixelfrog-assets.itch.io/tiny-swords) |  
| **Sword Hero Asset Pack**  |  [CartoonCoffee](https://cartooncoffee.itch.io/swordhero1) |   


---

#### EFFETS PARTICULES (VFX)
*Systèmes de particules et visuels*

| Élément | Auteur / Source |
| :--- | :--- | 
| **Tiny Sword VFX** |  [Pixel Frog](https://pixelfrog-assets.itch.io/tiny-swords) |
| **Free VFX Pack** |  [CartoonCoffee](https://cartooncoffeegames.com/) |




