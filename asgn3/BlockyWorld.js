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
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  void main() {
    if (u_textureMode == -2) {
      gl_FragColor = u_FragColor;
    } else if (u_textureMode == -1) {
      gl_FragColor = vec4(v_UV, 1.0, 1.0);
    } else if (u_textureMode == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    } else if (u_textureMode == 1) {
      gl_FragColor = texture2D(u_Sampler1, v_UV);
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
let u_Sampler0;
let u_Sampler1;

let g_camera = new Camera();
let g_levelObjects = [];

let g_prevTime = performance.now();
let g_frameCount = 0;
let g_fps = 0;

// X in the array will place the player there
let X = "PlayerSpawn"
let level1 = [
  [1,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [1,0,0,0,4,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [1,0,0,0,4,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [1,0,0,0,0,0,0,1,0,0,X,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [1,0,0,0,4,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [1,0,0,0,4,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
  [1,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
]

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

  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return;
  }
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return;
  }

  // Give u_ModelMatrix an identity matrix
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

function initTextures() {
  let image0 = new Image();
  image0.onload = function() { sendImageToTEXTURE0(image0); };
  image0.src = 'imgs/bark.png';

  let image1 = new Image();
  image1.onload = function() { sendImageToTEXTURE1(image1); };
  image1.src = 'imgs/texture_08.png';

  return true;
}

function sendImageToTEXTURE0(image) {
  let texture0 = gl.createTexture();

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture0);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler0, 0);
}

function sendImageToTEXTURE1(image) {
  let texture1 = gl.createTexture();

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, texture1);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler1, 1);
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
  
  else if (ev.key === 'q') {
    g_camera.turnHorizontal(15);
  } else if (ev.key === 'e') {
    g_camera.turnHorizontal(-15);
  } 
  
  else if (ev.key === 'Escape') {
    document.exitPointerLock();
  }
}

function click(ev) {
  try {
    canvas.requestPointerLock({ unadjustedMovement: true });
  } catch (err) {
    console.log('Failed to lock pointer:', err);
  }
}

function mousemove(ev) {
  if (document.pointerLockElement === canvas) {
    g_camera.turnHorizontal(-ev.movementX);
    g_camera.turnVertical(-ev.movementY);
  }
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();

  // Settup actions for the HTML UI
  addActionsForHtmlUI();
  buildLevel(level1);

  canvas.addEventListener('click', click);
  document.addEventListener('mousemove', mousemove);

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

function buildLevel(levelData) {
  let largestRowLength = 0;
  for (let z = 0; z < levelData.length; z++) {
    let rowLength = levelData[z].length;
    if (rowLength > largestRowLength) {
      largestRowLength = rowLength;
    }
    for (let x = 0; x < rowLength; x++) {
      let cell = levelData[z][x];
      if (cell === 0) {
        continue;
      } else if (cell === X) {
        g_camera.setLocation(x + 0.5, 1.5, z + 0.5);
      } else {
        for (let y = 0; y < cell; y++) {
          let cube = new Cube();
          cube.matrix.translate(x + 0.5, y + 0.5, z + 0.5);
          g_levelObjects.push(cube);
        }
      }
    }
  }

  buildFloor(levelData.length, largestRowLength);
}

function buildFloor(len, wid) {
  let lenAmnt = Math.ceil(len / 8);
  let widAmnt = Math.ceil(wid / 8);
  console.log(`Building floor with ${lenAmnt} by ${widAmnt} tiles.`);
  for (let z = 0; z < lenAmnt; z++) {
    for (let x = 0; x < widAmnt; x++) {
      let floor = new Cube();
      floor.textureMode = 1;
      floor.matrix.translate(x * 8 + 4, -0.001, z * 8 + 4);
      floor.matrix.scale(8, 0, 8);
      g_levelObjects.push(floor);
    }
  }
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

  for (const shape of g_levelObjects) {
    shape.render();
  }
}