// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    //gl_PointSize = 10.0;
    gl_PointSize = u_Size;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

// Colors
const BLACK = [0.0, 0.0, 0.0, 1.0];
const WHITE = [1.0, 1.0, 1.0, 1.0];
const YELLOW = [1.0, 1.0, 0.0, 1.0];

// Global variables
let canvas
let gl
let a_Position
let u_FragColor
let u_Size

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas)
  gl = canvas.getContext('webgl', {preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.BLEND)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
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

  // Get the storage location of u_Size
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

let g_selectedColor = [1.0, 0.0, 0.0, 1.0]; // Default color: red
let g_selectedSize = 10.0;
let g_selectedSegments = 10.0; // Default segments for circle
let g_selectedType = POINT; // Default shape type: point

function addActionsForHtmlUI() {
  // Button events
  document.getElementById('part12').onclick = function() { part12Drawing(); };

  document.getElementById('point').onclick = function() { g_selectedType = POINT; };
  document.getElementById('triangle').onclick = function() { g_selectedType = TRIANGLE; };
  document.getElementById('circle').onclick = function() { g_selectedType = CIRCLE; };

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
  document.getElementById('alphaSlide').addEventListener('mouseup', function() {
    g_selectedColor[3] = this.value / 100;
  });

  // Slider events (Shape size)
  document.getElementById('sizeSlide').addEventListener('mouseup', function() {
    g_selectedSize = this.value;
  });

  // Slider events (Circle segments)
  document.getElementById('segmentsSlide').addEventListener('mouseup', function() {
    g_selectedSegments = this.value;
  });

  document.getElementById('clear').onclick = function() { g_shapeList = []; renderAllShapes(); };
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();

  // Settup actions for the HTML UI
  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse move while left click is pressed
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev); } };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapeList = [];  // The array for the shapes in the canvas

function click(ev) {

  // Extract the event click and convert it to WebGL coordinates
  let [x, y] = convertCoordinatesEventToGL(ev);

  let point;
  switch(g_selectedType) {
    case POINT:
      point = new Point();
      break;
    case TRIANGLE:
      point = new Triangle();
      break;
    case CIRCLE:
      point = new Circle();
      break;
    default:
      console.log('Unknown shape type selected');
      return;
  }
  point.position = [x, y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapeList.push(point);

  // Draw every shape that is supposed to be in the canvas
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
    // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  var len = g_shapeList.length;
  for(var i = 0; i < len; i++) {
    g_shapeList[i].render();
  }
}

// Just for marking offset lines in vertex data, not used for actual offsetting
const OFFSET = null;

function offsetVertices(vertices, offsetX, offsetY) {
  if (offsetX === 0 && offsetY === 0) {
    return vertices;
  }

  let offsetVertices = new Array(vertices.length);
  for (let i = 0; i < vertices.length; i += 2) {
    offsetVertices[i] = vertices[i] + offsetX;
    offsetVertices[i + 1] = vertices[i + 1] + offsetY;
  }
  return offsetVertices;
}

function part12Drawing() {
  let vertexData = [
    [OFFSET, 5, 0],

    // Main Body (Triangles)
    [YELLOW],
    [0, 0, -5, 2, -4, 4],
    [0, 0, -4, 4, 0, 6],
    [0, 0, 0, 6, 2, 6],
    [0, 0, 2, 6, 6, 5],
    [0, 0, 6, 5, 8, 2],
    [0, 0, 8, 2, 8, -1],
    [0, 0, 8, -1, 7, -4],
    [0, 0, 7, -4, 4, -6],
    [0, 0, 4, -6, 1, -6],
    [0, 0, 1, -6, -3, -5],
    [0, 0, -3, -5, -4, -3],
    // Teeth and white of eye (Triangles)
    [WHITE],
    [-5, 2, -5, 0.5, -4, 1.6],
    [-4, 1.6, -4, 0, -3, 1.2],
    [-3, 1.2, -3, -0.5, -2, 0.8],
    [-2, 0.8, -2, -1, -1, 0.4],
    [0, 2, 0, 4, -2, 2],
    // Pupil (Triangles)
    [BLACK],
    [-1, 2, -1, 2.5, -2, 2],

    [OFFSET, 0, 0],

    // Name (Circles)
    [WHITE],
    // A
    [-10, 2],
    [-10.5, 1],
    [-11, 0],
    [-11.5, -1],
    [-12, -2],
    [-9.5, 1],
    [-9, 0],
    [-8.5, -1],
    [-8, -2],
    [-10.5, -1],
    [-9.5, -1],
    // R
    [-6, 2],
    [-6, 1],
    [-6, 0],
    [-6, -1],
    [-6, -2],
    [-5, 2],
    [-4, 1.5],
    [-4, 0.5],
    [-5, 0],
    [-5, -1],
    [-4, -2],
  ];

  let current_color = WHITE;
  let current_offset = [0.0, 0.0];

  for (let i = 0; i < vertexData.length; i++) {
    let newShape;
    if (vertexData[i].length === 1) {
      current_color = vertexData[i][0];
      continue;
    } else if (vertexData[i].length === 3) {
      current_offset = [vertexData[i][1], vertexData[i][2]];
      continue;
    } else if (vertexData[i].length === 2) {
      newShape = new Circle(offsetVertices(vertexData[i], current_offset[0], current_offset[1]), current_color, 5, 15);
    } else {
      newShape = new Triangle(offsetVertices(vertexData[i], current_offset[0], current_offset[1]), current_color, 15);
    }
    g_shapeList.push(newShape);
  }
  renderAllShapes();
}