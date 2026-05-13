const VERT_SIZE = 3 * Float32Array.BYTES_PER_ELEMENT;
const UV_SIZE = 2 * Float32Array.BYTES_PER_ELEMENT;

class Shape {
  constructor(color = [1, 1, 0, 1]) {
    this.type = 'generic';
    this.color = color;

    this.pos = {x: 0, y: 0, z: 0};
    this.rot = {x: 0, y: 0, z: 0};
    this.scl = {x: 1, y: 1, z: 1};

    this.matrix = new Matrix4();

    this.vertices = [];
    this.normals = [];
    this.uvs = [];

    this.vertexBuffer = gl.createBuffer();
    this.normalBuffer = gl.createBuffer();
    this.uvBuffer = gl.createBuffer();

    if (!this.vertexBuffer || !this.normalBuffer) {
        console.log("Failed to create buffers for", this.filePath);
        return;
    }

    this.unappliedTransform = false;
  }

  setTranslate(x, y, z) {
    this.pos.x = x;
    this.pos.y = y;
    this.pos.z = z;
    this.unappliedTransform = true;
  }

  setRotation(x, y, z) {
    this.rot.x = x;
    this.rot.y = y;
    this.rot.z = z;
    this.unappliedTransform = true;
  }

  setScale(x, y, z) {
    this.scl.x = x;
    this.scl.y = y;
    this.scl.z = z;
    this.unappliedTransform = true;
  }

  translate(x, y, z) {
    this.pos.x += x;
    this.pos.y += y;
    this.pos.z += z;
    this.unappliedTransform = true;
  }

  rotate(x, y, z) {
    this.rot.x += x;
    this.rot.y += y;
    this.rot.z += z;
    this.unappliedTransform = true;
  }

  scale(x, y, z) {
    this.scl.x += x;
    this.scl.y += y;
    this.scl.z += z;
    this.unappliedTransform = true;
  }

  applyTransform() {
    if (this.unappliedTransform) {
      this.matrix.setIdentity();

      this.matrix.translate(this.pos.x, this.pos.y, this.pos.z);
      this.unappliedTranslation = false;

      this.matrix.rotate(this.rot.x, 1, 0, 0);
      this.matrix.rotate(this.rot.y, 0, 1, 0);
      this.matrix.rotate(this.rot.z, 0, 0, 1);
      this.unappliedRotation = false;

      this.matrix.scale(this.scl.x, this.scl.y, this.scl.z);
      this.unappliedScale = false;
    }
  }

  // This function is meant to be overridden by subclasses.
  // It should contain the code to draw the shape.
  render() {
    this.applyTransform();

    gl.uniform1i(u_textureMode, this.textureMode);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    if (this.normals.length > 0) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.DYNAMIC_DRAW);
      gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(a_Normal);
    }

    if (this.uvs.length > 0) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.uvs), gl.DYNAMIC_DRAW);
      gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(a_UV);
    }

    // Pass the color of a point to u_FragColor variable
    gl.uniform4fv(u_FragColor, this.color);

    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    let normalMatrix = new Matrix4().setInverseOf(this.matrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

    gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 3); // Draw the triangles
  }
}

function drawTriangle3D(vertices) {
    let n = 3; // The number of vertices
    let vertexBuffer = gl.createBuffer(); // Create a buffer object
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);

    gl.drawArrays(gl.TRIANGLES, 0, n); // Draw the triangle
}

function drawTriangle3DUV(vertices, uv) {
    let n = 3; // The number of vertices
    let vertexBuffer = gl.createBuffer(); // Create a buffer object
    if (!vertexBuffer) {
        console.log('Failed to create the vertex buffer object');
        return -1;
    }

    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);

    // UV Buffer
    let uvBuffer = gl.createBuffer();
    if (!uvBuffer) {
        console.log('Failed to create the uv buffer object');
        return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_UV);

    gl.drawArrays(gl.TRIANGLES, 0, n); // Draw the triangle
}