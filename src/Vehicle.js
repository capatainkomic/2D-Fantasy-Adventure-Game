// Calcule la projection orthogonale du point a sur le vecteur b
// Utilisé pour l'obstacle avoidance (curling)
function findProjection(pos, a, b) {
  let v1 = p5.Vector.sub(a, pos);
  let v2 = p5.Vector.sub(b, pos);
  v2.normalize();
  let sp = v1.dot(v2);
  v2.mult(sp);
  v2.add(pos);
  return v2;
}

class Vehicle {
  static debug = false;

  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);

    this.maxSpeed = 4;
    this.maxForce = 0.2;

    // Rayon de collision
    this.r = 48;

    // Zone d'évitement devant le véhicule (obstacle avoidance)
    this.largeurZoneEvitement = this.r / 2;

    // Zone de freinage pour arrive()
    this.rayonZoneDeFreinage = 200;

    // Paramètres wander
    this.distanceCercle = 150;
    this.wanderRadius = 50;
    this.wanderTheta = -Math.PI / 2;
    this.displaceRange = 0.3;

    // Trainée — debug uniquement
    this.path = [];
    this.pathMaxLength = 30;

    // Index du point courant pour followPath()
    this._pathIndex = 0;
  }

  // =============================================
  // SEEK — se diriger vers une cible
  // =============================================
  seek(target, arrival = false) {
    let force = p5.Vector.sub(target, this.pos);
    let desiredSpeed = this.maxSpeed;

    if (arrival) {
      let distance = force.mag();
      if (distance < this.rayonZoneDeFreinage) {
        desiredSpeed = map(distance, 0, this.rayonZoneDeFreinage, 0, this.maxSpeed);
      }
    }

    force.setMag(desiredSpeed);
    force.sub(this.vel);
    force.limit(this.maxForce);
    return force;
  }

  // =============================================
  // ARRIVE — seek avec ralentissement à l'arrivée
  // =============================================
  arrive(target) {
    return this.seek(target, true);
  }

  // =============================================
  // FOLLOW PATH — suit un tableau de points en boucle
  // Utilise arrive() sur le point courant
  // Passe au suivant quand on est dans arrivalRange
  // Composable : retourne une force comme tous les autres behaviours
  // =============================================
  followPath(points, arrivalRange = 50) {
    if (!points || points.length === 0) return createVector(0, 0);

    let target = points[this._pathIndex % points.length];

    // Point atteint → passer au suivant
    if (this.pos.dist(target) < arrivalRange) {
      this._pathIndex = (this._pathIndex + 1) % points.length;
      target = points[this._pathIndex];
    }

    if (Vehicle.debug) {
      push();
      // Dessin du chemin
      noFill(); stroke(0, 255, 0); strokeWeight(1);
      for (let i = 0; i < points.length; i++) {
        let a = points[i];
        let b = points[(i + 1) % points.length];
        line(a.x, a.y, b.x, b.y);
      }
      // Point cible courant
      fill(255, 0, 255); noStroke();
      circle(target.x, target.y, 12);
      pop();
    }

    return this.arrive(target);
  }

  // =============================================
  // FLEE — fuir une cible (inverse de seek)
  // =============================================
  flee(target) {
    return this.seek(target).mult(-1);
  }

  // =============================================
  // PURSUE — poursuivre en anticipant la position future
  // =============================================
  pursue(vehicle) {
    let target = vehicle.pos.copy();
    let prediction = vehicle.vel.copy();
    prediction.mult(10);
    target.add(prediction);

    if (Vehicle.debug) {
      push();
      fill(0, 255, 0); noStroke();
      circle(target.x, target.y, 16);
      pop();
    }

    return this.seek(target);
  }

  // =============================================
  // EVADE — fuir en anticipant la position future
  // =============================================
  evade(vehicle) {
    return this.pursue(vehicle).mult(-1);
  }

  // =============================================
  // WANDER — errance autonome
  // =============================================
  wander() {
    let pointDevant = this.vel.copy();
    pointDevant.setMag(this.distanceCercle);
    pointDevant.add(this.pos);

    let theta = this.wanderTheta + this.vel.heading();
    let pointSurLeCercle = createVector(
      this.wanderRadius * cos(theta),
      this.wanderRadius * sin(theta)
    );
    pointSurLeCercle.add(pointDevant);

    this.wanderTheta += random(-this.displaceRange, this.displaceRange);

    if (Vehicle.debug) {
      push();
      noFill(); stroke(255);
      circle(pointDevant.x, pointDevant.y, this.wanderRadius * 2);
      fill("green"); noStroke();
      circle(pointSurLeCercle.x, pointSurLeCercle.y, 12);
      stroke("yellow");
      line(this.pos.x, this.pos.y, pointSurLeCercle.x, pointSurLeCercle.y);
      pop();
    }

    let force = p5.Vector.sub(pointSurLeCercle, this.pos);
    force.setMag(this.maxForce);
    return force;
  }

  // =============================================
  // AVOID — évitement d'obstacles (technique du curling)
  // =============================================
  avoid(obstacles) {
    if (!obstacles || obstacles.length === 0) return createVector(0, 0);

    let ahead = this.vel.copy();
    ahead.mult(30);
    let pointAhead = p5.Vector.add(this.pos, ahead);

    let ahead2 = this.vel.copy();
    ahead2.mult(15);
    let pointAhead2 = p5.Vector.add(this.pos, ahead2);

    if (Vehicle.debug) {
      push();
      stroke(255, 80);
      strokeWeight(this.largeurZoneEvitement * 2);
      line(this.pos.x, this.pos.y, pointAhead.x, pointAhead.y);
      fill("yellow"); noStroke();
      circle(pointAhead.x, pointAhead.y, 10);
      fill("lightblue");
      circle(pointAhead2.x, pointAhead2.y, 10);
      pop();
    }

    let obstacle = this.getObstacleLePlusProche(obstacles);
    if (!obstacle) return createVector(0, 0);

    let d1 = obstacle.pos.dist(pointAhead);
    let d2 = obstacle.pos.dist(pointAhead2);
    let d3 = obstacle.pos.dist(this.pos);

    let distance = d1;
    let pointLePlusProche = pointAhead;
    if (d2 < distance) { distance = d2; pointLePlusProche = pointAhead2; }
    if (d3 < distance) { distance = d3; pointLePlusProche = this.pos; }

    if (distance < obstacle.r + this.largeurZoneEvitement) {
      let force = p5.Vector.sub(pointLePlusProche, obstacle.pos);
      if (Vehicle.debug) this.drawVector(obstacle.pos, force, "yellow");
      force.setMag(this.maxSpeed);
      force.sub(this.vel);
      force.limit(this.maxForce);
      return force;
    }

    return createVector(0, 0);
  }

  // =============================================
  // SEPARATE — garder ses distances par rapport aux voisins
  // =============================================
  separate(vehicles) {
    let desiredSeparation = this.r * 2;
    let steer = createVector(0, 0);
    let count = 0;

    for (let other of vehicles) {
      let d = p5.Vector.dist(this.pos, other.pos);
      if (d > 0 && d < desiredSeparation) {
        let diff = p5.Vector.sub(this.pos, other.pos);
        diff.normalize();
        diff.div(d);
        steer.add(diff);
        count++;
      }
    }

    if (count > 0) steer.div(count);

    if (steer.mag() > 0) {
      steer.setMag(this.maxSpeed);
      steer.sub(this.vel);
      steer.limit(this.maxForce);
    }

    return steer;
  }

  // =============================================
  // COHESION — se rapprocher du centre du groupe
  // =============================================
  cohesion(vehicles) {
    let neighbourDist = 150;
    let sum = createVector(0, 0);
    let count = 0;

    for (let other of vehicles) {
      let d = p5.Vector.dist(this.pos, other.pos);
      if (d > 0 && d < neighbourDist) {
        sum.add(other.pos);
        count++;
      }
    }

    if (count > 0) {
      sum.div(count);
      return this.seek(sum);
    }

    return createVector(0, 0);
  }

  // =============================================
  // ALIGN — s'aligner sur la direction du groupe
  // =============================================
  align(vehicles) {
    let neighbourDist = 150;
    let sum = createVector(0, 0);
    let count = 0;

    for (let other of vehicles) {
      let d = p5.Vector.dist(this.pos, other.pos);
      if (d > 0 && d < neighbourDist) {
        sum.add(other.vel);
        count++;
      }
    }

    if (count > 0) {
      sum.div(count);
      sum.setMag(this.maxSpeed);
      let steer = p5.Vector.sub(sum, this.vel);
      steer.limit(this.maxForce);
      return steer;
    }

    return createVector(0, 0);
  }

  // =============================================
  // BOUNDARIES — rester dans une zone rectangulaire
  // =============================================
  boundaries(bx, by, bw, bh, d = 50) {
    let vitesseDesiree = null;

    if (this.pos.x < bx + d) {
      vitesseDesiree = createVector(this.maxSpeed, this.vel.y);
    } else if (this.pos.x > bx + bw - d) {
      vitesseDesiree = createVector(-this.maxSpeed, this.vel.y);
    }
    if (this.pos.y < by + d) {
      vitesseDesiree = createVector(this.vel.x, this.maxSpeed);
    } else if (this.pos.y > by + bh - d) {
      vitesseDesiree = createVector(this.vel.x, -this.maxSpeed);
    }

    if (vitesseDesiree !== null) {
      vitesseDesiree.setMag(this.maxSpeed);
      const force = p5.Vector.sub(vitesseDesiree, this.vel);
      force.limit(this.maxForce);

      if (Vehicle.debug) {
        push();
        noFill(); stroke("red");
        rect(bx + d, by + d, bw - 2 * d, bh - 2 * d);
        pop();
      }

      return force;
    }

    return createVector(0, 0);
  }

  // =============================================
  // EDGES — téléportation aux bords (NPC externes)
  // =============================================
  edges() {
    if (this.pos.x > width + this.r)  this.pos.x = -this.r;
    else if (this.pos.x < -this.r)    this.pos.x = width + this.r;
    if (this.pos.y > height + this.r) this.pos.y = -this.r;
    else if (this.pos.y < -this.r)    this.pos.y = height + this.r;
  }

  // =============================================
  // HELPERS
  // =============================================
  getObstacleLePlusProche(obstacles) {
    let plusPetiteDistance = Infinity;
    let obstacleLePlusProche = null;
    for (let o of obstacles) {
      const d = this.pos.dist(o.pos);
      if (d < plusPetiteDistance) {
        plusPetiteDistance = d;
        obstacleLePlusProche = o;
      }
    }
    return obstacleLePlusProche;
  }

  getVehiculeLePlusProche(vehicles) {
    let plusPetiteDistance = Infinity;
    let vehiculeLePlusProche = null;
    for (let v of vehicles) {
      if (v !== this) {
        const d = this.pos.dist(v.pos);
        if (d < plusPetiteDistance) {
          plusPetiteDistance = d;
          vehiculeLePlusProche = v;
        }
      }
    }
    return vehiculeLePlusProche;
  }

  // =============================================
  // APPLY FORCE — toujours passer par ici, jamais de mutation directe
  // =============================================
  applyForce(force) {
    this.acc.add(force);
  }

  // =============================================
  // UPDATE — mise à jour physique
  // =============================================
  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.set(0, 0);

    if (Vehicle.debug) this._ajoutePosAuPath();
  }

  _ajoutePosAuPath() {
    this.path.push(this.pos.copy());
    if (this.path.length > this.pathMaxLength) this.path.shift();
  }

  // =============================================
  // SHOW — à surcharger dans les sous-classes avec un sprite
  // En debug : affiche rayon de collision + trainée
  // =============================================
  show() {
    if (!Vehicle.debug) return;

    push();
    // Trainée
    noFill(); stroke(255, 80); strokeWeight(1);
    this.path.forEach((p, i) => { if (!(i % 5)) circle(p.x, p.y, 2); });
    // Rayon de collision
    noFill(); stroke(0, 255, 0, 150); strokeWeight(1);
    circle(this.pos.x, this.pos.y, this.r * 2);
    pop();
  }

  // =============================================
  // DEBUG HELPER — dessine un vecteur avec une flèche
  // =============================================
  drawVector(pos, v, couleur) {
    push();
    strokeWeight(2);
    stroke(couleur);
    line(pos.x, pos.y, pos.x + v.x, pos.y + v.y);
    let arrowSize = 5;
    translate(pos.x + v.x, pos.y + v.y);
    rotate(v.heading());
    translate(-arrowSize / 2, 0);
    fill(couleur); noStroke();
    triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
    pop();
  }
}