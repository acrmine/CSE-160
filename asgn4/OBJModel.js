class OBJModel extends Shape {
    constructor(filePath) {
        super();
        this.type = 'objmodel';
        this.filePath = filePath;

        this.isFullyLoaded = false;

        this.getFileContent().then(() => {
            this.vertexBuffer = gl.createBuffer();
            this.normalBuffer = gl.createBuffer();
            this.uvBuffer = gl.createBuffer();

            if (!this.vertexBuffer || !this.normalBuffer || !this.uvBuffer) {
                console.log("Failed to create buffers for", this.filePath);
                return;
            }
        });
    }

    async getFileContent() {
        try {
            const response = await fetch(this.filePath);
            if (!response.ok) throw new Error(`Could not load file "${this.filePath}". Are you sure the file name/path are correct?`);

            const fileContent = await response.text();
            this.parseModel(fileContent);
        } catch (e) {
            throw new Error(`Something went wrong when loading ${this.filePath}. Error: ${e}`);
        }
    }

    parseModel(fileContent) {
        const lines = fileContent.split("\n");
        const allVertices = [];
        const allNormals = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const tokens = line.split(" ");

            if (tokens[0] == 'v') {
                allVertices.push(parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3]));
            } else if (tokens[0] == "vn") {
                allNormals.push(parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3]));
            } else if (tokens[0] == "f") {
                for (const face of [tokens[1], tokens[2], tokens[3]]) {
                    const indices = face.split("//");
                    const vertexIndex = (parseInt(indices[0]) - 1) * 3;
                    const normalIndex = (parseInt(indices[1]) - 1) * 3;

                    this.vertices.push(
                        allVertices[vertexIndex],
                        allVertices[vertexIndex + 1],
                        allVertices[vertexIndex + 2]
                    );

                    this.normals.push(
                        allNormals[normalIndex],
                        allNormals[normalIndex + 1],
                        allNormals[normalIndex + 2]
                    );
                }
            }
        }
        this.isFullyLoaded = true;
    }
}