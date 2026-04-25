class Triangle {
  constructor(specificVerts = [], color = [1.0, 0.0, 0.0, 1.0], vertexDivisor = 1) {
    this.type = 'triangle';
    this.position = [0.0, 0.0, 0.0];
    this.color = color;
    this.size = 10.0;
    this.vertices = specificVerts;
    this.vertexDivisor = vertexDivisor;
  }

  render() {
    var xy = this.position;
    var rgba = this.color;
    var size = this.size;

    // Pass the position of a point to a_Position variable
    //gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);

    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    // Pass the size of a point to u_Size variable
    gl.uniform1f(u_Size, size);
    // Draw
    var d = this.size / 200; // Convert size to a suitable scale for the triangle
    drawTriangle(this.vertices.length > 5 ? this.vertices : [xy[0], xy[1], xy[0] + d, xy[1], xy[0], xy[1] + d], this.vertexDivisor);
  }
}

function drawTriangle(vertices, vertexDivisor = 1) {
    let n = 3; // The number of vertices
    let vertexBuffer = gl.createBuffer(); // Create a buffer object
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    let finalVertices = new Array(vertices.length);
    for (let i = 0; i < vertices.length; i++) {
        finalVertices[i] = vertices[i] / vertexDivisor;
    }

    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(finalVertices), gl.DYNAMIC_DRAW);

    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);

    gl.drawArrays(gl.TRIANGLES, 0, n); // Draw the triangle
}