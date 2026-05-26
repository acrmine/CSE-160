class Sphere extends Shape {
  constructor(color) {
    super(color);
    this.type = 'sphere';
    this.textureMode = -2;

    let d = Math.PI / 20;

    for (let t = 0; t < Math.PI; t += d) {
      for (let r = 0; r < 2 * Math.PI; r += d) {
        let p1 = new Vector3([Math.sin(t) * Math.cos(r), Math.sin(t) * Math.sin(r), Math.cos(t)]);

        let p2 = new Vector3([Math.sin(t + d) * Math.cos(r), Math.sin(t + d) * Math.sin(r), Math.cos(t + d)]);
        let p3 = new Vector3([Math.sin(t) * Math.cos(r + d), Math.sin(t) * Math.sin(r + d), Math.cos(t)]);
        let p4 = new Vector3([Math.sin(t + d) * Math.cos(r + d), Math.sin(t + d) * Math.sin(r + d), Math.cos(t + d)]);

        this.vertices.push(...p1.elements, ...p2.elements, ...p4.elements);
        this.uvs.push(0, 0, 0, 1, 1, 1);
        this.normals.push(...p1.elements, ...p2.elements, ...p4.elements);

        this.vertices.push(...p1.elements, ...p4.elements, ...p3.elements);
        this.uvs.push(0, 0, 1, 1, 1, 0);
        this.normals.push(...p1.elements, ...p4.elements, ...p3.elements);
      }
    } 

    this.isFullyLoaded = true;
  }
}