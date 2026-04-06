SPECS GÉNÉRALES
Concept
Jeu d'action/aventure où tu incarnes un joueur. Tu dois combattre des montres 


Plateforme
Navigateur (p5.js)


MVP (VERSION MINIMALE JOUABLE)
Pour qu'un jeu soit fonctionnel et amusant, voici les éléments indispensables que tu dois implémenter en priorité.

0 - Joueur (entité)
le joueur est animée ( deplacement , attaque , idle , mort , blessé) spritesheet
des sons sont attachée au joueur lorsqu'il se deplace , attaque ou est blessé

1 – Déplacement du joueur
Le joueur se déplace en faisant un seek sur la souris 
Le joueur reste dans les limites de l'écran (edges)
le entre en collision avec les obstacles lors de ses deplacements 

2 – Attaque du joueur
Attaque à distance avec une epée(clic gauche de la souris) => les ennemis touché par l'attaque du joueur perdent de la vie => Les ennemis meurent et disparaissent lorsque leur point de vie sont a 0 



3 – Ennemis (entité)
- L'ennemi patrouille (path following)
- L'ennemi attaque quand le joueur est proche  sinon patrouille (path following)
- l'ennemi evite les obstacles lors de ses deplacements (obstacle avoidance)
- l'ennemi s'arrete de facon naturel lorsqu'il arrive a un point de patrouille (arrival) 
- le mouvement et action ( deplacement , attaque , blessé, idle, mort) de l'ennemi est animé (spritesheet)
- L'ennemis attaque le joueur avec une arc (attaque à distance) => le joueur est blessé => le joueur perd de la vie => si les point de vie du joueur sont a 0 , le joueur meurt . 


4 - NPC (entité)
- il existe 2 type de npc : sheep et pawn
- les NPC font un wander + obstacle avoidance
- lorsque un NPC est proche du joueur ou un enemmi , il fait un evade pour l'eviter de facon naturel 
- les NPC de type "sheep"  se deplace comme un troupeau ( behaviour cohesion et separation)
- les mouvements des NPC sont animés (spritesheep run et idle)

5 - NPC externe (entité)
- les NPC externe ne sont pas assujétis aux obstacle 
- elle se deplace en flock ( behaviour alignement , cohesion et separation ) sur tout le canvas
- leur deplacement se limite aux limite du canvas 
- les mouvement de deplacement sont animés
- les Npc externe implemente un behaviour de flee lorsque sur la souris 


5 – Collectables
- Objet collectable meat  qui redonne de la vie au joueur 
- Objet collectable coin 
- Les objets collectables se déplace vers le joueur quand il est proche (behaviour seek)


6 – Interface basique

HUD 
- Barre de vie du joueur
- Barre de vie ennemis
- compteur enemis presents 
- compteur de pieces recolté 


ECRAN  
- Ecran de menu pour commencer le jeu 
- Écran de Game Over (quand vie = 0) : Possibilité de rejouer, rvenir au menu pour commencer le jeu 
- Ecran de victoire 
- Ecran pause : Possibilité de rejouer, rvenir au menu pour commencer le jeu 
- Ecran tutoriel 

PANEL  
- panel paramétrage : son , musique .
- panel de debug des behaviour des differents entités ( NPC sheep , NPC pawn , Npc externe , Enemy) : force , vitess ..ect 
- panel de debug pour observer : les collisons , les interaction dans leurs forme de debug selon les entity 

- les panel sont tout le temps affiché sur le coté lorsque a commencé 
- le jeu est affiché en grand au centre de l'ecran 
- le HUD sans es barre de vie des ennemis sont affiche au dessus du canva legerement supersposé au dessus du canva 
- en bas du canva  on a une icone "info" affiche , quand on clique dessus , le jeu se met en pause et l'ecran tutoriel est affiché en superspositon du canvas
- a coté de l'icone "info" se trouve l'icone pause , quand on clique dessus , le jeu se met en pause et l'ecran pause est affiché en superspositon du canvas
- quand le  compteur d'enemy est à 0 , le joueur a gagné,  le jeu se met en pause et l'ecran victoire est affiché en superspositon du canvas
- quand le joueur meurt , le jeu se met en pause et l'ecran game over est affiché en superspositon du canvas.







