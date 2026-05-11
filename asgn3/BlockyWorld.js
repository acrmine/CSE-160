// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform int u_textureMode;
  uniform int u_textureIndex;
  uniform sampler2D u_Textures[4];
  void main() {
    if (u_textureMode == -2) {
      gl_FragColor = u_FragColor;
    } else if (u_textureMode == -1) {
      gl_FragColor = vec4(v_UV, 1.0, 1.0);
    } else if (u_textureMode == 0) {
      for (int i = 0; i < 10; i++) {
        if (i == u_textureIndex) {
          gl_FragColor = texture2D(u_Textures[i], v_UV);
        }
      }
    } else {
      gl_FragColor = vec4(1, 0.2, 0.2, 1);
    }
  }`

// Global variables
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_ModelMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;
let u_textureMode;
let u_textureIndex;
let u_Textures;

let g_mouseSensitivity = 0.7;
let g_camera = new Camera();
let g_levelObjects = new Map();

let g_textureLocations = {
  "green_checker": "imgs/texture_08.png",
  "bark": "imgs/bark.png",
}
let g_textures = new Map();

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

  // Get the storage location of a_UV
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
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

  // Get the storage location of u_ViewMatrix
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  // Get the storage location of u_ProjectionMatrix
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  // Get the storage location of u_textureMode
  u_textureMode = gl.getUniformLocation(gl.program, 'u_textureMode');
  if (!u_textureMode) {
    console.log('Failed to get the storage location of u_textureMode');
    return;
  }

  u_textureIndex = gl.getUniformLocation(gl.program, 'u_textureIndex');
  if (!u_textureIndex) {
    console.log('Failed to get the storage location of u_textureIndex');
    return false;
  }
  gl.uniform1i(u_textureIndex, 2);

  u_Textures = gl.getUniformLocation(gl.program, 'u_Textures');
  if (!u_Textures) {
    console.log('Failed to get the storage location of u_Textures');
    return false;
  }

  // Give u_ModelMatrix an identity matrix
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

function initTextures() {
  let num = 0;
  let loadedTextureNums = [];
  for (const [name, url] of Object.entries(g_textureLocations)) {
    console.log(`Loading texture: ${name} from ${url}`);
    let image = new Image();
    if (!image) {
      console.log('Failed to create the' + name + 'image object');
      return false;
    }

    image.onload = function() {
      sendImageToTEXTUREn(image, num);
      g_textures.set(name, num);
    };
    loadedTextureNums.push(num);
    num++;
    image.src = url;
  }
  gl.uniform1i(u_Textures, loadedTextureNums);

  return true;
  // let image = new Image();
  // if (!image) {
  //   console.log('Failed to create the image object');
  //   return false;
  // }
  // image.onload = function() { sendImageToTEXTURE0(image); };
  // image.src = 'imgs/bark.png';
}

// function sendImageToTEXTURE0(image) {
//   let texture = gl.createTexture();
//   if (!texture) {
//     console.log('Failed to create the texture object');
//     return false;
//   }

//   gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
//   gl.activeTexture(gl.TEXTURE0);
//   gl.bindTexture(gl.TEXTURE_2D, texture);
//   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
//   gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
//   gl.uniform1i(u_Sampler0, 0);
// } 

function sendImageToTEXTUREn(image, n) {
  let texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create texture' + n.toString() + ' object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  gl.activeTexture(gl['TEXTURE' + n.toString()]);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
} 

function addActionsForHtmlUI() {
  console.log("No actions added yet")
}

function keydown(ev) {
  if (ev.key === 'w') {
    g_camera.forward();
  } else if (ev.key === 's') {
    g_camera.backward();
  } else if (ev.key === 'a') {
    g_camera.left();
  } else if (ev.key === 'd') {
    g_camera.right();
  }
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();

  // Settup actions for the HTML UI
  addActionsForHtmlUI();

  buildLevelStart();

  document.onkeydown = keydown;
  initTextures();

  // Specify the color for clearing <canvas>
  gl.clearColor(0, 1, 1, 1);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  requestAnimationFrame(tick);
}

function tick() {
  renderAllShapes();
  requestAnimationFrame(tick);
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

function buildLevelStart() {
  let floor = new Cube([1, 0, 0, 1]);
  floor.matrix.translate(0, -0.75, 0);
  floor.matrix.scale(10, 0, 10);
  floor.render();

  g_levelObjects['floor'] = floor;
}

function renderAllShapes() {

  let projMatrix = new Matrix4().setPerspective(50, canvas.width/canvas.height, 0.1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMatrix.elements);

  let viewMatrix = new Matrix4().setLookAt(
    g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2], 
    g_camera.at.elements[0], g_camera.at.elements[1], g_camera.at.elements[2], 
    g_camera.up.elements[0], g_camera.up.elements[1], g_camera.up.elements[2]);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  for (const [name, shape] of Object.entries(g_levelObjects)) {
    shape.render();
  }
}