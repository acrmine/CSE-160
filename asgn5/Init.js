import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const fixedTimeStep = 1.0 / 60.0;
const maxSubSteps = 3;

export var g_keys = {};

export var scene = new THREE.Scene();
scene.background = new THREE.Color(0xaaaaaa);

export var phys_world = new CANNON.World();
phys_world.gravity.set(0, 0, -9.82);

export var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

export var g_prevTime = performance.now();
export var g_frameCount = 0;
export var g_fps = 0;
export var g_frameDelta = 1.0 / 60.0;

export var g_dynamic_objects = [];

export const approachZero = (num, delta) => {
  if (num > 0) {
    return Math.max(0, num - delta);
  }
  return Math.min(0, num + delta);
}

function initKeyListener() {
  document.addEventListener('keydown', (event) => {
    g_keys[event.key] = true;
  });
  document.addEventListener('keyup', (event) => {
    g_keys[event.key] = false;
  });
}
initKeyListener();