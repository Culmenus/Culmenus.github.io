
import { spatialManager, entityManager } from "../index.js";

export class Ghost {
  constructor(x = 100, y = 10, color = "red") {
    this.c = color;
    this.panicColor = "blue";
    this.panic = false;
    this.radius = 10;
    this.geometry = new THREE.CapsuleGeometry(this.radius, 15, 16, 32); // cons: radius, length, capSegs, heightSegs
    this.material = new THREE.MeshPhongMaterial({ color: this.c, specular: "#111111", emissive: "#404040", shininess: 30, combine: THREE.MultiplyOperation, reflectivity: 0.6 });
    this.shape = new THREE.Mesh(this.geometry, this.material);
    this.vel = 1.4;
    this.velX;
    this.velY;
    this.out = false;
    if (Math.random() < 0.5) {
      this.velX = this.vel;
    } else {
      this.velX = -this.vel;
    }
    if (Math.random() < 0.5) {
      this.velY = 0;
    } else if (Math.random() < 0.5) {
      this.velY = this.vel;
    } else {
      this.velY = -this.vel;
    }
    this.origX = x;
    this.origY = y;
    this.position = new THREE.Vector3(x, y, 0);
    this.shape.rotation.x = Math.PI / 2;
    this.shape.position.copy(this.position);
  }

  update() {
    if (this.panic) {
      //... ekki vera ad scanna amk.. kannski reyna ad fordast pacman
    } else {
      // this.scan();mby reyna ad fara i attina ad pacman...
    }
    this.collide(); 
    
    // finally update position;
    this.position["x"] += this.velX;
    this.position["y"] += this.velY;
    this.shape.position.copy(this.position);
    this.shape.updateMatrix();

  }
  collide () {
    this.nextX = this.position["x"] + this.velX;
    this.nextY = this.position["y"] + this.velY;

    if (spatialManager.isSphereCollision(this, entityManager.pacman)) {
      if (this.panic) {;
        this.die();
        return;
      } else {
        entityManager.pacman.die();
      }
    }

    // wall collide
    this.wallCollide();
    if (!this.out)
      this.getOut();
    // world bounds
    // if (this.nextX < 0)
    
  }

  // ghosts collide with walls
  wallCollide() {
    switch(spatialManager.isWallCollision(this)) {
      case 0:
        this.velX = 0;
        this.velY = Math.random() < 0.5 ? this.vel : -this.vel;
        this.nextX = this.position["x"] + this.velX;
        this.nextY = this.position["y"] + this.velY;
        this.wallCollide(); // næsta gæti verið ólöglegt, prófum aftur
        break;
      case 1:
        this.velX = Math.random() < 0.5 ? this.vel : -this.vel;
        this.velY = 0;
        this.nextX = this.position["x"] + this.velX;
        this.nextY = this.position["y"] + this.velY;
        this.wallCollide(); // næsta gæti verið ólöglegt, prófum aftur
        break;
      default: 
        break;
    }
  }

  // guide ghosts out of starting maze
  getOut() {
    let x = this.position["x"];
    let y = this.position["y"];
    let middle = entityManager.level.middle;
    if (Math.abs(y - middle) < 4*entityManager.level.baseLength -2&&
      Math.abs(x - middle) < 5) {
        this.velX = 0;
        this.velY = -this.vel;
        this.out = true; // keyrist einu sinni fyrir hvert lifespan draugs i mesta lagi
    }
  }

  panik () {
    this.panic = true;
    this.shape.material.color.set(this.panicColor);
  }

  kalm () {
    this.panic = false;
    this.shape.material.color.set(this.c);
  }

  die () {
    this.resetPosition();
    this.out = false;
    entityManager.score += 100;
  }

  resetPosition() {
    this.position["x"] = this.origX;
    this.position["y"] = this.origY;
    this.shape.position.copy(this.position);
    this.shape.updateMatrix();
  }
}