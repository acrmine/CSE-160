import * as THREE from 'three';
import * as Shapes from './Shapes.js';
import * as Textures from './Init.js';
import { Player } from './Player.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let player;

function buildScene() {
  const ambientLight = new THREE.AmbientLight( 0xffffff, 0.3 );
  scene.add( ambientLight );

  const directionalLight = new THREE.DirectionalLight( 0xffffff, 3.0 );
  directionalLight.position.set(10, 20, 10);
  scene.add(directionalLight);

  let groundPlane = new Shapes.Box({ sizeX: 100, sizeY: 1, sizeZ: 100, textureOrColor: Textures.greenCheckerboardTexture });

  let cube1 = new Shapes.Box({ posX: 0, posY: 5, posZ: -5, sizeX: 1, sizeY: 1, sizeZ: 1, textureOrColor: Textures.greenWindow, mass: 1 });

  let sphere1 = new Shapes.Sphere({ posX: 2, posY: 5, posZ: -5, radius: 0.5, textureOrColor: 0x00ff00, mass: 1, roughness: 0.2, metalness: 0.8 });

  let dodecahedron = new THREE.Mesh(
    new THREE.DodecahedronGeometry(1),
    new THREE.MeshStandardMaterial({ color: 0x0000ff, roughness: 0.5, metalness: 0.5 })
  );
  dodecahedron.position.set(-4, 2, -5);
  scene.add(dodecahedron);

  let spotLightWall = new Shapes.Box({ posX: 0, posY: 5, posZ: -20, sizeX: 10, sizeY: 10, sizeZ: 0.1, textureOrColor: Textures.greenWindow, mass: 0 });
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