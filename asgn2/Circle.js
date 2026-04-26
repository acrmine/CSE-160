class Circle {
  constructor(position = [0.0, 0.0, 0.0], color = [1.0, 0.0, 0.0, 1.0], size = 10.0, positionDivisor = 1) {
    this.type = 'circle';
    this.position = position;
    this.color = color;
    this.size = size;
    this.segments = 10;
    this.positionDivisor = positionDivisor;
  }

  render() {
    var rgba = this.color;

    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    // Draw Circle
    this.drawCircle(this.position, this.size, this.segments, this.positionDivisor);
  }

  drawCircle(position = [0.0, 0.0], size = 10.0, segments = 10, positionDivisor = 1) {
    var d = size / 200; // Convert size to a suitable scale for the circle

    let angleStep = 360 / segments;
    for(var angle = 0; angle < 360; angle += angleStep) {
        let centerPt = [position[0] / positionDivisor, position[1] / positionDivisor];
        let angle1 = angle;
        let angle2 = angle + angleStep;
        let vec1 = [d * Math.cos(angle1 * Math.PI / 180), d * Math.sin(angle1 * Math.PI / 180)];
        let vec2 = [d * Math.cos(angle2 * Math.PI / 180), d * Math.sin(angle2 * Math.PI / 180)];
        let pt1 = [centerPt[0] + vec1[0], centerPt[1] + vec1[1]];
        let pt2 = [centerPt[0] + vec2[0], centerPt[1] + vec2[1]];
        drawTriangle([centerPt[0], centerPt[1], pt1[0], pt1[1], pt2[0], pt2[1]]);
    }
  }
}