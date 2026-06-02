import * as THREE from 'three';
import * as Textures from './Init.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class Box {
  constructor(userParametersObject = {}) {

    let paramsObject = {posX: 0, posY: 0, posZ: 0, rotX: 0, rotY: 0, rotZ: 0, sizeX: 2, sizeY: 2, sizeZ: 2, textureOrColor: Textures.greenWindow, mass: 0};
    
    for (let key in userParametersObject) {
      paramsObject[key] = userParametersObject[key];
    }

    this.body = new CANNON.Body({
      mass: paramsObject.mass,
      position: new CANNON.Vec3(paramsObject.posX, paramsObject.posY, paramsObject.posZ),
      quaternion: new CANNON.Quaternion().setFromEuler(paramsObject.rotX, paramsObject.rotY, paramsObject.rotZ, 'XYZ'),
      shape: new CANNON.Box(new CANNON.Vec3(paramsObject.sizeX / 2, paramsObject.sizeY / 2, paramsObject.sizeZ / 2))
    });
    phys_world.addBody(this.body);

    let material;
    if (paramsObject.textureOrColor instanceof THREE.Texture) {
      material = new THREE.MeshBasicMaterial({ map: paramsObject.textureOrColor, side: THREE.RepeatWrapping });
    } else {
      material = new THREE.MeshBasicMaterial({ color: paramsObject.textureOrColor});
    }

    this.mesh = new THREE.Mesh(
      new THREE.BoxGeometry(paramsObject.sizeX, paramsObject.sizeY, paramsObject.sizeZ),
      material
    );
    this.mesh.position.set(paramsObject.posX, paramsObject.posY, paramsObject.posZ);
    this.mesh.rotation.set(paramsObject.rotX, paramsObject.rotY, paramsObject.rotZ);
    scene.add(this.mesh);

    g_dynamic_objects.push(this);
  }

  update() {
    updateMeshBodyTransform(this.mesh, this.body);
  }
}

