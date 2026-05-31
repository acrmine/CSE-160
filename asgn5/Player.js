import * as THREE from 'three';
import * as CANNON from 'lib/cannon.js';

class Player {
  constructor(posX, posY, posZ, fov = g_fov, aspect = g_aspect, near = g_near, far = g_far) {
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.set(posX, posY, posZ);

    this.colliderRadius = 1.0;
    this.drag = 0.01;

    this.sphereBody = new CANNON.Body({
      mass: 1,
      position: new CANNON.Vec3(posX, posY, posZ),
      shape: new CANNON.Sphere(colliderRadius)
    });
    phys_world.addBody(this.sphereBody);
  }

  update() {
    let impulse = new CANNON.Vec3(0, 0, 0);

    if (g_keys['w']) {
      impulse.z -= 0.1;
    }
    if (g_keys['s']) {
      impulse.z += 0.1;
    }
    if (g_keys['a']) {
      impulse.x -= 0.1;
    }
    if (g_keys['d']) {
      impulse.x += 0.1;
    }

    impulse.normalize();
    this.sphereBody.velocity.x += impulse.x;
    this.sphereBody.velocity.y += impulse.y;
    this.sphereBody.velocity.z += impulse.z;

    this.camera.position.set(
      this.sphereBody.position.x, 
      this.sphereBody.position.y, 
      this.sphereBody.position.z
    );
  }
}