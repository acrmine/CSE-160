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
let g_globalAngle = [0, 0];

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
  //canvas.onmousedown = click;
  canvas.addEventListener("mousemove", (ev)=> {
    if(ev.buttons == 1) {
      g_globalAngle = [ev.offsetX, ev.offsetY];
      renderAllShapes();
    }
  });

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  renderAllShapes();
}

// Extract the event click and convert it to WebGL coordinates
function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return ([x, y]);
}

// Draw every shape that is supposed to be in the canvas
function renderAllShapes() {
  var globalRotMat = new Matrix4().rotate(0, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Draw a cube
  var body = new Cube();
  body.color = [1.0,0.0,0.0,1.0];
  body.matrix.setTranslate(-0.25, -0.5, 0.0);
  body.matrix.scale(0.5, 1.0, 0.5);
  body.render();

  var leftArm = new Cube();
  leftArm.color = [1,1,0,1];
  leftArm.matrix.setTranslate(0.7, 0.0, 0.0);
  leftArm.matrix.rotate(45, 0, 0, 1);
  leftArm.matrix.scale(0.25, 0.7, 0.5);
  leftArm.render();
}