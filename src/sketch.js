let gameMap;
let player;
let enemy;

function preload() {
  gameMap = new GameMap();
  gameMap.preload();

  player = new Player(1600, 1600); // centre de la map
  player.preload();

  enemy = new Enemy(1600, 1700, gameMap, player); 
  enemy.preload(); 
}

function setup() {
  createCanvas(3200, 3200); // adapte à la taille de ta map
  gameMap.parse();

  let path = gameMap.getPatrolPath(0); // ← index 0 = premier chemin
  enemy.patrolPath = path;

  if (path.length > 0) {
    enemy.pos = path[0].copy(); // positionne l'ennemi au départ du chemin
  }

  frameRate(60);
}

function draw() {
  background(0);
  gameMap.drawBackground();

  player.update();
  player.show();

  enemy.update(); 
  enemy.show();
}


function mousePressed() {
    if (mouseButton === LEFT) player.attack();
}

