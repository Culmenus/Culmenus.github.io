import { spatialManager, entityManager } from "../index.js";

export class Food {
  constructor(x = 0, y = 0, special = false) {
    this.special = special;
    this.radius = special ? 4 : 2;
    this.color = special ? "green" : "white";
    this.geometry = new THREE.SphereGeometry(this.radius, 100, 100);
    this.material = new THREE.MeshPhongMaterial({ color: this.color, specular: "#111111", shininess: 30, combine: THREE.MultiplyOperation, reflectivity: 0.6 });
    this.shape = new THREE.Mesh(this.geometry, this.material);
    this.shape.x = x;
    this.shape.y = y;
    this.hover = 0;
    this.z = 5;
    this.position = new THREE.Vector3(x, y, this.z);
  }

  update() {
    this.hover = (this.hover + 0.05) % (Math.PI * 2);
    this.z = 5 + 5 * Math.sin(this.hover);
    this.position["z"] = this.z;
    this.shape.position.copy(this.position);

    this.collide();
  }
  collide () {
    if (spatialManager.isSphereCollision(this, entityManager.pacman)) {
      if (this.special) {
        // pacman found that special sauce
        entityManager.pacman.killModeActivate();
        entityManager.score += 50;
      } else {
        entityManager.score+=10; 
      }
      document.querySelector(".score").innerHTML = `Score: ${entityManager.score}` ;
      entityManager.eatFood(this);
    }
  }
  setPosition(pos){
    this.shape.position.copy(pos);
    this.position = pos;
  }
}