export class Wall {
  constructor(width, height, depth, x, y) {
    this.geometry = new THREE.BoxGeometry(width, height, depth);
    this.material = new THREE.MeshPhongMaterial({ color: "green" });
    this.shape = new THREE.Mesh(this.geometry, this.material);
    this.shape.position.x = x;
    this.shape.position.y = y;
    this.width = width;
    this.height = height;
    this.leftX = this.shape.position.x - this.width / 2;
    this.rightX = this.shape.position.x + this.width / 2;
    this.upY = this.shape.position.y + this.height / 2;
    this.downY = this.shape.position.y - this.height / 2;
  }

  
  getPos() {
    return this.shape.position;
  }

  getDims() {
    return {
      leftXwall: this.leftX,
      rightXwall: this.rightX,
      upYwall: this.upY,
      downYwall: this.downY,
    };
  }
}
