class Plane {
  constructor(posX = 0, posY = 0, posZ = 0, visSizeX = 100, visSizeY = 100) {
    this.planeBody = new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(posX, posY, posZ),
      shape: new CANNON.Plane()
    });
    phys_world.addBody(this.planeBody);

    this.planeMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(visSizeX, visSizeY),
      new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide })
    );
    this.planeMesh.position.set(posX, posY, posZ);
    scene.add(this.planeMesh);
  }

  update() {
    this.planeMesh.position.set(
      this.planeBody.position.x, 
      this.planeBody.position.y, 
      this.planeBody.position.z
    );
  }
}

