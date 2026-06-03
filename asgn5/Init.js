import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

scene = new THREE.Scene();
scene.background = new THREE.Color(0xaaaaaa);

phys_world = new CANNON.World();
phys_world.gravity.set(0, -9.82, 0);

renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth - 20, window.innerHeight - 20);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

textureLoader = new THREE.TextureLoader();

gltfLoader = new GLTFLoader();

export const skybox = textureLoader.load('imgs/kloppenheim_06_puresky.jpg');
skybox.colorSpace = THREE.SRGBColorSpace;
skybox.mapping = THREE.EquirectangularReflectionMapping;
scene.background = skybox;

export const greenCheckerboardTexture = textureLoader.load('imgs/texture_08.png');
greenCheckerboardTexture.colorSpace = THREE.SRGBColorSpace;
greenCheckerboardTexture.wrapS = THREE.RepeatWrapping;
greenCheckerboardTexture.wrapT = THREE.RepeatWrapping;
greenCheckerboardTexture.repeat.set(20, 20);

export const greenWindow = textureLoader.load('imgs/texture_13.png');
greenWindow.colorSpace = THREE.SRGBColorSpace;


document.addEventListener('keydown', (event) => {
  g_keys[event.key] = true;
});
document.addEventListener('keyup', (event) => {
  g_keys[event.key] = false;
});