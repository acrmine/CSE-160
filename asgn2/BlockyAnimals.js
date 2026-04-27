// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

// Global variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_ProjectionMatrix;

let g_prevMouse = [0, 0];
let g_globalAngle = [40, 20];
let g_globalScale = 3;
let g_dragSensitivity = 0.7;
let g_dragging = false;

let g_prevTime = performance.now();
let g_frameCount = 0;
let g_fps = 0;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext('webgl', {preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  // Give u_ModelMatrix an identity matrix
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

let g_selectedColor = [1.0, 0.0, 0.0, 1.0]; // Default color: red

function addActionsForHtmlUI() {
  // Slider events (Shape color)
  document.getElementById('redSlide').addEventListener('mouseup', function() {
    g_selectedColor[0] = this.value / 100;
  });
  document.getElementById('greenSlide').addEventListener('mouseup', function() {
    g_selectedColor[1] = this.value / 100;
  });
  document.getElementById('blueSlide').addEventListener('mouseup', function() {
    g_selectedColor[2] = this.value / 100;
  });
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();

  // Settup actions for the HTML UI
  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse move while left click is pressed
  canvas.onmousedown = click;
  canvas.onmousemove = mouseMove;
  canvas.onmouseup = mouseUp;
  canvas.onmouseleave = exitCanvas;
  canvas.onwheel = scroll;

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 1, 1, 1);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  renderAllShapes();

  tick();
}

function tick() {
  requestAnimationFrame(tick);
  renderAllShapes();
}

function updateFPS(currTime) {
  g_frameCount++;

  const delta = currTime - g_prevTime;
  if (delta >= 1000) {
    g_fps = (g_frameCount * 1000) / delta;

    g_frameCount = 0;
    g_prevTime = currTime;

    document.getElementById('fps').textContent = `FPS: ${g_fps.toFixed(2)}`;
  }

  requestAnimationFrame(updateFPS);
}

requestAnimationFrame(updateFPS);

// Extract the event click and convert it to WebGL coordinates
function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return ([x, y]);
}

// Click detection setup for rotating camera inspired by Milo Kesteloot's setup in Ender Dragon
// https://milokesteloot.github.io/MinecraftEntities/

function click(ev) {
  g_dragging = true;
  g_prevMouse[0] = ev.clientX;
  g_prevMouse[1] = ev.clientY;
}

function mouseMove(ev) {
  if (!g_dragging) {
    return;
  }
  let deltaX = ev.clientX - g_prevMouse[0];
  let deltaY = ev.clientY - g_prevMouse[1];
  g_globalAngle[0] += deltaX * g_dragSensitivity;
  g_globalAngle[1] += deltaY * g_dragSensitivity;
  g_prevMouse[0] = ev.clientX;
  g_prevMouse[1] = ev.clientY;
}

function mouseUp(ev) {
  g_dragging = false;
}

function exitCanvas(ev) {
  g_dragging = false;
}

function scroll(ev) {
  const scroll = ev.deltaY;
  g_globalScale *= (-scroll) * 0.001 + 1;
  ev.preventDefault();
}

// Draw every shape that is supposed to be in the canvas
function renderAllShapes() {
  let scale = 1/20 * g_globalScale;
  let globalRotMat = new Matrix4()
    .scale(scale, scale, scale)
    .rotate(g_globalAngle[0], 0, -1, 0)
    .rotate(g_globalAngle[1], -1, 0, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // main body
  var body = new Cube([1, 1, 1, 1]);
  body.matrix.scale(4, 5, 3);
  body.render();

  var body_back = new Cube([0, 0, 0, 1]);
  body_back.matrix.setTranslate(0, 0, 0.8);
  body_back.matrix.scale(4.1, 5.1, 1.6);
  body_back.render();

  // neck
  var neck1 = new Cube([1,1,1,1]);
  neck1.matrix.setTranslate(0, 3, 0.0);
  neck1.matrix.scale(3, 1, 2.5);
  neck1.render();

  var neck1_back = new Cube([0,0,0,1]);
  neck1_back.matrix.setTranslate(0, 3, 0.675);
  neck1_back.matrix.scale(3.1, 1.1, 1.35);
  neck1_back.render();

  var neck2 = new Cube([1,1,1,1]);
  neck2.matrix.setTranslate(0, 4, -0.2);
  neck2.matrix.scale(2, 1.2, 2);
  neck2.render();

  var neck2_back = new Cube([0,0,0,1]);
  neck2_back.matrix.setTranslate(0, 4, 0.4);
  neck2_back.matrix.scale(2.1, 1.3, 0.9);
  neck2_back.render();

  var neck3 = new Cube([0,0,0,1]);
  neck3.matrix.setTranslate(0, 4.5, -0.4);
  neck3.matrix.scale(1.9, 1.2, 1.5);
  neck3.render();

  // head
  var head = new Cube([0,0,0,1]);
  head.matrix.setTranslate(0, 5, -1);
  head.matrix.scale(1.6, 1.5, 2);
  head.render();

  var right_eye = new Cube([1,1,1,1]);
  right_eye.matrix.setTranslate(-0.8, 5.3, -1.5);
  right_eye.matrix.scale(0.3, 0.3, 0.5);
  right_eye.render();

  var right_pupil = new Cube([0,0,0,1]);
  right_pupil.matrix.setTranslate(-0.9, 5.3, -1.5);
  right_pupil.matrix.scale(0.2, 0.1, 0.2);
  right_pupil.render();

  var left_eye = new Cube([1,1,1,1]);
  left_eye.matrix.setTranslate(0.8, 5.3, -1.5);
  left_eye.matrix.scale(0.3, 0.3, 0.5);
  left_eye.render();

  var left_pupil = new Cube([0,0,0,1]);
  left_pupil.matrix.setTranslate(0.9, 5.3, -1.5);
  left_pupil.matrix.scale(0.2, 0.1, 0.2);
  left_pupil.render(); 

  var beak_top = new HalfPyramid([1,165/255,0,1]);
  beak_top.matrix.setTranslate(0, 4.8, -2);
  beak_top.matrix.rotate(180, 0, 1, 0);
  beak_top.matrix.rotate(90, 1, 0, 0);
  beak_top.matrix.scale(1, 1.4, 0.8);
  beak_top.render();

  var beak_bottom = new HalfPyramid([1,165/255,0,1]);
  beak_bottom.matrix.setTranslate(0, 4.8, -2);
  beak_bottom.matrix.rotate(-90, 1, 0, 0);
  beak_bottom.matrix.scale(1, 1.4, 0.3);
  beak_bottom.render();

  // waist
  var hips = new Cube([1,1,1,1]);
  hips.matrix.setTranslate(0, -2.52, 0.0);
  hips.matrix.scale(3.5, 1, 2.5);
  hips.render();

  var hips_back = new Cube([0,0,0,1]);
  hips_back.matrix.setTranslate(0, -2.52, 0.8);
  hips_back.matrix.scale(3.6, 1.1, 1.35);
  hips_back.render();

  // right arm
  var right_arm1 = new Cube([0,0,0,1]);
  right_arm1.matrix.setTranslate(-2.1, 1.4, 0);
  right_arm1.matrix.scale(0.2, 1.5, 2);
  right_arm1.render();

  var right_arm1_back = new Cube([1,1,1,1]);
  right_arm1_back.matrix.setTranslate(-2, 1.4, 0);
  right_arm1_back.matrix.scale(0.2, 1.4, 1.9);
  right_arm1_back.render();

  var right_arm2 = new Cube([0,0,0,1]);
  right_arm2.matrix.setTranslate(-2.1, -0.1, 0);
  right_arm2.matrix.scale(0.2, 1.5, 2);
  right_arm2.render();

  var right_arm2_back = new Cube([1,1,1,1]);
  right_arm2_back.matrix.setTranslate(-2, -0.1, 0);
  right_arm2_back.matrix.scale(0.2, 1.4, 1.9);
  right_arm2_back.render();

  var right_arm3 = new Cube([0,0,0,1]);
  right_arm3.matrix.setTranslate(-2.1, -1.1, 0);
  right_arm3.matrix.scale(0.2, 1.1, 1.6);
  right_arm3.render();

  var right_arm3_back = new Cube([1,1,1,1]);
  right_arm3_back.matrix.setTranslate(-2, -1.1, 0);
  right_arm3_back.matrix.scale(0.2, 1, 1.5);
  right_arm3_back.render();

  // left arm
  var left_arm1 = new Cube([0,0,0,1]);
  left_arm1.matrix.setTranslate(2.1, 1.4, 0);
  left_arm1.matrix.scale(0.2, 1.5, 2);
  left_arm1.render();

  var left_arm1_back = new Cube([1,1,1,1]);
  left_arm1_back.matrix.setTranslate(2, 1.4, 0);
  left_arm1_back.matrix.scale(0.2, 1.4, 1.9);
  left_arm1_back.render();

  var left_arm2 = new Cube([0,0,0,1]);
  left_arm2.matrix.setTranslate(2.1, -0.1, 0);
  left_arm2.matrix.scale(0.2, 1.5, 2);
  left_arm2.render();

  var left_arm2_back = new Cube([1,1,1,1]);
  left_arm2_back.matrix.setTranslate(2, -0.1, 0);
  left_arm2_back.matrix.scale(0.2, 1.4, 1.9);
  left_arm2_back.render();

  var left_arm3 = new Cube([0,0,0,1]);
  left_arm3.matrix.setTranslate(2.1, -1.1, 0);
  left_arm3.matrix.scale(0.2, 1.1, 1.6);
  left_arm3.render();

  var left_arm3_back = new Cube([1,1,1,1]);
  left_arm3_back.matrix.setTranslate(2, -1.1, 0);
  left_arm3_back.matrix.scale(0.2, 1, 1.5);
  left_arm3_back.render();

  // right leg
  var right_leg1 = new Cube([1,1,1,1]);
  right_leg1.matrix.setTranslate(-0.8, -3.2, 0);
  right_leg1.matrix.scale(1.4, 1.4, 1.8);
  right_leg1.render();

  var right_leg2 = new Cube([1,1,1,1]);
  right_leg2.matrix.setTranslate(-0.8, -4.2, 0);
  right_leg2.matrix.scale(1, 1, 1);
  right_leg2.render();

  var right_foot = new Cube([0.5,0.5,0.5,1]);
  right_foot.matrix.setTranslate(-0.8, -4.9, -0.4);
  right_foot.matrix.scale(1.2, 0.5, 1.5);
  right_foot.render();

  var right_claw1 = new HalfPyramid([0,0,0,1]);
  right_claw1.matrix.setTranslate(-1.2, -5.1, -1.1);
  right_claw1.matrix.rotate(180, 0, 1, 0);
  right_claw1.matrix.rotate(90, 1, 0, 0);
  right_claw1.matrix.rotate(-10, 0, 0, 1);
  right_claw1.matrix.scale(0.3, 0.6, 0.8);
  right_claw1.render();

  var right_claw2 = new HalfPyramid([0,0,0,1]);
  right_claw2.matrix.setTranslate(-0.8, -5.1, -1.1);
  right_claw2.matrix.rotate(180, 0, 1, 0);
  right_claw2.matrix.rotate(90, 1, 0, 0);
  right_claw2.matrix.scale(0.3, 0.8, 0.8);
  right_claw2.render();

  var right_claw3 = new HalfPyramid([0,0,0,1]);
  right_claw3.matrix.setTranslate(-0.4, -5.1, -1.1);
  right_claw3.matrix.rotate(180, 0, 1, 0);
  right_claw3.matrix.rotate(90, 1, 0, 0);
  right_claw3.matrix.rotate(10, 0, 0, 1);
  right_claw3.matrix.scale(0.3, 0.6, 0.8);
  right_claw3.render();

  // left leg
  var left_leg1 = new Cube([1,1,1,1]);
  left_leg1.matrix.setTranslate(0.8, -3.2, 0);
  left_leg1.matrix.scale(1.4, 1.4, 1.8);
  left_leg1.render();

  var left_leg2 = new Cube([1,1,1,1]);
  left_leg2.matrix.setTranslate(0.8, -4.2, 0);
  left_leg2.matrix.scale(1, 1, 1);
  left_leg2.render();

  var left_foot = new Cube([0.5,0.5,0.5,1]);
  left_foot.matrix.setTranslate(0.8, -4.9, -0.4);
  left_foot.matrix.scale(1.2, 0.5, 1.5);
  left_foot.render();

  var left_claw1 = new HalfPyramid([0,0,0,1]);
  left_claw1.matrix.setTranslate(1.2, -5.1, -1.1);
  left_claw1.matrix.rotate(180, 0, 1, 0);
  left_claw1.matrix.rotate(90, 1, 0, 0);
  left_claw1.matrix.rotate(10, 0, 0, 1);
  left_claw1.matrix.scale(0.3, 0.6, 0.8);
  left_claw1.render();

  var left_claw2 = new HalfPyramid([0,0,0,1]);
  left_claw2.matrix.setTranslate(0.8, -5.1, -1.1);
  left_claw2.matrix.rotate(180, 0, 1, 0);
  left_claw2.matrix.rotate(90, 1, 0, 0);
  left_claw2.matrix.scale(0.3, 0.8, 0.8);
  left_claw2.render();

  var left_claw3 = new HalfPyramid([0,0,0,1]);
  left_claw3.matrix.setTranslate(0.4, -5.1, -1.1);
  left_claw3.matrix.rotate(180, 0, 1, 0);
  left_claw3.matrix.rotate(90, 1, 0, 0);
  left_claw3.matrix.rotate(-10, 0, 0, 1);
  left_claw3.matrix.scale(0.3, 0.6, 0.8);
  left_claw3.render();
}