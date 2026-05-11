class Shape {
  constructor(color = [1, 1, 0, 1]) {
    this.type = 'generic';
    this.color = color;
    this.scale = [1, 1, 1];
    this.textureMode = 0;
    this.texture = 'bark';

    this.matrix = new Matrix4();
  }

  setScale(x, y, z) {
    this.scale = [x, y, z];
  }

  scaleMatrix() {
    this.matrix.scale(this.scale[0], this.scale[1], this.scale[2]);
  }

  // This function is meant to be overridden by subclasses.
  // It should contain the code to draw the shape.
  render() {
    gl.uniform1i(u_textureMode, this.textureMode);
    console.log(`Rendering ${this.type} with texture mode ${this.textureMode} and texture ${this.texture}`);
    gl.uniform1i(u_textureIndex, g_textures.get(this.texture));
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