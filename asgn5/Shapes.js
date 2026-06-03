import * as THREE from 'three';
import * as Textures from './Init.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class Box {
  constructor(userParametersObject = {}) {

    let paramsObject = {
      posX: 0, posY: 0, posZ: 0, 
      rotX: 0, rotY: 0, rotZ: 0, 
      sizeX: 2, sizeY: 2, sizeZ: 2, 
      textureOrColor: Textures.greenWindow, roughness: 0.5, metalness: 0.0,
      mass: 0, linearDamping: 0.1
    };
    
    for (let key in userParametersObject) {
      paramsObject[key] = userParametersObject[key];
    }

    this.body = new CANNON.Body({
      mass: paramsObject.mass,
      position: new CANNON.Vec3(paramsObject.posX, paramsObject.posY, paramsObject.posZ),
      quaternion: new CANNON.Quaternion().setFromEuler(paramsObject.rotX, paramsObject.rotY, paramsObject.rotZ, 'XYZ'),
      shape: new CANNON.Box(new CANNON.Vec3(paramsObject.sizeX / 2, paramsObject.sizeY / 2, paramsObject.sizeZ / 2)),
      linearDamping: paramsObject.linearDamping
    });
    phys_world.addBody(this.body);

    let material;
    if (paramsObject.textureOrColor instanceof THREE.Texture) {
      material = new THREE.MeshStandardMaterial({ map: paramsObject.textureOrColor, side: THREE.RepeatWrapping, roughness: paramsObject.roughness, metalness: paramsObject.metalness });
    } else {
      material = new THREE.MeshStandardMaterial({ color: paramsObject.textureOrColor, roughness: paramsObject.roughness, metalness: paramsObject.metalness });
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

export class Sphere {
  constructor(userParametersObject = {}) {

    let paramsObject = {
      posX: 0, posY: 0, posZ: 0, 
      rotX: 0, rotY: 0, rotZ: 0, 
      radius: 1, widthSegments: 32, heightSegments: 16, 
      textureOrColor: Textures.greenCheckerboardTexture, roughness: 0.5, metalness: 0.0, 
      mass: 0, linearDamping: 0.1
    };
    
    for (let key in userParametersObject) {
      paramsObject[key] = userParametersObject[key];
    }

    this.body = new CANNON.Body({
      mass: paramsObject.mass,
      position: new CANNON.Vec3(paramsObject.posX, paramsObject.posY, paramsObject.posZ),
      quaternion: new CANNON.Quaternion().setFromEuler(paramsObject.rotX, paramsObject.rotY, paramsObject.rotZ, 'XYZ'),
      shape: new CANNON.Sphere(paramsObject.radius),
      linearDamping: paramsObject.linearDamping
    });
    phys_world.addBody(this.body);

    let material;
    if (paramsObject.textureOrColor instanceof THREE.Texture) {
      material = new THREE.MeshStandardMaterial({ map: paramsObject.textureOrColor, side: THREE.RepeatWrapping, roughness: paramsObject.roughness, metalness: paramsObject.metalness });
    } else {
      material = new THREE.MeshStandardMaterial({ color: paramsObject.textureOrColor, roughness: paramsObject.roughness, metalness: paramsObject.metalness });
    }

    this.mesh = new THREE.Mesh(
      new THREE.SphereGeometry(paramsObject.radius, paramsObject.widthSegments, paramsObject.heightSegments),
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

// export class Dodecahedron {
//   constructor(userParametersObject = {}) {

//     let paramsObject = {
//       posX: 0, posY: 0, posZ: 0, 
//       rotX: 0, rotY: 0, rotZ: 0, 
//       radius: 1, 
//       textureOrColor: Textures.greenCheckerboardTexture, roughness: 0.5, metalness: 0.0, 
//       mass: 0, linearDamping: 0.1
//     };
    
//     for (let key in userParametersObject) {
//       paramsObject[key] = userParametersObject[key];
//     }

//     let material;
//     if (paramsObject.textureOrColor instanceof THREE.Texture) {
//       material = new THREE.MeshStandardMaterial({ map: paramsObject.textureOrColor, side: THREE.RepeatWrapping, roughness: paramsObject.roughness, metalness: paramsObject.metalness });
//     } else {
//       material = new THREE.MeshStandardMaterial({ color: paramsObject.textureOrColor, roughness: paramsObject.roughness, metalness: paramsObject.metalness });
//     }

//     let dodecahedronGeometry = new THREE.DodecahedronGeometry(paramsObject.radius);

//     dodecahedronGeometry = BufferGeometryUtils.mergeVertices(dodecahedronGeometry);

//     this.mesh = new THREE.Mesh(
//       dodecahedronGeometry,
//       material
//     );
//     this.mesh.position.set(paramsObject.posX, paramsObject.posY, paramsObject.posZ);
//     this.mesh.rotation.set(paramsObject.rotX, paramsObject.rotY, paramsObject.rotZ);
//     scene.add(this.mesh);

//     let positionAttrib = this.mesh.geometry.attributes.position;
//     let points = [];

//     for (let i = 0; i < positionAttrib.count; i += 3) {
//       // Generate vertex points
//       points.push(new CANNON.Vec3(positionAttrib.getX(i), positionAttrib.getY(i), positionAttrib.getZ(i)));
//     }

//     let indexAttrib = this.mesh.geometry.index;
//     let faces = [];
//     if (indexAttrib) {
//       for (let i = 0; i < indexAttrib.count; i += 3) {
//         faces.push([indexAttrib.getX(i), indexAttrib.getY(i + 1), indexAttrib.getZ(i + 2)]);
//       }
//     } else {
//       for (let i = 0; i < positionAttrib.count; i += 3) {
//         faces.push([i, i + 1, i + 2]);
//       }
//     }

//     // let rawVertices = dodecahedronGeometry.parameters.vertices;
//     // let rawIndices = dodecahedronGeometry.parameters.indices;

//     // const points = [];
//     // for (let i = 0; i < rawVertices.length; i += 3) {
//     //   points.push(new CANNON.Vec3(rawVertices[i], rawVertices[i+1], rawVertices[i+2]));
//     // }

//     // const faces = [];
//     // for (let i = 0; i < rawIndices.length; i += 3) {
//     //   faces.push([rawIndices[i], rawIndices[i+1], rawIndices[i+2]]);
//     // }

//     let dodecahedronShape = new CANNON.ConvexPolyhedron({ vertices: points, faces: faces });

//     this.body = new CANNON.Body({
//       mass: paramsObject.mass,
//       position: new CANNON.Vec3(paramsObject.posX, paramsObject.posY, paramsObject.posZ),
//       quaternion: new CANNON.Quaternion().setFromEuler(paramsObject.rotX, paramsObject.rotY, paramsObject.rotZ, 'XYZ'),
//       shape: dodecahedronShape,
//       linearDamping: paramsObject.linearDamping
//     });
//     phys_world.addBody(this.body);

//     g_dynamic_objects.push(this);
//   }

//   update() {
//     updateMeshBodyTransform(this.mesh, this.body);
//   }
// }
