class GameMap {
    constructor() {
        this.mapData = null;
        this.waterImage = null;
        this.waterFoamImage = null;
        this.baseLandImage = null;
        this.plateau_layer1_image = null;
        this.plateau_layer2_image = null;
        this.building_layer1_image = null;
        this.building_layer2_image = null;
        this.building_layer3_image = null;
        this.foreground = null;
    

        this.obstacles = [];
        this.patrolPaths = [];

        this.waterFoamTiles = [];
        this.tree1Tiles = [];
        this.tree2Tiles = [];

    }

    preload() {
        this.mapData = loadJSON("../../assets/world/map.json");

        this.waterImage = loadImage("../../assets/world/water layer.png");
        this.waterFoamImage = loadImage("../../assets/world/sprites/Water Foam.png");
        this.baseLandImage = loadImage("../../assets/world/base land layer.png");
        this.plateau_layer1_image = loadImage("../../assets/world/plateau layer 1.png");
        this.plateau_layer2_image = loadImage("../../assets/world/plateau layer 2.png");
        this.building_layer1_image = loadImage("../../assets/world/buildings layer 1.png");
        this.building_layer2_image = loadImage("../../assets/world/buildings layer 2.png");
        this.building_layer3_image = loadImage("../../assets/world/buildings layer 3.png");
        //this.foreground = loadImage("../../assets/world/foreground.png");
        
    }

     parse() {
        for (let layer of this.mapData.layers) {

            if (layer.name === "water foam layer") {
                this.waterFoamTiles = layer.data;
            }

            if (layer.name === "rees and bush layer") {
                this.tree1Tiles = layer.data;
            }

            if (layer.name === "trees and bush layer 2") {    
                this.tree2Tiles = layer.data;
            }

            // Parser le layer "paths" pour les points de patrouille
            if (layer.name === "paths") {

                for (let obj of layer.objects) {
                    if (obj.polyline) {
                        let path = [];
                        for (let point of obj.polyline) {
                            path.push(createVector(obj.x + point.x, obj.y + point.y));
                        }
                        this.patrolPaths.push(path);
                    }
                }
            }

            if (layer.name === "obstacles") {
                let sizes = [128, 192, 256];
                for (let obj of layer.objects) {
                    // Taille assignée aléatoirement parmi 3 options
                    // (les objets sont des points sans dimension dans Tiled)
                    let displaySize = sizes[floor(random(sizes.length))];
                    this.obstacles.push(new Obstacle(obj.x, obj.y, displaySize));
                }
            }

        }
    }

    drawWaterlayer() {
        image(this.waterImage, 0, 0);
    }

    drawWaterFoamLayer() {
        let tileSize = 64;
        let mapWidth = this.mapData.width;

        let frameCount = 16;
        let spriteW = 192;
        let spriteH = 192;

        let frameIndex = Math.floor(millis() / 100) % frameCount;
        let sx = frameIndex * spriteW;
        let sy = 0;

        for (let i = 0; i < this.waterFoamTiles.length; i++) {
            let gid = this.waterFoamTiles[i];
            if (gid === 0) continue;

            let x = (i % mapWidth) * tileSize;
            let y = Math.floor(i / mapWidth) * tileSize;

            // centre du tile = x + 32
            // coin du sprite 192x192 centré = x + 32 - 96 = x - 64
            let drawX = x + (tileSize / 2) - (spriteW / 2)  + tileSize;  // = x - 64
            let drawY = y + (tileSize / 2) - (spriteH / 2)  - tileSize;  ;  // = y - 64

            image(
                this.waterFoamImage,
                drawX, drawY,
                spriteW, spriteH,
                sx, sy,
                spriteW, spriteH
            );
        }
    }

    drawBaseLandLayer() { 
        image(this.baseLandImage, 0, 0);
    }

    drawPlateauLayer1() {
        image(this.plateau_layer1_image, 0, 0);
    }

    drawPlateauLayer2() {
        image(this.plateau_layer2_image, 0, 0);
    }

    drawPlateauLayer3() {
        image(this.building_layer3_image, 0, 0);
    }

    drawTreesAndBushesLayer1() {

    }

    drawBuildingLayer1() {
        image(this.building_layer1_image, 0, 0);
    }

    drawBuildingLayer2() {
        image(this.building_layer2_image, 0, 0);
    }

    

    drawBackground() {
        this.drawWaterlayer();
        this.drawWaterFoamLayer();
        this.drawBaseLandLayer();
        this.drawPlateauLayer1();
        this.drawPlateauLayer2();
        this.drawBuildingLayer1();
        this.drawBuildingLayer2();
        this.drawPlateauLayer3();
    }

    // =============================================
    // GET PATROL PATH — retourne le chemin de patrouille comme array de p5.Vector
    // =============================================
    // Retourne le chemin de patrouille à l'index donné
    getPatrolPath(index = 0) {
        return this.patrolPaths ? this.patrolPaths[index] : [];
    }

    getObstacles() {
        return this.obstacles;
    }
}