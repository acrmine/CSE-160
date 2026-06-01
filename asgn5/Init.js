import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const fixedTimeStep = 1.0 / 60.0;
const maxSubSteps = 3;

var g_keys = {};

var scene = new THREE.Scene();
scene.background = new THREE.Color(0xaaaaaa);

var phys_world = new CANNON.World();
phys_world.gravity.set(0, 0, -9.82);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var g_prevTime = performance.now();
var g_frameCount = 0;
var g_fps = 0;
var g_frameDelta = 1.0 / 60.0;

var g_dynamic_objects = [];

const approachZero = (num, delta) => {
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