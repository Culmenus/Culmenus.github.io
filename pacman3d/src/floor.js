export class Floor {
  constructor(length, width) {
    this.geometry = new THREE.PlaneGeometry(length, width);
    this.material = new THREE.MeshPhongMaterial({ color: "gray" });
    this.floor = new THREE.Mesh(this.geometry, this.material);
    this.floor.position.z = -50;
    //this.floor.position(new THREE.Vector3(0,0,16));
  }
}
