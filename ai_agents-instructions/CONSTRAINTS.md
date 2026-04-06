



## 🧱 Core Principles (NON-NEGOTIABLE)

### 1. Vehicle Model

All entities are **vehicles**:

* position (p5.Vector)
* velocity (p5.Vector)
* acceleration (p5.Vector)
* maxSpeed
* maxForce

Movement is controlled via forces, NOT direct position changes. ([natureofcode.com][1])


### 2. Steering Law (FUNDAMENTAL)

All behaviors MUST follow:

```
steering = desired_velocity - current_velocity
```

* desired_velocity is direction × maxSpeed
* steering is limited by maxForce

👉 This rule is the foundation of ALL behaviors. ([/SKILL][2])

---

### 3. Layered Architecture

System MUST respect:

1. Action Selection → WHAT to do
2. Steering → HOW to move
3. Locomotion → APPLY movement

This repo focuses ONLY on **steering layer**.

## 🚨 HARD CONSTRAINTS

### 🔒 Vehicle.js is IMMUTABLE

* NEVER modify `Vehicle.js`
* NEVER duplicate its behaviors
* NEVER override its internal logic

---

### 🧬 EVERYTHING IS A VEHICLE

* EVERY visible object MUST extend `Vehicle`
* NO exceptions

✅ Valid:

```js
class Enemy extends Vehicle {}
class Player extends Vehicle {}
class Boid extends Vehicle {}
```

❌ Invalid:

```js
class Bullet {}           // ❌ forbidden
class Particle {}         // ❌ forbidden
```

---

### ⚙️ Behavior Rules

* NEVER create monolithic movement logic
* NEVER bypass `applyForce`
* NEVER directly mutate position

❌ Forbidden:

```js
this.position.add(this.velocity)
```

---

## 🧩 Code Architecture

### Required Structure

```
index.html 
sketch.js
src/
    Vehicle.js           // core (immutable)

    entities/
        ThiefEnemy.js      // extends Vehicle  
        OgreEnemy.js       // extends Vehicle
        Player.js          // extends Vehicle 
        NPC.js             // extends Vehicle / classe mere des PNJ 
        Sheep.js           // extends NPC 
        Pawn.js            // extends NPC  
        AnimalFriend.js    // extends Vehicle


    objects/ 
        Collectible.js     // extends Vehicle
        Coin.js            // extends Collectible.js 
        Meat.js            // extends Collectible.js 
        Obstacle.js
    ui/ 
        DebugPanel.js
        HUD.js
        Menu.js
        GameOverMenu.js 

    ```

## 🎮 p5.js Rules

* MUST use `p5.Vector`
* NO external physics engine
* NO external dependencies

---

## 🧠 Agent Responsibilities

When generating code, an AI agent MUST:

### 1. Respect invariants

* Do not modify `Vehicle.js`
* Ensure all entities extend `Vehicle`

---

### 2. Declare file changes

ALWAYS specify:

* files to create
* files to modify

---

### 3. Use composition

Example:

```js
let force = createVector(0, 0);

force.add(this.seek(target));
force.add(this.wander().mult(0.5));

this.applyForce(force);
```

---

### 4. Stay within steering paradigm

* No pathfinding unless explicitly required
* No global planning
* Only local perception

---

## 🧪 Validation Checklist

Before outputting code, ALWAYS verify:

* [ ] Is it using forces?
* [ ] Is it based on desired_velocity - velocity?
* [ ] Is every entity a Vehicle subclass?
* [ ] Are behaviors composable?
* [ ] Is Vehicle.js untouched?

If ANY answer is NO → fix before responding.

---

## 🎯 Design Goals

The system should produce:

* smooth motion
* believable agents
* emergent behaviors
* scalable simulation (many agents)

---

## 🔁 Failure Conditions

Any generated solution is INVALID if:

* it modifies `Vehicle.js`
* it creates non-Vehicle entities
* it uses direct movement instead of forces
* it merges behaviors into one function
* it ignores Reynolds principles

---

## 🧠 Philosophy

> Simple rules + local perception → complex behavior

Agents should **feel alive**, not scripted.

---

## 📌 Final Rule

When in doubt:

👉 reuse existing behaviors
👉 combine forces
👉 NEVER break the vehicle model

[1]: https://natureofcode.com/autonomous-agents/?utm_source=chatgpt.com "Chapter 5: Autonomous Agents"
[2]: https://www.slashskill.com/steering-behaviors-for-game-ai-avoidance-and-anti-oscillation-in-godot-4/?utm_source=chatgpt.com "Steering Behaviors for Game AI: How to Build Avoidance and ..."
[3]: https://www.red3d.com/cwr/steer/gdc99/?utm_source=chatgpt.com "Steering Behaviors For Autonomous Characters - red3d.com"
