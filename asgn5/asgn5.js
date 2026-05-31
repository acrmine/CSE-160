import * as THREE from 'three';
import * as CANNON from 'lib/cannon.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Camera defaults
const g_fov = 75;
const g_aspect = 2; 
const g_near = 0.1;
const g_far = 1000;

const fixedTimeStep = 1.0 / 60.0;
const maxSubSteps = 3;

const g_keys;

const scene;
const player;
const phys_world;
const renderer;

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

function initKeyListener() {
  g_keys = {};

  document.addEventListener('keydown', (event) => {
    g_keys[event.key] = true;
  });
  document.addEventListener('keyup', (event) => {
    g_keys[event.key] = false;
  });
}

function initScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xaaaaaa);

  phys_world = new CANNON.World();
  phys_world.Gravity.set(0, 0, -9.82);

  let groundPlane = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Plane(),
  });
  phys_world.addBody(groundPlane);
}

function main() {
  initScene();

  initKeyListener();
  player = new Player(0, 0, 5);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  updateFPS(g_prevTime);
  animate();
}

function updateFPS(currTime) {
  g_frameCount++;

  g_frameDelta = currTime - g_prevTime;
  if (g_frameDelta >= 1000) {
    g_fps = (g_frameCount * 1000) / g_frameDelta;

    g_frameCount = 0;
    g_prevTime = currTime;
  }

  requestAnimationFrame(updateFPS);
}

function updatePhysics(deltaTime) {
  phys_world.step(fixedTimeStep, deltaTime, maxSubSteps);
}

function animate() {
  player.update();
  updatePhysics(g_frameDelta / 1000.0);

  renderer.render(scene, player.camera);

  requestAnimationFrame(animate);
}