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
let canvas
let gl
let a_Position
let u_FragColor
let u_ModelMatrix
let u_GlobalRotateMatrix

let g_prevMouse = [0, 0];
let g_globalAngle = [40, 20];
let g_globalScale = 80;
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
  gl.clearColor(0.0, 0.0, 0.0, 0.5);

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
  let scale = 1/160 * g_globalScale;
  let globalRotMat = new Matrix4()
    .scale(scale, scale, scale)
    .rotate(g_globalAngle[0], 0, -1, 0)
    .rotate(g_globalAngle[1], -1, 0, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // main body
  var body = new Cube([1, 1, 1, 1]);
  body.matrix.scale(0.8, 1.0, 0.6);
  body.render();

  var neck1 = new Cube([1,1,1,1]);
  neck1.matrix.setTranslate(0, 0.6, 0.0);
  neck1.matrix.scale(0.6, 0.2, 0.5);
  neck1.render();

  var hips = new Cube([1,1,1,1]);
  neck1.matrix.setTranslate(0, -0.54, 0.0);
  neck1.matrix.scale(0.7, 0.1, 0.5);
  neck1.render();
}