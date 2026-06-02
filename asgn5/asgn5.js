import * as THREE from 'three';
import * as Shapes from './Shapes.js';
import * as Textures from './Init.js';
import { Player } from './Player.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let player;

function buildScene() {
  const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
  scene.add(directionalLight);

  let groundPlane = new Shapes.Box({ posX: 0, posY: 0, posZ: 0, sizeX: 100, sizeY: 1, sizeZ: 100, textureOrColor: Textures.greenCheckerboardTexture });

  let cube1 = new Shapes.Box({ posX: 0, posY: 5, posZ: -5, sizeX: 1, sizeY: 1, sizeZ: 1, textureOrColor: Textures.greenWindow, mass: 1 });
}

function main() {
  buildScene();

  player = new Player(0, 5, 0);

  updateFPS(g_prevTime);
  animate();
}
main();

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

  for (let obj of g_dynamic_objects) {
    obj.update();
  }

  requestAnimationFrame(animate);
}