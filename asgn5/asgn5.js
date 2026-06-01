// Camera defaults
const g_fov = 75;
const g_aspect = 2; 
const g_near = 0.1;
const g_far = 1000;

let player;

function buildScene() {
  let groundPlane = new Plane(0, 0, 0);
  g_dynamic_objects.push(groundPlane);
}

function main() {
  buildScene();

  player = new Player(0, 0, 5);

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