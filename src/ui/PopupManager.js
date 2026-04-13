// =============================================
// PopupManager — Gestion des popups Win/GameOver
// Dessiné dans p5.js, centré sur le canvas
// =============================================
class PopupManager {

    static imgs = {
        banner:        null, // parchemin 687x539
        ribbonRed:     null, // 667x119
        ribbonYellow:  null, // 660x125
        btnRedReg:     null, // 295x105
        btnRedPres:    null, // 303x96
        btnBlueReg:    null, // 288x109
        btnBluePres:   null, // 303x96
        sword:         null, // icône épée
        coinIcon:      null, // gold coin
        enemyAvatar:   null, // avatar ennemi
        font:          null,
    };

    static preload() {
        PopupManager.imgs.banner       = loadImage("./assets/ui/Banners/pop_up_banner.png");
        PopupManager.imgs.ribbonRed    = loadImage("./assets/ui/Ribbons/big_ribbon_red.png");
        PopupManager.imgs.ribbonYellow = loadImage("./assets/ui/Ribbons/big_ribbon_yellow.png");
        PopupManager.imgs.btnRedReg    = loadImage("./assets/ui/Buttons/big_red_button_regular.png");
        PopupManager.imgs.btnRedPres   = loadImage("./assets/ui/Buttons/big_red_button_pressed.png");
        PopupManager.imgs.btnBlueReg   = loadImage("./assets/ui/Buttons/big_blue_button_regular.png");
        PopupManager.imgs.btnBluePres  = loadImage("./assets/ui/Buttons/big_blue_button_pressed.png");
        PopupManager.imgs.sword        = loadImage("./assets/ui/Icons/sword.png");
        PopupManager.imgs.coinIcon     = loadImage("./assets/ui/gold coin.png");
        PopupManager.imgs.enemyAvatar  = loadImage("./assets/ui/Human Avatars/Avatar_Enemy.png");
        PopupManager.imgs.font         = loadFont("./assets/fonts/JollyLodger-Regular.ttf");
    }

    constructor() {
        this.active    = false;
        this.type      = null; // "win" | "gameover"

        // Stats à afficher
        this.coins     = 0;
        this.killed    = 0;
        this.total     = 0;
        this.hpLeft    = 0;
        this.timeLeft  = 0;
        this.finalScore = 0;

        // Animation du score
        this.displayedScore = 0;
        this.scoreTarget    = 0;
        this.scoreAnimDone  = false;

        // Bouton état
        this.btnPressed = false;

        // Dimensions popup
        this.popW = 520;
        this.popH = 440;

        // Particules de bonus (pop + lever)
        this._bonusParticles = [];
        this._bonusSpawned   = false;
    }

    // =============================================
    // SHOW WIN
    // =============================================
    showWin(coins, killed, total, hpLeft, timeLeft) {
        this.active    = true;
        this.type      = "win";
        this.coins     = coins;
        this.killed    = killed;
        this.total     = total;
        this.hpLeft    = hpLeft;
        this.timeLeft  = timeLeft;

        // Calcul du score
        let bonus = (killed >= total) ? 500 : 0;
        this.scoreTarget    = coins * 10 + killed * 50 + hpLeft * 5 + timeLeft * 2 + bonus;
        this.displayedScore = 0;
        this.scoreAnimDone  = false;
        this._bonusParticles = [];
        this._bonusSpawned   = false;
    }

    // =============================================
    // SHOW GAME OVER
    // =============================================
    showGameOver(coins, killed, total) {
        this.active    = true;
        this.type      = "gameover";
        this.coins     = coins;
        this.killed    = killed;
        this.total     = total;

        this.scoreTarget    = coins * 10 + killed * 50;
        this.displayedScore = 0;
        this.scoreAnimDone  = false;
    }

    // =============================================
    // UPDATE — animation score
    // =============================================
    update() {
        if (!this.active) return;

        if (!this.scoreAnimDone) {
            let step = max(1, floor((this.scoreTarget - this.displayedScore) * 0.08));
            this.displayedScore += step;
            if (this.displayedScore >= this.scoreTarget) {
                this.displayedScore = this.scoreTarget;
                this.scoreAnimDone  = true;
            }

            // Spawn les bonus pendant l'animation — une seule fois
            if (this.type === "win" && !this._bonusSpawned &&
                this.displayedScore > this.scoreTarget * 0.3) {
                this._bonusSpawned = true;
                let hpBonus   = this.hpLeft * 5;
                let timeBonus = floor(this.timeLeft / 60) * 2;
                // Décalage temporel entre les deux
                this._bonusParticles.push({ txt: `+${hpBonus} hp`,      x: 0, y: 0, life: 120, delay: 0  });
                this._bonusParticles.push({ txt: `+${timeBonus} time`,   x: 0, y: 0, life: 120, delay: 30 });
                if (this.killed >= this.total) {
                    this._bonusParticles.push({ txt: `+500 bonus!`,      x: 0, y: 0, life: 130, delay: 60 });
                }
            }
        }

        // Update bonus particles
        for (let p of this._bonusParticles) {
            if (p.delay > 0) { p.delay--; continue; }
            p.life--;
            p.y -= 0.7; // monte doucement
        }
        this._bonusParticles = this._bonusParticles.filter(p => p.life > 0 || p.delay > 0);
    }

    // =============================================
    // SHOW — rendu du popup
    // =============================================
    show(w, h) {
        if (!this.active) return;

        let imgs = PopupManager.imgs;

        let cx = w / 2;
        let cy = h / 2;
        let pw = this.popW;
        let ph = this.popH;
        let px = cx - pw / 2;
        let py = cy - ph / 2;

        push();

        // ─── Fond semi-transparent ───
        fill(0, 0, 0, 160);
        noStroke();
        rect(0, 0, w, h);

        // ─── Parchemin ───
        if (imgs.banner) {
            imageMode(CENTER);
            image(imgs.banner, cx, cy, pw, ph);
        }

        // ─── Font ───
        if (imgs.font) textFont(imgs.font);

        if (this.type === "win") {
            this._drawWin(cx, cy, pw, ph, px, py, imgs);
        } else {
            this._drawGameOver(cx, cy, pw, ph, px, py, imgs);
        }

        pop();
    }

    // =============================================
    // WIN POPUP
    // =============================================
    _drawWin(cx, cy, pw, ph, px, py, imgs) {

        // ─── Ribbon jaune — entête ───
        if (imgs.ribbonYellow) {
            imageMode(CENTER);
            image(imgs.ribbonYellow, cx, py + 30, 400, 75);
        }

        // ─── Titre — ombre + texte doré chaud ───
        noStroke();
        fill(80, 50, 10);
        textSize(38);
        textAlign(CENTER, CENTER);
        text("WINNER!", cx + 2, py + 22);
        fill(255, 230, 80);
        text("WINNER!", cx, py + 20);

   

        // ─── Score — bien visible, centré ───
        noStroke();
        fill(120, 85, 35);
        textSize(18);
        textAlign(CENTER, CENTER);
        text("S C O R E", cx, py + 95);

        // Ombre du score
        fill(80, 50, 10);
        textSize(52);
        text(`${this.displayedScore}`, cx + 2, py + 132);
        fill(255, 210, 60);
        text(`${this.displayedScore}`, cx, py + 130);

        // ─── Bonus particles — pop + lever à droite du score ───
        for (let p of this._bonusParticles) {
            if (p.delay > 0) continue;
 
            let maxLife = 120;
            let t       = p.life / maxLife; // 1→0
 
            // Fade in rapide, fade out progressif
            let alpha = t < 0.2
                ? map(t, 0, 0.2, 0, 255)
                : map(t, 0.2, 1.0, 255, 0);
 
            // Pop in scale 0→1 rapidement
            let sc = t > 0.85 ? map(t, 0.85, 1.0, 1.0, 0.0) : 1.0;
 
            push();
            // Juste à droite du score, même hauteur
            translate(cx + 60 + p.x, py + 130 + p.y);
            scale(sc);
 
            // Ombre pour lisibilité
            fill(60, 30, 5, alpha * 0.7);
            noStroke();
            textSize(22);
            textAlign(LEFT, CENTER);
            text(p.txt, 2, 2);
 
            // Texte doré brillant
            fill(255, 220, 60, alpha);
            text(p.txt, 0, 0);
 
            pop();
        }


        // ─── Stats — coin + ennemis uniquement ───
        noStroke();
        let startY = py + 225;
        let lineH  = 50;

        this._drawStatLine(cx, startY,        imgs.coinIcon, `${this.coins} coins`,                    imgs);
        this._drawStatLine(cx, startY + lineH, imgs.sword,   `${this.killed} / ${this.total} enemies`, imgs);

        // ─── Bouton bleu ───
        this._drawButton(cx, py + ph - 30, "PLAY AGAIN", "blue", imgs);
    }

    // =============================================
    // GAME OVER POPUP
    // =============================================
    _drawGameOver(cx, cy, pw, ph, px, py, imgs) {

        // ─── Ribbon rouge — entête ───
        if (imgs.ribbonRed) {
            imageMode(CENTER);
            image(imgs.ribbonRed, cx, py + 30, 400, 72);
        }

        // ─── Titre ───
        noStroke();
        fill(60, 20, 10);
        textSize(38);
        textAlign(CENTER, CENTER);
        text("GAME OVER", cx + 2, py + 24);
        fill(255, 230, 200);
        text("GAME OVER", cx, py + 22);

        

        // ─── Message ───
        noStroke();
        fill(180, 130, 80);
        textSize(30);
        text("Your journey is over...", cx, py + 100);
        text("Death is but a new beginning. Try again?", cx, py + 140);

        // ─── Stats ───
        noStroke();
        let startY = py + 225;
        let lineH  = 46;

        this._drawStatLine(cx, startY,        imgs.coinIcon, `${this.coins} coins`, imgs);
        this._drawStatLine(cx, startY + lineH, imgs.sword,   `${this.killed} / ${this.total} enemies`, imgs);

        

        // ─── Bouton rouge — rejouer ───
        this._drawButton(cx, py + ph - 55, "TRY AGAIN", "red", imgs);
    }

    // =============================================
    // LIGNE DE STAT avec icône
    // =============================================
    _drawStatLine(cx, y, icon, label, imgs) {
        let iconSize = 32;
        let iconX    = cx - 100;

        if (icon) {
            imageMode(CENTER);
            image(icon, iconX, y, iconSize, iconSize);
        }

        fill('#7A5C4E');
        noStroke();
        textSize(28);
        textAlign(LEFT, CENTER);
        text(label, iconX + iconSize, y);
    }

    // =============================================
    // BOUTON
    // =============================================
    _drawButton(cx, cy, label, color, imgs) {
        let bw = 220;
        let bh = 60;

        // Hover detection
        let hovered = (mouseX > cx - bw/2 && mouseX < cx + bw/2 &&
                       mouseY > cy - bh/2 && mouseY < cy + bh/2);

        if (hovered) soundManager.playHover('popup_btn');
        else         soundManager.clearHover();

        // Scale up au hover seulement (pas quand pressé)
        let sc = (hovered && !this.btnPressed) ? 1.08 : 1.0;
        let dw = bw * sc;
        let dh = bh * sc;
        let bx = cx - dw / 2;
        let by = cy - dh / 2;

        // Image selon état pressed
        let btnImg = color === "blue"
            ? (this.btnPressed ? imgs.btnBluePres : imgs.btnBlueReg)
            : (this.btnPressed ? imgs.btnRedPres  : imgs.btnRedReg);

        if (btnImg) {
            imageMode(CORNER);
            image(btnImg, bx, by, dw, dh);
        }

        fill(255);
        noStroke();
        textSize(22 * sc);
        textAlign(CENTER, CENTER);
        // Texte descend légèrement quand pressé
        text(label, cx, cy -5);

        // Hitbox basée sur taille normale pour cohérence
        this._btnX = cx - bw / 2;
        this._btnY = cy - bh / 2;
        this._btnW = bw;
        this._btnH = bh;
    }

    // =============================================
    // GESTION DES CLICS
    // =============================================
    handleClick(mx, my) {
        if (!this.active) return false;

        if (mx > this._btnX && mx < this._btnX + this._btnW &&
            my > this._btnY && my < this._btnY + this._btnH) {
            soundManager.playSelected();
            return true;
        }
        return false;
    }

    handlePress(mx, my) {
        if (!this.active) return;
        if (mx > this._btnX && mx < this._btnX + this._btnW &&
            my > this._btnY && my < this._btnY + this._btnH) {
            this.btnPressed = true;
        }
    }

    handleRelease() {
        this.btnPressed = false;
    }

    // =============================================
    // FORMAT TEMPS mm:ss
    // =============================================
    _formatTime(frames) {
        let total = floor(frames / 60);
        let m     = floor(total / 60);
        let s     = total % 60;
        return `${m}:${String(s).padStart(2, '0')}`;
    }
}