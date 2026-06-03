import * as THREE from 'three';
import * as Shapes from './Shapes.js';
import * as Textures from './Init.js';
import { Player } from './Player.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let player;

let spinningDodecahedron;

let pointLight;

let monsterGltf = await gltfLoader.loadAsync('models/char-monster_1.glb');
monsterGltf.scene.position.set(0, 0, -150);
monsterGltf.scene.rotation.set(0, -Math.PI / 2, 0);
monsterGltf.scene.scale.set(80, 80, 80);
scene.add(monsterGltf.scene);

function buildCubeWall(startX, startY, startZ, rows, cols) {
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let box = new Shapes.Box({ posX: startX + j, posY: startY + i, posZ: startZ, sizeX: 1, sizeY: 1, sizeZ: 1, textureOrColor: Textures.greenWindow, mass: 1 });
    }
  }
}

function buildScene() {
  const ambientLight = new THREE.AmbientLight( 0xffffff, 0.3 );
  scene.add( ambientLight );

  const directionalLight = new THREE.DirectionalLight( 0xffffff, 3.0 );
  directionalLight.position.set(10, 20, 10);
  scene.add(directionalLight);

  pointLight = new THREE.PointLight( 0xffffff, 50.0, 100 );
  pointLight.position.set( 0, 5, -15 );
  scene.add( pointLight );

  let pointLightHelper = new THREE.PointLightHelper( pointLight, 0.5 );
  scene.add( pointLightHelper );

  let groundPlane = new Shapes.Box({ sizeX: 100, sizeY: 1, sizeZ: 100, textureOrColor: Textures.greenCheckerboardTexture });

  let cube1 = new Shapes.Box({ posX: 0, posY: 5, posZ: -5, sizeX: 1, sizeY: 1, sizeZ: 1, textureOrColor: Textures.greenWindow, mass: 1 });

  let sphere1 = new Shapes.Sphere({ posX: 2, posY: 5, posZ: -5, radius: 0.5, textureOrColor: 0x00ff00, mass: 1, roughness: 0.2, metalness: 0.8 });

  spinningDodecahedron = new THREE.Mesh(
    new THREE.DodecahedronGeometry(1),
    new THREE.MeshStandardMaterial({ color: 0x0000ff, roughness: 0.5, metalness: 0.5 })
  );
  spinningDodecahedron.position.set(0, 5, -18);
  scene.add(spinningDodecahedron);

  let lightSphere1 = new Shapes.Sphere({ posX: 3, posY: 5, posZ: -18, radius: 1.0, textureOrColor: 0x00ff00, mass: 0, roughness: 0.5, metalness: 0.0 });
  let lightSphere2 = new Shapes.Sphere({ posX: -3, posY: 5, posZ: -18, radius: 1.0, textureOrColor: 0x00ff00, mass: 0, roughness: 0.5, metalness: 0.0 });

  let pointLightWall = new Shapes.Box({ posX: 0, posY: 5, posZ: -20, sizeX: 10, sizeY: 10, sizeZ: 0.1, textureOrColor: Textures.greenWindow, mass: 0 });

  buildCubeWall(-10, 1, -10, 3, 3);

  let poolWall1 = new Shapes.Box({ posX: 20, posY: 1.5, posZ: -10, sizeX: 10, sizeY: 2, sizeZ: 0.5, textureOrColor: Textures.greenWindow, mass: 0 });
  let poolWall2 = new Shapes.Box({ posX: 20, posY: 1.5, posZ: 0, sizeX: 10, sizeY: 2, sizeZ: 0.5, textureOrColor: Textures.greenWindow, mass: 0 });
  let poolWall3 = new Shapes.Box({ posX: 14.75, posY: 1.5, posZ: -5, sizeX: 0.5, sizeY: 2, sizeZ: 10.5, textureOrColor: Textures.greenWindow, mass: 0 });
  let poolWall4 = new Shapes.Box({ posX: 25.25, posY: 1.5, posZ: -5, sizeX: 0.5, sizeY: 2, sizeZ: 10.5, textureOrColor: Textures.greenWindow, mass: 0 });

  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      for (let k = 0; k < 2; k++) {
        let sphere = new Shapes.Sphere({ posX: 16 + j, posY: 3 + k, posZ: -9 + i, radius: 0.5, textureOrColor: Textures.greenCheckerboardTexture, mass: 0.01 });
      }
    }
  }
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

  spinningDodecahedron.rotation.x += 0.01;
  spinningDodecahedron.rotation.y += 0.01;

  pointLight.position.x = 5 * Math.cos(Date.now() * 0.001);

  requestAnimationFrame(animate);
}