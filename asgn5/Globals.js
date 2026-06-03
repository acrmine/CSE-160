 const fixedTimeStep = 1.0 / 60.0;
 const maxSubSteps = 3;

// Camera defaults
const g_fov = 75;
const g_aspect = 2; 
const g_near = 0.1;
const g_far = 1000;

let g_keys = {};

let scene;
let phys_world;
let renderer;
let textureLoader;
let gltfLoader;

let g_prevTime = performance.now();
let g_frameCount = 0;
let g_fps = 0;
let g_frameDelta = 1.0 / 60.0;

let g_dynamic_objects = [];


const approachZero = (num, delta) => {
  if (num > 0) {
    return Math.max(0, num - delta);
  }
  return Math.min(0, num + delta);
}

const clamp = (num, min, max) => Math.min(Math.max(num, min), max)

const updateMeshBodyTransform = (mesh, body) => {
  mesh.position.set(body.position.x, body.position.y, body.position.z);
  mesh.quaternion.set(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w);
}

const updateBodyMass = (body, newMass) => {
  body.mass = newMass;
  if (newMass === 0) {
    body.type = CANNON.Body.STATIC;
  } else {
    body.type = CANNON.Body.DYNAMIC;
  }
  body.updateMassProperties();
}

const updateMeshMaterialAttribs = (mesh, attribs) => {
  if (attribs.roughness !== undefined) {
    mesh.material.roughness = attribs.roughness;
  }
  if (attribs.metalness !== undefined) {
    mesh.material.metalness = attribs.metalness;
  }
  mesh.material.needsUpdate = true;
}

const createTrimesh = (bufferGeometry) => {
    const vertices = bufferGeometry.attributes.position.array;
    const indices = Object.keys(vertices).map(Number);
    return new CANNON.Trimesh(vertices, indices);
}