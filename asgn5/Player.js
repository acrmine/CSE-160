import * as THREE from 'three';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

export class Player {
  constructor(posX, posY, posZ, fov = g_fov, aspect = g_aspect, near = g_near, far = g_far) {
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.controls = new PointerLockControls(this.camera, renderer.domElement);
    this.camera.position.set(posX, posY, posZ);

    this.moveVec = new THREE.Vector3();
    this.frontVec = new THREE.Vector3();
    this.sideVec = new THREE.Vector3();
    this.upVec = new THREE.Vector3(0, 1, 0);

    document.addEventListener('click', () => {
      this.controls.lock();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        this.controls.unlock();
      }
    });

    this.colliderRadius = 1.0;

    this.sphereBody = new CANNON.Body({
      mass: 1,
      position: new CANNON.Vec3(posX, posY, posZ),
      shape: new CANNON.Sphere(this.colliderRadius)
    });
    this.sphereBody.linearDamping = 0.8;
    phys_world.addBody(this.sphereBody);

    this.moveSpeed = 0.5;
    this.maxLateralSpeed = 3.0;
    this.maxVerticalSpeed = 10.0;
    this.jumpImpulse = 3.0;
  }

  updateMovement() {
    this.controls.getDirection(this.frontVec);
    this.frontVec.y = 0;
    this.frontVec.normalize();

    this.sideVec.copy(this.frontVec).cross(this.camera.up).normalize();

    this.moveVec.set(0, 0, 0);

    if (g_keys['w']) {
      this.moveVec.add(this.frontVec);
    }
    if (g_keys['s']) {
      this.moveVec.sub(this.frontVec);
    }
    if (g_keys['a']) {
      this.moveVec.sub(this.sideVec);
    }
    if (g_keys['d']) {
      this.moveVec.add(this.sideVec);
    }

    if(this.moveVec.x !== 0 || this.moveVec.y !== 0 || this.moveVec.z !== 0) {
      this.moveVec.normalize();
      this.moveVec.multiplyScalar(this.moveSpeed);
    }

    if (g_keys[' ']) {
      this.moveVec.add(this.upVec);
      this.moveVec.multiplyScalar(this.jumpImpulse);
    }

    this.sphereBody.velocity.x += this.moveVec.x;
    this.sphereBody.velocity.y += this.moveVec.y;
    this.sphereBody.velocity.z += this.moveVec.z;

    this.sphereBody.velocity.x = clamp(this.sphereBody.velocity.x, -this.maxLateralSpeed, this.maxLateralSpeed);
    this.sphereBody.velocity.y = clamp(this.sphereBody.velocity.y, -this.maxVerticalSpeed, this.maxVerticalSpeed);
    this.sphereBody.velocity.z = clamp(this.sphereBody.velocity.z, -this.maxLateralSpeed, this.maxLateralSpeed);
  }

  update() {
    this.updateMovement();

    this.camera.position.set(
      this.sphereBody.position.x, 
      this.sphereBody.position.y + 1.0, 
      this.sphereBody.position.z
    );
  }
}