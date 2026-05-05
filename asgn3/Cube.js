class Cube extends Shape {
  constructor(color) {
    super(color);
    this.type = 'cube';
  }

  render() {
    var rgba = this.color;

    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    // Front of cube
    drawTriangle3D([-0.5,-0.5,-0.5, 0.5,0.5,-0.5,  0.5,-0.5,-0.5]);
    drawTriangle3D([-0.5,-0.5,-0.5, -0.5,0.5,-0.5,  0.5,0.5,-0.5]);

    // Back of cube
    drawTriangle3D([-0.5,-0.5,0.5, 0.5,-0.5,0.5, 0.5,0.5,0.5]);
    drawTriangle3D([-0.5,-0.5,0.5, 0.5,0.5,0.5, -0.5,0.5,0.5]);

    gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);

    // Top of cube
    drawTriangle3D([-0.5,0.5,-0.5, -0.5,0.5,0.5, 0.5,0.5,0.5]);
    drawTriangle3D([-0.5,0.5,-0.5, 0.5,0.5,0.5, 0.5,0.5,-0.5]);

    // Bottom of cube
    drawTriangle3D([-0.5,-0.5,-0.5, 0.5,-0.5,-0.5, 0.5,-0.5,0.5]);
    drawTriangle3D([-0.5,-0.5,-0.5, 0.5,-0.5,0.5, -0.5,-0.5,0.5]);

    gl.uniform4f(u_FragColor, rgba[0] * 0.8, rgba[1] * 0.8, rgba[2] * 0.8, rgba[3]);

    // Left of cube
    drawTriangle3D([-0.5,-0.5,-0.5, -0.5,0.5,-0.5, -0.5,0.5,0.5]);
    drawTriangle3D([-0.5,-0.5,-0.5, -0.5,0.5,0.5, -0.5,-0.5,0.5]);

    // Right of cube
    drawTriangle3D([0.5,-0.5,-0.5, 0.5,0.5,-0.5, 0.5,0.5,0.5]);
    drawTriangle3D([0.5,-0.5,-0.5, 0.5,0.5,0.5, 0.5,-0.5,0.5]);
  }
}