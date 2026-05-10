// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform int u_whichTexture;
  uniform sampler2D u_Sampler0;
  void main() {
    if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor;
    } else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV, 1.0, 1.0);
    } else if (u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV);
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
let u_GlobalRotateMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;
let u_whichTexture;
let u_Sampler0;

let g_prevMouse = [0, 0];
let g_prevCameraSlide = 0;
let g_globalAngle = [0, 0];
let g_eye = [0, 0, 8];
let g_at = [0, 0, 0];
let g_up = [0, 1, 0];
let g_globalScale = 1;
let g_dragSensitivity = 0.7;
let g_dragging = false;

let g_prevTime = performance.now();
let g_frameCount = 0;
let g_fps = 0;

let funAnimationPlaying = false;
let animationPlaying = true;

const g_jointSliders = new Map();
const g_jointSlidersToAdd = [
  ["beakSlide", 0], 
  ["shoulderSlide", 1], 
  ["midWingSlide", 1], 
  ["wingTipSlide", 1],
  ["rightThighSlide", 2],
  ["rightCalfSlide", 2],
  ["rightFootSlide", 2],
  ["leftThighSlide", 2],
  ["leftCalfSlide", 2],
  ["leftFootSlide", 2],
];

const penguinShapes = new Map();

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

  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
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

  // Get the storage location of u_whichTexture
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return;
  }

  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return false;
  }

  // Give u_ModelMatrix an identity matrix
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

function initTextures() {
  let image = new Image();
  if (!image) {
    console.log('Failed to create the image object');
    return false;
  }
  image.onload = function() { sendImageToTEXTURE0(image); };
  image.src = 'imgs/bark.png';

  return true;
}

function sendImageToTEXTURE0(image) {
  let texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler0, 0);
} 

function addActionsForHtmlUI() {
  document.getElementById('playSwimming').addEventListener('click', function() { animationPlaying = true; });
  document.getElementById('stopSwimming').addEventListener('click', function() { animationPlaying = false; });

  document.getElementById('cameraSlide').addEventListener('mousemove', function(ev) {
    if (ev.buttons === 1) {
      let delta = this.value - g_prevCameraSlide;
      g_prevCameraSlide = this.value;
      g_globalAngle[0] += delta;
    }
  });

  for (let slider of g_jointSlidersToAdd) {
    g_jointSliders.set(slider[0], 0);
    if (slider[1] === 0) {
      document.getElementById(slider[0]).addEventListener('mousemove', function(ev) {
        if (ev.buttons === 1) {
          g_jointSliders.set(slider[0], this.value);
        }
      });
    } else if (slider[1] === 1) {
      document.getElementById(slider[0]).addEventListener('mousemove', function(ev) {
        if (ev.buttons === 1 && !funAnimationPlaying) {
          g_jointSliders.set(slider[0], this.value);
        }
      });
    } else if (slider[1] === 2) {
      document.getElementById(slider[0]).addEventListener('mousemove', function(ev) {
        if (ev.buttons === 1 && !animationPlaying) {
          g_jointSliders.set(slider[0], this.value);
        }
      });
    }
  }
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

  initTextures();

  // Specify the color for clearing <canvas>
  gl.clearColor(0, 1, 1, 1);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  requestAnimationFrame(tick);
}

function tick() {
  if (animationPlaying) {
    updateAnimationAngles();
  }

  buildPenguinShapes();

  scalePenguinShapes();
  renderAllShapes();
  requestAnimationFrame(tick);
}

function updateAnimationAngles() {
  let total_seconds = performance.now() / 100;

  g_jointSliders.set("rightThighSlide", 30 * Math.sin(total_seconds));
  g_jointSliders.set("rightCalfSlide", 20 * Math.sin(total_seconds));
  g_jointSliders.set("rightFootSlide", 15 * Math.sin(total_seconds) + 30);

  g_jointSliders.set("leftThighSlide", 30 * Math.sin(total_seconds + Math.PI));
  g_jointSliders.set("leftCalfSlide", 20 * Math.sin(total_seconds + Math.PI));
  g_jointSliders.set("leftFootSlide", 15 * Math.sin(total_seconds + Math.PI) + 30);
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
function buildPenguinShapes() {
  // main body
  var body = new Cube([1, 1, 1, 1]);
  body.setScale(4, 5, 3);

  var body_back = new Cube([0, 0, 0, 1]);
  body_back.matrix.setTranslate(0, 0, 0.8);
  body_back.setScale(4.1, 5.1, 1.6);



  // neck
  var neck1 = new Cube([1,1,1,1]);
  neck1.matrix.setTranslate(0, 3, 0.0);
  neck1.setScale(3, 1, 2.5);

  var neck1_back = new Cube([0,0,0,1]);
  neck1_back.matrix.setTranslate(0, 3, 0.675);
  neck1_back.setScale(3.1, 1.1, 1.35);

  var neck2 = new Cube([1,1,1,1]);
  neck2.matrix.setTranslate(0, 4, -0.2);
  neck2.setScale(2, 1.2, 2);

  var neck2_back = new Cube([0,0,0,1]);
  neck2_back.matrix.setTranslate(0, 4, 0.4);
  neck2_back.setScale(2.1, 1.3, 0.9);

  var neck3 = new Cube([0,0,0,1]);
  neck3.matrix.setTranslate(0, 4.5, -0.4);
  neck3.setScale(1.9, 1.2, 1.5);



  // head
  var head = new Cube([0,0,0,1]);
  head.matrix.setTranslate(0, 5, -1);
  head.setScale(1.6, 1.5, 2);

  var right_eye = new Cube([1,1,1,1]);
  right_eye.matrix.setTranslate(-0.8, 5.3, -1.5);
  right_eye.setScale(0.3, 0.3, 0.5);

  var right_pupil = new Cube([0,0,0,1]);
  right_pupil.matrix.setTranslate(-0.9, 5.3, -1.5);
  right_pupil.setScale(0.2, 0.1, 0.2);

  var left_eye = new Cube([1,1,1,1]);
  left_eye.matrix.setTranslate(0.8, 5.3, -1.5);
  left_eye.setScale(0.3, 0.3, 0.5);

  var left_pupil = new Cube([0,0,0,1]);
  left_pupil.matrix.setTranslate(0.9, 5.3, -1.5);
  left_pupil.setScale(0.2, 0.1, 0.2);

  var beak_top = new HalfPyramid([1,165/255,0,1]);
  beak_top.matrix.setTranslate(0, 4.8, -2);
  beak_top.matrix.rotate(180, 0, 1, 0);
  beak_top.matrix.rotate(90, 1, 0, 0);
  if (!funAnimationPlaying) {
    beak_top.matrix.rotate(-g_jointSliders.get("beakSlide"), 1, 0, 0);
  }
  beak_top.setScale(1, 1.4, 0.8);

  var beak_bottom = new HalfPyramid([1,165/255,0,1]);
  beak_bottom.matrix.setTranslate(0, 4.8, -2);
  beak_bottom.matrix.rotate(-90, 1, 0, 0);
  if (!funAnimationPlaying) {
    beak_bottom.matrix.rotate(-g_jointSliders.get("beakSlide"), 1, 0, 0);
  }
  beak_bottom.setScale(1, 1.4, 0.3);



  // waist
  var hips = new Cube([1,1,1,1]);
  hips.matrix.setTranslate(0, -2.52, 0.0);
  hips.setScale(3.5, 1, 2.5);

  var hips_back = new Cube([0,0,0,1]);
  hips_back.matrix.setTranslate(0, -2.52, 0.8);
  hips_back.setScale(3.6, 1.1, 1.35);



  // right arm
  var right_arm1 = new Cube([0,0,0,1]);
  right_arm1.matrix.translate(-2.1, 1.4, 0);
  if (!funAnimationPlaying) {
    right_arm1.matrix.rotateAboutPoint(-g_jointSliders.get("shoulderSlide"), 0, 0, 1, 0, 0.7, 0);
  }
  var right_arm1_loc = [
    new Matrix4(right_arm1.matrix),
    new Matrix4(right_arm1.matrix)];
  right_arm1.setScale(0.2, 1.5, 2);

  var right_arm1_back = new Cube([1,1,1,1]);
  right_arm1_back.matrix = right_arm1_loc[0];
  right_arm1_back.matrix.translate(0.1, -0.005, 0);
  right_arm1_back.setScale(0.2, 1.4, 1.9);

  var right_arm2 = new Cube([0,0,0,1]);
  right_arm2.matrix = right_arm1_loc[1];
  right_arm2.matrix.translate(0, -1.5, 0);
  if (!funAnimationPlaying) {
    right_arm2.matrix.rotateAboutPoint(-g_jointSliders.get("midWingSlide"), 0, 0, 1, 0, 0.7, 0);
  }
  var right_arm2_loc = [
    new Matrix4(right_arm2.matrix),
    new Matrix4(right_arm2.matrix)];
  right_arm2.setScale(0.2, 1.5, 1.9);

  var right_arm2_back = new Cube([1,1,1,1]);
  right_arm2_back.matrix = right_arm2_loc[0];
  right_arm2_back.matrix.translate(0.1, 0, 0);
  right_arm2_back.setScale(0.2, 1.4, 1.8);

  var right_arm3 = new Cube([0,0,0,1]);
  right_arm3.matrix = right_arm2_loc[1];
  right_arm3.matrix.translate(0, -1.2, 0);
  if (!funAnimationPlaying) {
    right_arm3.matrix.rotateAboutPoint(-g_jointSliders.get("wingTipSlide"), 0, 0, 1, 0, 0.7, 0);
  }
  right_arm3_loc = new Matrix4(right_arm3.matrix);
  right_arm3.setScale(0.2, 1.1, 1.3);

  var right_arm3_back = new Cube([1,1,1,1]);
  right_arm3_back.matrix = right_arm3_loc;
  right_arm3_back.matrix.translate(0.1, 0, 0);
  right_arm3_back.setScale(0.2, 1, 1.2);



  // left arm
  var left_arm1 = new Cube([0,0,0,1]);
  left_arm1.matrix.translate(2.1, 1.4, 0);
  if (!funAnimationPlaying) {
    left_arm1.matrix.rotateAboutPoint(g_jointSliders.get("shoulderSlide"), 0, 0, 1, 0, 0.7, 0);
  }
  var left_arm1_loc = [
    new Matrix4(left_arm1.matrix),
    new Matrix4(left_arm1.matrix)];
  left_arm1.setScale(0.2, 1.5, 2);

  var left_arm1_back = new Cube([1,1,1,1]);
  left_arm1_back.matrix = left_arm1_loc[0];
  left_arm1_back.matrix.translate(-0.1, -0.005, 0);
  left_arm1_back.setScale(0.2, 1.4, 1.9);

  var left_arm2 = new Cube([0,0,0,1]);
  left_arm2.matrix = left_arm1_loc[1];
  left_arm2.matrix.translate(0, -1.5, 0);
  if (!funAnimationPlaying) {
    left_arm2.matrix.rotateAboutPoint(g_jointSliders.get("midWingSlide"), 0, 0, 1, 0, 0.7, 0);
  }
  var left_arm2_loc = [
    new Matrix4(left_arm2.matrix),
    new Matrix4(left_arm2.matrix)];
  left_arm2.setScale(0.2, 1.5, 1.9);

  var left_arm2_back = new Cube([1,1,1,1]);
  left_arm2_back.matrix = left_arm2_loc[0];
  left_arm2_back.matrix.translate(-0.1, 0, 0);
  left_arm2_back.setScale(0.2, 1.4, 1.8);

  var left_arm3 = new Cube([0,0,0,1]);
  left_arm3.matrix = left_arm2_loc[1];
  left_arm3.matrix.translate(0, -1.2, 0);
  if (!funAnimationPlaying) {
    left_arm3.matrix.rotateAboutPoint(g_jointSliders.get("wingTipSlide"), 0, 0, 1, 0, 0.7, 0);
  }
  left_arm3_loc = new Matrix4(left_arm3.matrix);
  left_arm3.setScale(0.2, 1.1, 1.3);

  var left_arm3_back = new Cube([1,1,1,1]);
  left_arm3_back.matrix = left_arm3_loc;
  left_arm3_back.matrix.translate(-0.1, 0, 0);
  left_arm3_back.setScale(0.2, 1, 1.2);



  // right leg
  var right_leg1 = new Cube([1,1,1,1]);
  right_leg1.matrix.translate(-0.8, -3.2, 0);
  right_leg1.matrix.rotateAboutPoint(-g_jointSliders.get("rightThighSlide"), 1, 0, 0, 0, 0.7, 0);
  var right_leg1_loc = new Matrix4(right_leg1.matrix);
  right_leg1.setScale(1.4, 1.4, 1.8);

  var right_leg2 = new Cube([1,1,1,1]);
  right_leg2.matrix = right_leg1_loc;
  right_leg2.matrix.translate(0, -1, 0);
  right_leg2.matrix.rotateAboutPoint(-g_jointSliders.get("rightCalfSlide"), 1, 0, 0, 0, 0.7, 0);
  var right_leg2_loc = new Matrix4(right_leg2.matrix);
  right_leg2.setScale(1, 1, 1);

  var right_foot = new Cube([0.5,0.5,0.5,1]);
  right_foot.matrix = right_leg2_loc;
  right_foot.matrix.translate(0, -0.6, -0.4);
  right_foot.matrix.rotateAboutPoint(-g_jointSliders.get("rightFootSlide"), 1, 0, 0, 0, 0.7, 0.5);
  var right_foot_loc = [
    new Matrix4(right_foot.matrix), 
    new Matrix4(right_foot.matrix), 
    new Matrix4(right_foot.matrix)];
  right_foot.setScale(1.15, 0.5, 1.55);

  var right_claw1 = new HalfPyramid([0,0,0,1]);
  right_claw1.matrix = right_foot_loc[0];
  right_claw1.matrix.translate(-0.35, -0.22, -0.7);
  right_claw1.matrix.rotate(180, 0, 1, 0);
  right_claw1.matrix.rotate(90, 1, 0, 0);
  right_claw1.matrix.rotate(-10, 0, 0, 1);
  right_claw1.setScale(0.3, 0.6, 0.8);

  var right_claw2 = new HalfPyramid([0,0,0,1]);
  right_claw2.matrix = right_foot_loc[1];
  right_claw2.matrix.translate(0, -0.22, -0.7);
  right_claw2.matrix.rotate(180, 0, 1, 0);
  right_claw2.matrix.rotate(90, 1, 0, 0);
  right_claw2.setScale(0.3, 0.8, 0.8);

  var right_claw3 = new HalfPyramid([0,0,0,1]);
  right_claw3.matrix = right_foot_loc[2];
  right_claw3.matrix.translate(0.35, -0.22, -0.7);
  right_claw3.matrix.rotate(180, 0, 1, 0);
  right_claw3.matrix.rotate(90, 1, 0, 0);
  right_claw3.matrix.rotate(10, 0, 0, 1);
  right_claw3.setScale(0.3, 0.6, 0.8);



  // left leg
  var left_leg1 = new Cube([1,1,1,1]);
  left_leg1.matrix.translate(0.8, -3.2, 0);
  left_leg1.matrix.rotateAboutPoint(-g_jointSliders.get("leftThighSlide"), 1, 0, 0, 0, 0.7, 0);
  var left_leg1_loc = new Matrix4(left_leg1.matrix);
  left_leg1.setScale(1.4, 1.4, 1.8);

  var left_leg2 = new Cube([1,1,1,1]);
  left_leg2.matrix = left_leg1_loc;
  left_leg2.matrix.translate(0, -1, 0);
  left_leg2.matrix.rotateAboutPoint(-g_jointSliders.get("leftCalfSlide"), 1, 0, 0, 0, 0.7, 0);
  var left_leg2_loc = new Matrix4(left_leg2.matrix);
  left_leg2.setScale(1, 1, 1);

  var left_foot = new Cube([0.5,0.5,0.5,1]);
  left_foot.matrix = left_leg2_loc;
  left_foot.matrix.translate(0, -0.6, -0.4);
  left_foot.matrix.rotateAboutPoint(-g_jointSliders.get("leftFootSlide"), 1, 0, 0, 0, 0.7, 0.5);
  var left_foot_loc = [
    new Matrix4(left_foot.matrix), 
    new Matrix4(left_foot.matrix), 
    new Matrix4(left_foot.matrix)];
  left_foot.setScale(1.15, 0.5, 1.55);

  var left_claw1 = new HalfPyramid([0,0,0,1]);
  left_claw1.matrix = left_foot_loc[0];
  left_claw1.matrix.translate(-0.35, -0.22, -0.7);
  left_claw1.matrix.rotate(180, 0, 1, 0);
  left_claw1.matrix.rotate(90, 1, 0, 0);
  left_claw1.matrix.rotate(-10, 0, 0, 1);
  left_claw1.setScale(0.3, 0.6, 0.8);

  var left_claw2 = new HalfPyramid([0,0,0,1]);
  left_claw2.matrix = left_foot_loc[1];
  left_claw2.matrix.translate(0, -0.22, -0.7);
  left_claw2.matrix.rotate(180, 0, 1, 0);
  left_claw2.matrix.rotate(90, 1, 0, 0);
  left_claw2.setScale(0.3, 0.8, 0.8);

  var left_claw3 = new HalfPyramid([0,0,0,1]);
  left_claw3.matrix = left_foot_loc[2];
  left_claw3.matrix.translate(0.35, -0.22, -0.7);
  left_claw3.matrix.rotate(180, 0, 1, 0);
  left_claw3.matrix.rotate(90, 1, 0, 0);
  left_claw3.matrix.rotate(10, 0, 0, 1);
  left_claw3.setScale(0.3, 0.6, 0.8);

  penguinShapes.set("body", body);
  penguinShapes.set("body_back", body_back);

  penguinShapes.set("neck1", neck1);
  penguinShapes.set("neck1_back", neck1_back);
  penguinShapes.set("neck2", neck2);
  penguinShapes.set("neck2_back", neck2_back);
  penguinShapes.set("neck3", neck3);

  penguinShapes.set("head", head);
  penguinShapes.set("right_eye", right_eye);
  penguinShapes.set("right_pupil", right_pupil);
  penguinShapes.set("left_eye", left_eye);
  penguinShapes.set("left_pupil", left_pupil);
  penguinShapes.set("beak_top", beak_top);
  penguinShapes.set("beak_bottom", beak_bottom);

  penguinShapes.set("hips", hips);
  penguinShapes.set("hips_back", hips_back);

  penguinShapes.set("right_arm1", right_arm1);
  penguinShapes.set("right_arm1_back", right_arm1_back);
  penguinShapes.set("right_arm2", right_arm2);
  penguinShapes.set("right_arm2_back", right_arm2_back);
  penguinShapes.set("right_arm3", right_arm3);
  penguinShapes.set("right_arm3_back", right_arm3_back);

  penguinShapes.set("left_arm1", left_arm1);
  penguinShapes.set("left_arm1_back", left_arm1_back);
  penguinShapes.set("left_arm2", left_arm2);
  penguinShapes.set("left_arm2_back", left_arm2_back);
  penguinShapes.set("left_arm3", left_arm3);
  penguinShapes.set("left_arm3_back", left_arm3_back);

  penguinShapes.set("right_leg1", right_leg1);
  penguinShapes.set("right_leg2", right_leg2);
  penguinShapes.set("right_foot", right_foot);
  penguinShapes.set("right_claw1", right_claw1);
  penguinShapes.set("right_claw2", right_claw2);
  penguinShapes.set("right_claw3", right_claw3);

  penguinShapes.set("left_leg1", left_leg1);
  penguinShapes.set("left_leg2", left_leg2);
  penguinShapes.set("left_foot", left_foot);
  penguinShapes.set("left_claw1", left_claw1);
  penguinShapes.set("left_claw2", left_claw2);
  penguinShapes.set("left_claw3", left_claw3);
}

function scalePenguinShapes() {
  for (let shape of penguinShapes.values()) {
    shape.scaleMatrix();
  }
}

function renderAllShapes() {

  let projMatrix = new Matrix4().setPerspective(90, canvas.width/canvas.height, 0.1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMatrix.elements);

  let viewMatrix = new Matrix4().setLookAt(g_eye[0],g_eye[1],g_eye[2],g_at[0],g_at[1],g_at[2],g_up[0],g_up[1],g_up[2]); // (eye, at, up)
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);

  let scale = g_globalScale;
  let globalRotMat = new Matrix4()
    .scale(scale, scale, scale)
    .rotate(g_globalAngle[0], 0, 1, 0)
    .rotate(g_globalAngle[1], -1, 0, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  for (let shape of penguinShapes.values()) {
    shape.render();
  }
}