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
- L'ennemis attaque le joueur avec une lance (attaque à distance) => le joueur est blessé => le joueur perd de la vie => si les point de vie du joueur sont a 0 , le joueur meurt . 


4 - NPC (entité)
- il existe 1 type de npc : sheep 
- lorsque un NPC est proche du joueur ou un enemmi , il fait un flee pour l'eviter de facon naturel 
- les NPC de type "sheep"  se deplace comme un troupeau ( behaviour cohesion, align , separation et obstacle avoidance)
- les mouvements des NPC sont animés (spritesheep run et idle)
- les NPC ne sont pas soumis aux limites du canva



5 – Collectables
- il existe 2 type de Collectable : meat et coin 
- Objet collectable meat , redonne de la vie au joueur 
- Objet collectable coin 
- Les objets collectables se déplace vers le joueur quand il est proche (behaviour seek)


6 – Interface basique

HUD 
- Barre de vie du joueur
- Barre de vie ennemis
- compteur enemis presents 
- compteur de pieces recolté 
- icone "info" pour connaitre les regles du jeu (tutoriel)


ECRAN  
- Ecran de menu pour commencer le jeu 
- Écran de Game Over (quand vie = 0) : Possibilité de rejouer, rvenir au menu pour commencer le jeu 
- Ecran de victoire 
- Ecran tutoriel 

PANEL  
- panel paramétrage : son SFX, musique de fond .
- pour chaque entité , un panel de debug de leur behaviour  ( NPC sheep , NPC pawn , Npc externe , Enemy) : slider pour force , vitesse , poid  ..ect 
- panel de debug pour observer : les collisons , les interaction de behaviour dans leurs forme de debug 

- les panel sont affiché sur les cotés droite et gauche du canva du jeu . elle sont affiché quand on appuie sur la touche "d"
- le jeu est affiché en grand au centre de l'ecran 
- le HUD sans es barre de vie des ennemis sont affiche au dessus du canva legerement supersposé au dessus du canva 
- en haut du canva  , à coté du compteur de pièce, on a une icone "info" affiche , quand on clique dessus , le jeu se met en pause et l'ecran tutoriel est affiché en superspositon du canvas
- quand le  compteur d'enemy est à 0 , le joueur a gagné,  le jeu se met en pause et l'ecran victoire est affiché en superspositon du canvas
- quand le joueur meurt , le jeu se met en pause et l'ecran game over est affiché en superspositon du canvas.







