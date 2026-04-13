// DebugPanel — panel de debug HTML/CSS injecté dans le DOM.
// Affiché/caché avec la touche 'd'.
// Panel gauche  : sliders entités (Player, Enemy, Sheep) + add/remove sheep
// Panel droit   : toggles debug visuel des behaviors + obstacles
class DebugPanel {

    // Behaviors qui ont une représentation visuelle de debug dans Vehicle.js
    // Behaviors dont le debug est dans Vehicle.js — on active juste le flag
    static VEHICLE_DEBUG_FLAGS = {
        'avoid':      'debugAvoid',
        'followPath': 'debugPath',
        'boundaries': 'debugBoundaries',
        'separate':   'debugSeparate',
        'cohesion':   'debugCohesion',
        'align':      'debugAlign',
    };
    // Tout le debug est dans Vehicle.js
    static PANEL_DEBUG_BEHAVIORS = [];

    constructor({ player, enemies, sheeps, obstacles }) {
        this.player    = player;
        this.enemies   = enemies;
        this.sheeps    = sheeps;
        this.obstacles = obstacles;

        this.visible = false;

        // Flags pour les behaviors dessinés dans DebugPanel
        this.debugFlags = {};
        for (const name of DebugPanel.PANEL_DEBUG_BEHAVIORS) {
            this.debugFlags[name] = false;
        }
        this.debugObstacles  = false;
        this.debugCollisions = false;

        // Init des flags Vehicle à false
        Object.values(DebugPanel.VEHICLE_DEBUG_FLAGS).forEach(flag => { Vehicle[flag] = false; });

        this._leftPanel  = null;
        this._rightPanel = null;

        this._inject();
        this._hide();
    }

    // ─── Toggle ──────────────────────────────────────────────────

    toggle() {
        this.visible = !this.visible;
        this.visible ? this._show() : this._hide();
    }

    // ─── Injection DOM ───────────────────────────────────────────

    _inject() {
        this._injectStyles();

        this._leftPanel  = this._createPanel('debug-panel-left',  'left');
        this._rightPanel = this._createPanel('debug-panel-right', 'right');

        this._buildLeftPanel();
        this._buildRightPanel();

        document.body.appendChild(this._leftPanel);
        document.body.appendChild(this._rightPanel);
    }

    _injectStyles() {
        const link = document.createElement('link');
        link.rel  = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600&family=Exo+2:wght@300;400;500&display=swap';
        document.head.appendChild(link);

        const style = document.createElement('style');
        style.textContent = `
            .debug-panel {
                position: fixed;
                top: 50%;
                transform: translateY(-50%);
                width: 420px;
                max-height: 90vh;
                overflow-y: auto;

                /* Glassmorphism sombre flouté */
                background: rgba(8, 12, 28, 0.50);
                backdrop-filter: blur(32px) saturate(180%);
                -webkit-backdrop-filter: blur(32px) saturate(180%);
                border: 1px solid rgba(255, 255, 255, 0.12);
                border-top: 1px solid rgba(255, 255, 255, 0.22);
                border-left: 1px solid rgba(255, 255, 255, 0.16);
                border-radius: 20px;
                padding: 24px;
                box-shadow:
                    0 16px 48px rgba(0, 0, 0, 0.65),
                    0 4px 16px rgba(0, 0, 0, 0.45),
                    inset 0 1px 0 rgba(255, 255, 255, 0.10);

                color: rgba(255, 255, 255, 0.90);
                font-family: 'Exo 2', sans-serif;
                font-size: 14px;
                font-weight: 400;
                z-index: 9;
                box-sizing: border-box;
                letter-spacing: 0.3px;
            }

            .debug-panel-left  { left: calc(var(--canvas-left) - 450px); }
            .debug-panel-right { left: calc(var(--canvas-left) + var(--canvas-w) + 30px); }

            .debug-panel::-webkit-scrollbar { width: 4px; }
            .debug-panel::-webkit-scrollbar-track { background: transparent; }
            .debug-panel::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.18);
                border-radius: 4px;
            }

            .debug-panel-title {
                font-family: 'Rajdhani', sans-serif;
                font-size: 17px;
                font-weight: 600;
                letter-spacing: 4px;
                text-align: center;
                text-transform: uppercase;
                color: #ffffff;
                margin-bottom: 18px;
                padding-bottom: 12px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.12);
            }

            .debug-section {
                margin-bottom: 18px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.07);
                padding-bottom: 14px;
            }
            .debug-section:last-child { border-bottom: none; margin-bottom: 0; }

            .debug-section-header {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 12px;
            }
            .debug-section-header img {
                width: 54px;
                height: 54px;
                object-fit: cover;
                border-radius: 10px;
                border: 1px solid rgba(255, 255, 255, 0.20);
                box-shadow: 0 4px 14px rgba(0, 0, 0, 0.55);
            }
            .debug-section-title {
                font-family: 'Rajdhani', sans-serif;
                font-size: 15px;
                font-weight: 600;
                letter-spacing: 2.5px;
                text-transform: uppercase;
                color: #ffffff;
            }

            .debug-subsection-title {
                font-size: 11px;
                font-weight: 500;
                letter-spacing: 2px;
                text-transform: uppercase;
                color: rgba(255, 255, 255, 0.42);
                margin: 12px 0 7px 0;
            }

            .debug-row {
                display: flex;
                align-items: center;
                margin-bottom: 8px;
                gap: 10px;
            }
            .debug-row label {
                flex: 1.2;
                color: rgba(255, 255, 255, 0.78);
                font-size: 13px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .debug-row input[type=range] {
                flex: 1.6;
                accent-color: #7ecfff;
                cursor: pointer;
                opacity: 0.80;
            }
            .debug-row input[type=range]:hover { opacity: 1; }
            .debug-row .val {
                width: 38px;
                text-align: right;
                color: #ffffff;
                font-size: 13px;
                font-weight: 600;
                flex-shrink: 0;
            }

            .debug-btn-row {
                display: flex;
                gap: 8px;
                margin-top: 10px;
                align-items: center;
            }
            .debug-btn {
                flex: 1;
                padding: 7px 0;
                background: rgba(255, 255, 255, 0.08);
                border: 1px solid rgba(255, 255, 255, 0.16);
                border-radius: 10px;
                color: rgba(255, 255, 255, 0.88);
                font-family: 'Exo 2', sans-serif;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                transition: background 0.15s, border-color 0.15s;
            }
            .debug-btn:hover {
                background: rgba(255, 255, 255, 0.16);
                border-color: rgba(255, 255, 255, 0.30);
            }

            .debug-toggle-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 7px;
                padding: 2px 0;
            }
            .debug-toggle-row label {
                color: rgba(255, 255, 255, 0.78);
                font-size: 13px;
                cursor: pointer;
                flex: 1;
                display: flex;
                align-items: center;
                gap: 7px;
            }
            .debug-toggle-row input[type=checkbox] {
                accent-color: #7ecfff;
                cursor: pointer;
                width: 15px;
                height: 15px;
                flex-shrink: 0;
            }

            .debug-sheep-count {
                color: #ffffff;
                font-size: 15px;
                font-weight: 600;
                min-width: 30px;
                text-align: center;
            }

            .debug-color-dot {
                display: inline-block;
                width: 9px;
                height: 9px;
                border-radius: 50%;
                flex-shrink: 0;
                box-shadow: 0 0 5px currentColor;
            }
        `;
        document.head.appendChild(style);
    }

    _createPanel(id, side) {
        const panel = document.createElement('div');
        panel.id        = id;
        panel.className = `debug-panel debug-panel-${side}`;
        return panel;
    }

    // ─── Panel gauche : entités ───────────────────────────────────

    _buildLeftPanel() {
        this._leftPanel.innerHTML = '';

        const title = document.createElement('div');
        title.className   = 'debug-panel-title';
        title.textContent = '⚙ ENTITIES';
        this._leftPanel.appendChild(title);

        this._buildEntitySection(this._leftPanel, 'PLAYER', '../assets/ui/Human Avatars/Avatar_Sword_Hero.png', this.player);
        this._buildEntitySection(this._leftPanel, 'ENEMY',  '../assets/ui/Human Avatars/Avatar_Enemy.png',      this.enemies[0]);
        this._buildSheepSection(this._leftPanel);
    }

    _buildEntitySection(parent, label, avatarSrc, entity) {
        if (!entity) return;

        const section = document.createElement('div');
        section.className = 'debug-section';

        // Header avec avatar
        section.innerHTML = `
            <div class="debug-section-header">
                <img src="${avatarSrc}" alt="${label}" style="object-fit: contain; background: rgba(0,0,0,0.3);">
                <span class="debug-section-title">${label}</span>
            </div>
        `;

        // Slider maxSpeed — propage à tous les ennemis si c'est la section enemy
        const isEnemy = label === 'ENEMY';
        section.appendChild(this._makeSlider(
            'maxSpeed', entity.maxSpeed, 0.5, 10, 0.1,
            (v) => {
                if (isEnemy) { for (const e of this.enemies) e.maxSpeed = v; }
                else         { entity.maxSpeed = v; }
            }
        ));

        // Sliders behaviors
        if (entity.behaviors) {
            for (const b of entity.behaviors.list()) {
                if (b.name.includes('Drag')) continue;
                const bName = b.name;
                section.appendChild(this._makeSlider(
                    bName, b.weight, 0, 10, 0.1,
                    (v) => {
                        if (isEnemy) { for (const e of this.enemies) e.behaviors.setWeight(bName, v); }
                        else         { entity.behaviors.setWeight(bName, v); }
                    }
                ));
            }
        }

        parent.appendChild(section);
    }

    _buildSheepSection(parent) {
        const section = document.createElement('div');
        section.className = 'debug-section';

        section.innerHTML = `
            <div class="debug-section-header">
                <img src="../assets/ui/Human Avatars/Avatar_Sheep.png" alt="SHEEP"
                     style="object-fit: contain; background: rgba(0,0,0,0.3);">
                <span class="debug-section-title">SHEEP</span>
            </div>
        `;

        // Sliders sur le premier mouton comme référence
        if (this.sheeps.length > 0) {
            const ref = this.sheeps[0];
            section.appendChild(this._makeSlider(
                'maxSpeed', ref.maxSpeed, 0.5, 8, 0.1,
                (v) => { for (const s of this.sheeps) s.maxSpeed = v; }
            ));

            if (ref.behaviors) {
                for (const b of ref.behaviors.list()) {
                    if (b.name.includes('Drag')) continue;
                    section.appendChild(this._makeSlider(
                        b.name, b.weight, 0, 10, 0.1,
                        (v) => { for (const s of this.sheeps) s.behaviors.setWeight(b.name, v); }
                    ));
                }
            }
        }

        // Compteur + boutons add/remove
        const countRow = document.createElement('div');
        countRow.className = 'debug-btn-row';
        countRow.style.alignItems = 'center';

        const countLabel = document.createElement('span');
        countLabel.className = 'debug-sheep-count';
        countLabel.id        = 'debug-sheep-count';
        countLabel.textContent = this.sheeps.length;

        const btnRemove = document.createElement('button');
        btnRemove.className   = 'debug-btn';
        btnRemove.textContent = '− Sheep';
        btnRemove.onclick = () => {
            if (this.sheeps.length > 0) {
                this.sheeps.pop();
                countLabel.textContent = this.sheeps.length;
            }
        };

        const btnAdd = document.createElement('button');
        btnAdd.className   = 'debug-btn';
        btnAdd.textContent = '+ Sheep';
        btnAdd.onclick = () => {
            // Spawn proche du centre du troupeau existant ou position par défaut
            const ref    = this.sheeps[0];
            const spawnX = ref ? ref.pos.x + random(-60, 60) : 600;
            const spawnY = ref ? ref.pos.y + random(-60, 60) : 600;
            this.sheeps.push(new Sheep(spawnX, spawnY));
            countLabel.textContent = this.sheeps.length;
        };

        countRow.appendChild(btnRemove);
        countRow.appendChild(countLabel);
        countRow.appendChild(btnAdd);
        section.appendChild(countRow);

        parent.appendChild(section);
    }

    // ─── Panel droit : debug visuel ───────────────────────────────

    _buildRightPanel() {
        this._rightPanel.innerHTML = '';

        const title = document.createElement('div');
        title.className   = 'debug-panel-title';
        title.textContent = '👁 BEHAVIORS DEBUG';
        this._rightPanel.appendChild(title);

        // Section debug visuel behaviors
        const behaviorSection = document.createElement('div');
        behaviorSection.className = 'debug-section';

        const behaviorTitle = document.createElement('div');
        behaviorTitle.className = 'debug-section-title';
        behaviorTitle.style.marginBottom = '8px';
        behaviorTitle.textContent = 'VISUAL DEBUG';
        behaviorSection.appendChild(behaviorTitle);

        // Behaviors gérés dans Vehicle.js — active le flag Vehicle.debugXxx
        const vehicleFlagColors = {
            'avoid':      '#ffcc00',
            'followPath': '#aaaaaa',
            'boundaries': '#ff6600',
            'separate':   '#ff88ff',
            'cohesion':   '#88ccff',
            'align':      '#88ffcc',
        };
        for (const [name, flag] of Object.entries(DebugPanel.VEHICLE_DEBUG_FLAGS)) {
            const color = vehicleFlagColors[name];
            behaviorSection.appendChild(this._makeColorToggle(
                name, color, false,
                (checked) => { Vehicle[flag] = checked; }
            ));
        }



        this._rightPanel.appendChild(behaviorSection);

        // Section obstacles + collisions
        const obsSection = document.createElement('div');
        obsSection.className = 'debug-section';

        const obsTitle = document.createElement('div');
        obsTitle.className = 'debug-section-title';
        obsTitle.style.marginBottom = '8px';
        obsTitle.textContent = 'OBSTACLES & COLLISIONS';
        obsSection.appendChild(obsTitle);

        obsSection.appendChild(this._makeColorToggle(
            'obstacles (colliders)', '#ff3300', false,
            (checked) => { this.debugObstacles = checked; }
        ));
        obsSection.appendChild(this._makeColorToggle(
            'hitboxes AABB', '#00aaff', false,
            (checked) => { this.debugCollisions = checked; }
        ));
        obsSection.appendChild(this._makeColorToggle(
            'Vehicle.debug (all)', '#888888', false,
            (checked) => {
                Vehicle.debug = checked;
                // Active aussi tous les flags individuels
                Object.values(DebugPanel.VEHICLE_DEBUG_FLAGS).forEach(f => Vehicle[f] = checked);
                Object.keys(this.debugFlags).forEach(k => this.debugFlags[k] = checked);
            }
        ));

        this._rightPanel.appendChild(obsSection);
    }

    // ─── Helpers DOM ──────────────────────────────────────────────

    _makeSlider(name, initialValue, min, max, step, onChange) {
        const row = document.createElement('div');
        row.className = 'debug-row';

        const label = document.createElement('label');
        label.textContent = name;

        const slider = document.createElement('input');
        slider.type  = 'range';
        slider.min   = min;
        slider.max   = max;
        slider.step  = step;
        slider.value = initialValue;

        const valDisplay = document.createElement('span');
        valDisplay.className   = 'val';
        valDisplay.textContent = Number(initialValue).toFixed(1);

        slider.oninput = () => {
            const v = parseFloat(slider.value);
            valDisplay.textContent = v.toFixed(1);
            onChange(v);
        };

        row.appendChild(label);
        row.appendChild(slider);
        row.appendChild(valDisplay);
        return row;
    }

    _makeToggle(name, initialValue, onChange) {
        const row = document.createElement('div');
        row.className = 'debug-toggle-row';

        const id      = 'dbg-' + name.replace(/\s+/g, '-');
        const label   = document.createElement('label');
        label.htmlFor = id;
        label.textContent = name;

        const checkbox    = document.createElement('input');
        checkbox.type     = 'checkbox';
        checkbox.id       = id;
        checkbox.checked  = initialValue;
        checkbox.onchange = () => onChange(checkbox.checked);

        row.appendChild(label);
        row.appendChild(checkbox);
        return row;
    }

    // ─── Visibilité ───────────────────────────────────────────────

    _show() {
        this._leftPanel.style.display  = 'block';
        this._rightPanel.style.display = 'block';
    }

    _hide() {
        this._leftPanel.style.display  = 'none';
        this._rightPanel.style.display = 'none';
    }

    // ─── Debug draw p5 — appelé depuis draw() dans sketch.js ─────
    drawDebug(entities, player, enemies) {
        if (!this.visible) return;

        // Behaviors dessinés dans DebugPanel (flee, separate, cohesion, align, boundaries)
        for (const entity of entities) {
            for (const name of DebugPanel.PANEL_DEBUG_BEHAVIORS) {
                if (!this.debugFlags[name]) continue;
                this._drawBehaviorDebug(entity, name);
            }
        }

        // Obstacles — rempli rouge + point noir au centre (style obstacle.js de référence)
        if (this.debugObstacles) {
            for (const obs of this.obstacles) {
                push();
                fill(255, 0, 0, 80);
                stroke(255, 0, 0, 220);
                strokeWeight(2);
                circle(obs.pos.x, obs.pos.y, obs.r * 2);
                fill(0); noStroke();
                circle(obs.pos.x, obs.pos.y, 8);
                pop();
            }
        }

        // Hitboxes AABB
        if (this.debugCollisions && player && enemies) {
            this._drawCollisionDebug(player, enemies);
        }
    }

    // Behaviors dessinés ici — ceux non gérés par Vehicle.js
    _drawBehaviorDebug(entity, name) {
        push();
        switch (name) {

            // Separate : cercle de séparation magenta double
            case 'separate': {
                const sepR = entity.r * 2;
                stroke(255, 80, 255, 160); strokeWeight(1); noFill();
                circle(entity.pos.x, entity.pos.y, sepR * 2);
                stroke(255, 80, 255, 60);
                circle(entity.pos.x, entity.pos.y, sepR * 3);
                break;
            }

            // Cohesion : cercle cyan rempli semi-transparent
            case 'cohesion': {
                stroke(80, 200, 255, 120); strokeWeight(1); noFill();
                circle(entity.pos.x, entity.pos.y, 300);
                fill(80, 200, 255, 20); noStroke();
                circle(entity.pos.x, entity.pos.y, 300);
                break;
            }

            // Align : cercle cyan clair en pointillés
            case 'align': {
                drawingContext.setLineDash([4, 8]);
                stroke(80, 255, 180, 120); strokeWeight(1); noFill();
                circle(entity.pos.x, entity.pos.y, 300);
                drawingContext.setLineDash([]);
                break;
            }
        }
        pop();
    }

    // AABB hitboxes joueur + ennemis
    _drawCollisionDebug(player, enemies) {
        push();
        noFill(); strokeWeight(1.5);

        stroke(0, 120, 255, 220);
        const ph = this._getHurtbox(player);
        rect(ph.x, ph.y, ph.w, ph.h);

        if (player.isSlashActive?.()) {
            stroke(0, 255, 80, 220);
            const pa = this._getAttackBox(player);
            rect(pa.x, pa.y, pa.w, pa.h);
        }

        for (const enemy of enemies) {
            if (enemy.isDead()) continue;
            stroke(255, 30, 30, 220);
            const eh = this._getHurtbox(enemy);
            rect(eh.x, eh.y, eh.w, eh.h);
            if (enemy.state === 'attack') {
                stroke(255, 140, 0, 220);
                const ea = this._getAttackBox(enemy);
                rect(ea.x, ea.y, ea.w, ea.h);
            }
        }
        pop();
    }

    _getHurtbox(entity) {
        const s = entity.displaySize * 0.3;
        return { x: entity.pos.x - s/2, y: entity.pos.y - s/2, w: s, h: s };
    }

    _getAttackBox(entity) {
        const w    = entity.displaySize * 0.4;
        const h    = entity.displaySize * 0.3;
        const offX = entity.facingRight
            ?  entity.displaySize * 0.2
            : -entity.displaySize * 0.2 - w;
        return { x: entity.pos.x + offX, y: entity.pos.y - h/2, w, h };
    }

    // Toggle avec point de couleur
    _makeColorToggle(label, color, initialValue, onChange) {
        const row = document.createElement('div');
        row.className = 'debug-toggle-row';

        const dot = document.createElement('span');
        dot.className             = 'debug-color-dot';
        dot.style.backgroundColor = color;
        dot.style.display         = 'inline-block';
        dot.style.width           = '8px';
        dot.style.height          = '8px';
        dot.style.borderRadius    = '50%';
        dot.style.marginRight     = '6px';
        dot.style.flexShrink      = '0';

        const lbl = document.createElement('label');
        lbl.style.display    = 'flex';
        lbl.style.alignItems = 'center';
        lbl.style.flex       = '1';
        lbl.textContent      = label;
        lbl.prepend(dot);

        const cb    = document.createElement('input');
        cb.type     = 'checkbox';
        cb.checked  = initialValue;
        cb.onchange = () => onChange(cb.checked);

        row.appendChild(lbl);
        row.appendChild(cb);
        return row;
    }
}