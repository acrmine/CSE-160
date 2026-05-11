class HalfPyramid extends Shape{
  constructor(color) {
    super(color);
    this.type = 'halfPyramid';
    this.textureMode = 0;
  }

  render() {
    super.render();

    var rgba = this.color;

    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    // Front of pyramid
    drawTriangle3DUV([0,1,0, -0.5,0,-0.5, 0.5,0,-0.5], [0,0, 0,1, 1,1]);

    // Back of pyramid
    drawTriangle3DUV([0,1,0, -0.5,0,0, 0.5,0,0], [0,0, 0,1, 1,1]);

    gl.uniform4f(u_FragColor, rgba[0] * 0.8, rgba[1] * 0.8, rgba[2] * 0.8, rgba[3]);

    // Bottom of pyramid
    drawTriangle3DUV([-0.5,0,-0.5, 0.5,0,-0.5, 0.5,0,0], [0,0, 1,0, 1,1]);
    drawTriangle3DUV([-0.5,0,-0.5, 0.5,0,0, -0.5,0,0], [0,0, 1,1, 0,1]);

    gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);

    // Left of pyramid
    drawTriangle3DUV([-0.5,0,-0.5, 0,1,0, -0.5,0,0], [0,0, 0,1, 1,1]);

    // Right of pyramid
    drawTriangle3DUV([0.5,0,-0.5, 0,1,0, 0.5,0,0], [0,0, 0,1, 1,1]);
  }
}