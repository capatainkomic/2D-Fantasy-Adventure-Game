// =============================================
// SoundManager — centralise tous les sons du jeu
// Utilise p5.sound (p5.SoundFile)
// =============================================
class SoundManager {

    constructor() {
        // SFX
        this.swordSlash  = null;
        this.hit         = null;
        this.coinCollect = null;
        this.heal        = null;
        this.enemyDeath  = null;
        this.sparkle     = null; 

        // Interface
        this.selected    = null;
        this.hover       = null;
        this.gameWinner  = null;
        this.gameOver    = null;

        // Musique de fond
        this.bgMusic     = null;

        // Volumes
        this._sfxVolume  = 0.6;
        this._musicVolume = 0.3;

        // Anti-spam hover
        this._lastHoveredBtn = null;
    }

    preload() {
        this.swordSlash  = loadSound("./assets/sounds/SFX/sword_slash.mp3");
        this.hit         = loadSound("./assets/sounds/SFX/hit.mp3");
        this.sparkle      = loadSound("./assets/sounds/SFX/magic_sparkle.mp3");
        this.coinCollect = loadSound("./assets/sounds/SFX/coin_collect.mp3");
        this.heal        = loadSound("./assets/sounds/SFX/heal.wav");
        this.enemyDeath  = loadSound("./assets/sounds/SFX/enemy_death.mp3");
        this.selected    = loadSound("./assets/sounds/SFX/selected.wav");
        this.hover       = loadSound("./assets/sounds/SFX/hover.mp3");
        this.gameWinner  = loadSound("./assets/sounds/SFX/game_winner.mp3");
        this.gameOver    = loadSound("./assets/sounds/SFX/game_over.mp3");
        this.bgMusic     = loadSound("./assets/sounds/Music/05 - Battle 1.wav");
    }

    // ─── Démarrer la musique de fond ───
    startMusic() {
        if (!this.bgMusic) return;
        this.bgMusic.setVolume(this._musicVolume);
        this.bgMusic.loop();
    }

    stopMusic() {
        if (this.bgMusic && this.bgMusic.isPlaying()) this.bgMusic.stop();
    }

    // ─── SFX joueur ───
    playSwordSlash() {
        this._play(this.swordSlash);
    }

    playHit() {
        this._play(this.hit);
    }

    playCoinCollect() {
        this._play(this.coinCollect, 0.5); // volume réduit — peut jouer souvent
    }

    playHeal() {
        this._play(this.heal);
    }

    // ─── SFX ennemi ───
    playEnemyDeath() {
        this._play(this.enemyDeath);
    }

    // ─── SFX interface ───
    playSelected() {
        this._play(this.selected);
    }

    playHover(btnId) {
        // Anti-spam — joue seulement si on change de bouton
        if (btnId === this._lastHoveredBtn) return;
        this._lastHoveredBtn = btnId;
        this._play(this.hover, 0.4);
    }

    clearHover() {
        this._lastHoveredBtn = null;
    }

    playWin() {
        this.stopMusic();
        this._play(this.gameWinner);
    }

    playGameOver() {
        this.stopMusic();
        this._play(this.gameOver);
    }

    playSparkle() {
        this._play(this.sparkle, 0.5);
    }

    // ─── Utilitaire interne ───
    _play(sound, vol = null) {
        if (!sound) return;
        sound.setVolume(vol !== null ? vol : this._sfxVolume);
        if (sound.isPlaying()) sound.stop();
        sound.play();
    }
}

// Instance globale
const soundManager = new SoundManager();