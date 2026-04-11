// =============================================
// HUD — Style inspiré Elsword
// Superposé sur le canvas (dessiné dans p5 hors caméra)
// Contient :
//   - Barre de vie joueur (haut gauche) avec BigBar + gemmes
//   - Compteur ennemis (haut droit)
// =============================================
class HUD {

    constructor() {
        this.playerAvatar = null;
        this.enemyBanner  = null;
        this.goldBanner   = null; // banner gold coin counter

        // Barre de vie
        this.barFill      = null;
        this.barBaseLeft  = null;
        this.barBaseMid   = null;
        this.barBaseRight = null;

        this.font = null;

        // Icône info
        this.infoIcon      = null;
        this._infoIconX    = 0;
        this._infoIconY    = 0;
        this._infoIconSize = 44;
    }

    preload() {
        this.playerAvatar = loadImage("../assets/ui/Human Avatars/Avatar_Sword_Hero.png");
        this.enemyBanner  = loadImage("../assets/ui/Banners/enemy_banner.png");
        this.goldBanner   = loadImage("../assets/ui/Banners/gold_coin_banner.png");
        this.barBaseLeft  = loadImage("../assets/ui/Bars/BigBar_Base_Left.png");
        this.barBaseMid   = loadImage("../assets/ui/Bars/BigBar_Base_Middle.png");
        this.barBaseRight = loadImage("../assets/ui/Bars/BigBar_Base_Right.png");
        this.barFill      = loadImage("../assets/ui/Bars/BigBar_Fill.png");
        this.font         = loadFont("../assets/fonts/JollyLodger-Regular.ttf");
        this.infoIcon     = loadImage("../assets/ui/Icons/info.png");
    }

    update() {
        // Rien à animer pour l'instant (gemmes supprimées)
    }

    show(player, enemies, w, h) {
        this.drawPlayerHealth(player, w, h);
        this.drawEnemyCounter(enemies, w, h);
        this.drawGoldCounter(player, w, h);
        this.drawInfoIcon(w, h);
    }

    // =============================================
    // ICÔNE INFO — à gauche du banner gold coin
    // =============================================
    drawInfoIcon(w, h) {
        if (!this.infoIcon) return;

        // Même calcul que drawGoldCounter pour trouver la position du gold banner
        let bannerW     = 440;
        let scale       = 0.38;
        let bw          = bannerW * scale; // ~167px
        let goldBannerX = w - bw * 2 - 20;

        let size = this._infoIconSize;
        let x    = goldBannerX - size / 2 - 8;
        let y    = size / 2 + 10;

        let hovered = (mouseX > x - size/2 && mouseX < x + size/2 &&
                       mouseY > y - size/2 && mouseY < y + size/2);
        let sc = hovered ? 1.25 : 1.0;

        this._infoIconX = x;
        this._infoIconY = y;

        push();
        imageMode(CENTER);
        image(this.infoIcon, x, y, size * sc, size * sc);
        pop();
    }

    isInfoIconClicked(mx, my) {
        let size = this._infoIconSize;
        return (mx > this._infoIconX - size/2 && mx < this._infoIconX + size/2 &&
                my > this._infoIconY - size/2 && my < this._infoIconY + size/2);
    }

    // =============================================
    // BARRE DE VIE JOUEUR — style Elsword
    // =============================================
    drawPlayerHealth(player, w, h) {
        push();

        let px         = 16;
        let py         = 16;
        let avatarSize = 72;
        let barW       = 320; // largeur affichée de la barre
        let barH       = 32;
        let barX       = px + avatarSize - 28
        let barY       = py + avatarSize / 2 - barH / 2 + 5;
        
        if (this.font) textFont(this.font);
        // ─── Fond sombre semi-transparent ───
        
        // ─── Cadre avatar dessiné en p5 (style ornemental) ───
        this.drawAvatarFrame(px, py, avatarSize);

        if (this.playerAvatar) {
            // Clip l'avatar dans le cadre
            push();
            // Fond coloré derrière l'avatar
            fill(30, 20, 10);
            noStroke();
            rect(px + 3, py + 3, avatarSize - 6, avatarSize - 6, 4);
            image(this.playerAvatar, px + 3, py + 3, avatarSize - 6, avatarSize - 6);
            pop();
        }

        // ─── Nom du joueur ───
        fill(0,0,0);
        noStroke();
        textSize(18);
        textAlign(LEFT, BOTTOM);
        text("Sword Hero", px  + avatarSize + 12, barY + 2);

        fill(255, 255, 80);
        noStroke();
        textSize(18);
        textAlign(LEFT, BOTTOM);
        text("Sword Hero", px + avatarSize + 12, barY + 2);

        // ─── Barre de vie avec BigBar_Base + BigBar_Fill ───
        let ratio = max(0, player.hp / player.maxHp);
        this.drawBar(barX, barY, barW, barH, ratio);

        // ─── Texte HP ───
        fill(255, 240, 180);
        noStroke();
        textSize(12);
        textAlign(CENTER, CENTER);
        text(`${max(0, player.hp)} / ${player.maxHp}`, barX + barW / 2, barY + barH / 2);

        pop();
    }

    // =============================================
    // BARRE — assemblée depuis BigBar_Base + BigBar_Fill
    // BigBar_Base 320x64 → découpée en 3 : gauche(32), milieu(256), droite(32)
    // BigBar_Fill 64x64  → étiré horizontalement selon ratio
    // =============================================
    drawBar(x, y, w, h, ratio) {
        let leftW  = 64;
        let rightW = 64;
        let midW   = w - leftW - rightW;
        let srcH   = 64;

        let fillInLeft  = 16; // zone fill dans baseLeft (dernier quart)
        let fillInRight = 16; // zone fill dans baseRight (premier quart)
        let fillAreaW   = fillInLeft + midW + fillInRight;
        let fillW       = fillAreaW * ratio;

        let fillStartX = x + (leftW - fillInLeft); // x + 48

        // ─── 1. Base ───
        image(this.barBaseLeft,  x,              y, leftW,  h, 0, 0, 64, srcH);
        image(this.barBaseMid,   x + leftW,      y, midW,   h, 0, 0, 64, srcH);
        image(this.barBaseRight, x + w - rightW, y, rightW, h, 0, 0, 64, srcH);

        // ─── 2. Fill clipé à la zone autorisée ───
        if (fillW > 0) {
            drawingContext.save();
            drawingContext.beginPath();
            // Zone clip = exactement la zone fill autorisée
            drawingContext.rect(fillStartX, y, fillAreaW, h);
            drawingContext.clip();

            image(this.barFill, fillStartX, y, fillW, h, 0, 0, 64, 64);

            drawingContext.restore();
        }
    }

    // =============================================
    // CADRE AVATAR — style ornemental p5
    // =============================================
    drawAvatarFrame(x, y, size) {
        push();

        // Fond sombre
        fill(20, 12, 5);
        stroke(100, 70, 20);
        strokeWeight(1);
        rect(x, y, size, size, 6);

        // Bordure dorée principale
        noFill();
        stroke(180, 130, 30);
        strokeWeight(2.5);
        rect(x, y, size, size, 6);

        // Bordure intérieure plus claire
        stroke(240, 190, 60, 120);
        strokeWeight(1);
        rect(x + 3, y + 3, size - 6, size - 6, 4);

        // Coins ornementaux — petits carrés dorés aux 4 coins
        fill(200, 150, 40);
        noStroke();
        let cs = 5; // coin size
        rect(x - 1,        y - 1,        cs, cs, 1);
        rect(x + size - cs + 1, y - 1,   cs, cs, 1);
        rect(x - 1,        y + size - cs + 1, cs, cs, 1);
        rect(x + size - cs + 1, y + size - cs + 1, cs, cs, 1);

        pop();
    }

    
    // =============================================
    // COMPTEUR ENNEMIS — style Elsword
    // =============================================
    drawEnemyCounter(enemies, w, h) {
        let aliveCount = enemies.filter(e => !e.isDead()).length;
        let total      = enemies.length;
        let killed     = total - aliveCount;

        let bannerW = 440;
        let bannerH = 256;
        let scale   = 0.5; // ajuste la taille
        let bw      = bannerW * scale;
        let bh      = bannerH * scale;
        let bx      = w - bw + 10; // haut droit, légèrement rogné
        let by      = -10;          // légèrement hors canvas en haut

        // ─── Bannière ───
        if (this.enemyBanner) {
            push();
            imageMode(CORNER);
            image(this.enemyBanner, bx, by, bw, bh);
            pop();
        }

        // ─── Texte par-dessus ───
        push();
        if (this.font) textFont(this.font);

        // Nombre ennemis vivants — centré sur la bannière
        fill(255, 20, 20); noStroke();
        textSize(28); textAlign(CENTER, CENTER);
        text(`${killed}`, bx + bw / 2 + 45, by + bh / 2 - 15);

        textSize(20);
        fill(155, 0, 0);
        text(`/ ${total}`, bx + bw / 2 + 65, by + bh / 2 - 5);

        pop();
    }

    // =============================================
    // COMPTEUR GOLD — à gauche du compteur ennemis
    // =============================================
    drawGoldCounter(player, w, h) {
        let coins = player.coins || 0;

        let bannerW = 440;
        let bannerH = 256;
        let scale   = 0.38;
        let bw      = bannerW * scale;
        let bh      = bannerH * scale;

        // À gauche du banner ennemi
        let bx = w - bw * 2 - 20;
        let by = -8;

        if (this.goldBanner) {
            push();
            imageMode(CORNER);
            image(this.goldBanner, bx, by, bw, bh);
            pop();
        }

        push();
        if (this.font) textFont(this.font);
        fill(255, 215, 0); noStroke();
        textSize(28); textAlign(CENTER, CENTER);
        text(`${coins}`, bx + bw / 2 + 25, by + bh / 2 - 12);
        pop();
    }
}