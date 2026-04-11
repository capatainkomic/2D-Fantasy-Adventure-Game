// =============================================
// InfoPopup — Popup "How to Play"
// 4 onglets sword sur le côté gauche
// Banner en bois + contenu associé
// =============================================
class InfoPopup {

    static imgs = {
        woodBanner:    null,
        swordBlue:     null,
        swordRed:      null,
        swordYellow:   null,
        swordPurple:   null,
        btnRedReg:     null,
        gifMove:       null,
        gifShake:      null,
        gifAttack:     null, // player_attaque.gif
        imgEnemyAtk:   null, // enemy_attack.png
        sheepFrame:    null,
        font:          null,
    };

    static preload() {
        InfoPopup.imgs.woodBanner  = loadImage("../assets/ui/Banners/wood_banner.png");
        InfoPopup.imgs.swordBlue   = loadImage("../assets/ui/Swords/sword_blue_left.png");
        InfoPopup.imgs.swordRed    = loadImage("../assets/ui/Swords/sword_red_left.png");
        InfoPopup.imgs.swordYellow = loadImage("../assets/ui/Swords/sword_yellow_left.png");
        InfoPopup.imgs.swordPurple = loadImage("../assets/ui/Swords/sword_purple_left.png");
        InfoPopup.imgs.btnRedReg   = loadImage("../assets/ui/Buttons/big_red_button_regular.png");
        InfoPopup.imgs.gifMove     = loadImage("../assets/images/how_to_move.gif");
        InfoPopup.imgs.gifShake    = loadImage("../assets/images/mouse_shake.gif");
        InfoPopup.imgs.gifAttack   = loadImage("../assets/images/player_attack.gif");
        InfoPopup.imgs.imgEnemyAtk = loadImage("../assets/images/enemy_attack.png");
        InfoPopup.imgs.sheepFrame  = loadImage("../assets/characters/Sheep/Sheep_Idle.png");
        InfoPopup.imgs.font        = loadFont("../assets/fonts/JollyLodger-Regular.ttf");
    }

    constructor() {
        this.active      = false;
        this.activeTab   = 0; // 0-3

        // Dimensions du banner principal
        this.bw = 700;
        this.bh = 520;

        // Dimensions des sword tabs
        this.swordW = 130;
        this.swordH = 64;

        // Hover tracking
        this._hoveredTab = -1;

        // Bouton
        this._btnX = 0; this._btnY = 0;
        this._btnW = 0; this._btnH = 0;
        this._btnHovered = false;

        // Tabs config
        this.tabs = [
            { color: "blue",   label: "Move",        sword: null },
            { color: "red",    label: "Attack",       sword: null },
            { color: "yellow", label: "Collectibles", sword: null },
            { color: "purple", label: "World",        sword: null },
        ];
    }

    show_popup() {
        this.active = true;
    }

    hide() {
        this.active = false;
    }

    // =============================================
    // SHOW — rendu complet
    // =============================================
    show(w, h) {
        if (!this.active) return;

        let imgs = InfoPopup.imgs;
        let cx   = w / 2 - this.swordW * 0.4; // décalé légèrement à gauche pour laisser place aux swords à droite
        let cy   = h / 2;
        let bx   = cx - this.bw / 2;
        let by   = cy - this.bh / 2;

        push();

        // ─── Fond semi-transparent ───
        fill(0, 0, 0, 160);
        noStroke();
        rect(0, 0, w, h);

        // ─── Sword tabs — dessinés AVANT le banner pour être derrière ───
        this._updateHover(bx, by);
        this._drawTabs(bx, by, imgs);

        // ─── Banner en bois — par-dessus les swords ───
        if (imgs.woodBanner) {
            imageMode(CORNER);
            image(imgs.woodBanner, bx, by, this.bw, this.bh);
        }

        // ─── Font ───
        if (imgs.font) textFont(imgs.font);

        // ─── Titre "How to play ?" ───
        noStroke();
        fill(40, 20, 5);
        textSize(30);
        textAlign(CENTER, CENTER);
        text("How to play ?", cx + 2, by + 42);
        fill(255, 230, 150);
        text("How to play ?", cx, by + 40);

        // ─── Ligne sous le titre ───
        stroke(100, 65, 20, 150);
        strokeWeight(1);
        line(bx + 40, by + 55, bx + this.bw - 40, by + 55);

        // ─── Contenu de l'onglet actif ───
        this._drawContent(cx, cy, bx, by, imgs);

        // ─── Bouton Resume ───
        this._drawResumeButton(cx, by + this.bh - 35, imgs);

        pop();
    }

    // =============================================
    // TABS — sword languettes sur le bord gauche
    // =============================================
    _updateHover(bx, by) {
        this._hoveredTab = -1;
        let tabStartY = by + 80;
        let tabGap    = this.swordH + 8;
        let rightEdge = bx + this.bw;

        for (let i = 0; i < this.tabs.length; i++) {
            let ty = tabStartY + i * tabGap;
            // Swords dépassent à droite du banner
            if (mouseX > rightEdge - 25 && mouseX < rightEdge + this.swordW &&
                mouseY > ty && mouseY < ty + this.swordH) {
                this._hoveredTab = i;
            }
        }
    }

    _drawTabs(bx, by, imgs) {
        let swords = [
            imgs.swordBlue,
            imgs.swordRed,
            imgs.swordYellow,
            imgs.swordPurple,
        ];

        let tabStartY = by + 80;
        let tabGap    = this.swordH + 8;
        let rightEdge = bx + this.bw;

        for (let i = 0; i < this.tabs.length; i++) {
            let ty       = tabStartY + i * tabGap;
            let isActive = this.activeTab === i;
            let isHover  = this._hoveredTab === i;

            // Décalage vers la gauche quand actif/hover (entre dans le banner)
            let offsetX = isActive ? -18 : (isHover ? -10 : 0);

            // Sword commence au bord droit du banner
            let tx = rightEdge + offsetX;

            if (swords[i]) {
                imageMode(CORNER);
                image(swords[i], tx, ty, this.swordW, this.swordH);
            }
        }
    }

    // =============================================
    // CONTENU par onglet
    // =============================================
    _drawContent(cx, cy, bx, by, imgs) {
        let contentX = bx + 60;
        let contentY = by + 70;
        let contentW = this.bw - 80;

        switch (this.activeTab) {
            case 0: this._drawTabMove(contentX, contentY, contentW, imgs); break;
            case 1: this._drawTabAttack(contentX, contentY, contentW, imgs); break;
            case 2: this._drawTabCollectibles(contentX, contentY, contentW, imgs); break;
            case 3: this._drawTabWorld(contentX, contentY, contentW, imgs); break;
        }
    }

    _drawTabMove(x, y, w, imgs) {
        // ─── Texte centré en haut ───
        let cx = x + w / 2;

        noStroke();
        // Ombre
        fill('#2A1A15');
        textSize(35);
        textAlign(CENTER, TOP);
        text("Move your hero by moving your mouse", cx - 13, y -3);
        // Texte crème sur bois
        fill('#91F0AE');
        text("Move your hero by moving your mouse", cx - 15, y -5);

        // ─── GIF centré entre le texte et le bouton resume ───
        let gifW = 260;
        let gifH = 200;
        let gifX = cx - gifW / 2;
        let gifY = y + 80;

        if (imgs.gifMove) {
            imageMode(CORNER);
            image(imgs.gifMove, gifX, gifY, gifW, gifH);
        }
    }

    // ─── Tab 1 : Attack ───
    _drawTabAttack(x, y, w, imgs) {
        let cx = x + w / 2;

        // ─── Texte centré en haut ───
        noStroke();
        fill('#2A1A15');
        textSize(35);
        textAlign(CENTER, TOP);
        text("Click on your mouse to attack", cx - 13, y -3);
        fill('#91F0AE');
        text("Click on your mouse to attack", cx - 15, y -5);

        // ─── GIF centré ───
        let gifW = 260;
        let gifH = 200;
        let gifX = cx - gifW / 2;
        let gifY = y + 80;

        if (imgs.gifAttack) {
            imageMode(CORNER);
            image(imgs.gifAttack, gifX, gifY, gifW, gifH);
        }
    }

    _drawTabCollectibles(x, y, w, imgs) {
        let cx = x + w / 2;

        // ─── GIF centré en haut ───
        let gifW = 260;
        let gifH = 180;
        let gifX = cx - gifW / 2;
        let gifY = y + 60;

        if (imgs.gifShake) {
            imageMode(CORNER);
            image(imgs.gifShake, gifX, gifY, gifW, gifH);
        }

        noStroke();
        fill('#2A1A15');
        textSize(35);
        textAlign(CENTER, TOP);
        text("Shake your mouse fast to spawn collectibles !", cx - 13, y -3);
        fill('#91F0AE');
        text("Shake your mouse fast to spawn collectibles !", cx - 15, y -5);

        // ─── Textes sous le gif — harmonieux avec fond bois ───
        noStroke();
        textAlign(CENTER, TOP);

        // "Coins" — crème doré, lisible sur bois
        fill(255, 230, 140);
        textSize(20);
        text("Coins — always drop 3-7 per shake", cx, gifY + gifH + 10);


        // "Meat" — rose orangé doux, lisible sur bois
        fill(255, 190, 120);
        textSize(20);
        text("Meat — 20% chance to get one per shake", cx, gifY + gifH + 52);
    }

    // ─── Tab 3 : World ───
    _drawTabWorld(x, y, w, imgs) {
        noStroke();
        textSize(14);
        textAlign(LEFT, TOP);

        // Timer
        fill(255, 220, 80);
        textSize(28);
        text("3:00", x, y + 15);
        fill(255, 210, 140);
        textSize(13);
        text("You have 3 minutes to", x + 70, y + 10);
        text("eliminate all enemies.", x + 70, y + 26);

        // Séparation
        stroke(100, 65, 20, 100);
        strokeWeight(1);
        line(x, y + 50, x + w - 20, y + 50);
        noStroke();

        // Sheep
        if (imgs.sheepFrame) {
            imageMode(CORNER);
            // Prend le premier frame du spritesheet sheep idle
            image(imgs.sheepFrame, x, y + 60, 40, 40,
                  0, 0, 128, 128);
        }
        fill(255, 210, 140);
        textSize(13);
        text("Sheep flee from you and", x + 50, y + 65);
        text("from enemies.", x + 50, y + 81);

        // Séparation
        stroke(100, 65, 20, 100);
        line(x, y + 110, x + w - 20, y + 110);
        noStroke();

        // Obstacles
        fill(255, 210, 140);
        textSize(13);
        text("⬡ Gold Stones block", x, y + 125);
        text("  movement — go around!", x, y + 141);

        // Séparation
        stroke(100, 65, 20, 100);
        line(x, y + 165, x + w - 20, y + 165);
        noStroke();

        // Enemies
        fill(255, 210, 140);
        textSize(13);
        text("⚔ Enemies patrol paths,", x, y + 178);
        text("  pursue & attack on sight.", x, y + 194);
        text("  Each has 20 HP.", x, y + 210);

        // ─── Enemy attack image ───
        if (imgs.imgEnemyAtk) {
            imageMode(CORNER);
            image(imgs.imgEnemyAtk, x + w - 120, y + 165, 110, 80);
        }
        fill(255, 160, 120);
        textSize(12);
        text("Dodge their attacks!", x + w - 120, y + 252);
    }

    // =============================================
    // BOUTON RESUME
    // =============================================
    _drawResumeButton(cx, cy, imgs) {
        let bw = 240;
        let bh = 65;

        this._btnHovered = (mouseX > cx - bw/2 && mouseX < cx + bw/2 &&
                            mouseY > cy - bh/2 && mouseY < cy + bh/2);

        let sc = this._btnHovered ? 1.08 : 1.0;
        let dw = bw * sc;
        let dh = bh * sc;
        let bx = cx - dw / 2;
        let by = cy - dh / 2;

        if (imgs.btnRedReg) {
            imageMode(CORNER);
            image(imgs.btnRedReg, bx, by, dw, dh);
        }

        fill(255);
        noStroke();
        textSize(24 * sc);
        textAlign(CENTER, CENTER);
        text("RESUME", cx, cy - 5);

        this._btnX = cx - bw / 2;
        this._btnY = cy - bh / 2;
        this._btnW = bw;
        this._btnH = bh;
    }

    // =============================================
    // GESTION CLICS
    // =============================================
    handleClick(mx, my, bx, by) {
        if (!this.active) return false;

        // Clic sur les tabs (côté droit)
        let tabStartY = by + 80;
        let tabGap    = this.swordH + 8;
        let rightEdge = bx + this.bw;

        for (let i = 0; i < this.tabs.length; i++) {
            let ty      = tabStartY + i * tabGap;
            let offsetX = this.activeTab === i ? -18 : 0;
            let tx      = rightEdge + offsetX;

            if (mx > tx - 25 && mx < tx + this.swordW &&
                my > ty && my < ty + this.swordH) {
                this.activeTab = i;
                return false;
            }
        }

        // Clic sur Resume
        if (mx > this._btnX && mx < this._btnX + this._btnW &&
            my > this._btnY && my < this._btnY + this._btnH) {
            this.active = false;
            return true; // signal fermeture
        }

        return false;
    }
}