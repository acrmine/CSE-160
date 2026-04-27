class HalfPyramid {
  constructor(color = [1.0, 1.0, 1.0, 1.0]) {
    this.type = 'halfPyramid';
    this.color = color;

    this.matrix = new Matrix4();
  }

  render() {
    var rgba = this.color;

    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    // Front of pyramid
    drawTriangle3D([0,1,0, -0.5,0,-0.5, 0.5,0,-0.5]);

    // Back of pyramid
    drawTriangle3D([0,1,0, -0.5,0,0, 0.5,0,0]);

    gl.uniform4f(u_FragColor, rgba[0] * 0.8, rgba[1] * 0.8, rgba[2] * 0.8, rgba[3]);

    // Bottom of pyramid
    drawTriangle3D([-0.5,0,-0.5, 0.5,0,-0.5, 0.5,0,0]);
    drawTriangle3D([-0.5,0,-0.5, 0.5,0,0, -0.5,0,0]);

    gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);

    // Left of pyramid
    drawTriangle3D([-0.5,0,-0.5, 0,1,0, -0.5,0,0]);

    // Right of pyramid
    drawTriangle3D([0.5,0,-0.5, 0,1,0, 0.5,0,0]);
  }
}