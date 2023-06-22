class Lighter
{
    constructor() {
        this.vertices = []
        this.indices = []
        this.normals = []
        this.textureCoords = []

        this.shaderProgram = ""
    }

    initPlane(model)
    {

        let modelInfo = loadJSON('src/models/zippo_lighter.json')

        let modelVertices = modelInfo.meshes[0].vertices;
        let modelIndices = [].concat.apply([], modelInfo.meshes[0].faces);
        let modelTexCoords = modelInfo.meshes[0].texturecoords[0];
        let modelNormal = modelInfo.meshes[0].normals;

        this.vertices = modelVertices
        this.indices = modelIndices
        this.normals = modelTexCoords
        this.textureCoords = modelNormal

        //
        //  Set buffer data to attributes
        //
        this.shaderProgram = initShaderProgram(gl, lighterVsSource, lighterFsSource)
        gl.useProgram(this.shaderProgram)

        initBuffer(gl, modelVertices, gl.ARRAY_BUFFER, Float32Array);
        initBuffer(gl, modelIndices, gl.ELEMENT_ARRAY_BUFFER, Uint16Array);

        let positionAttribLocationCube = enableVertexAttrib(
            this.shaderProgram,
            "vertPositions",
            3, 3, 0);
        gl.enableVertexAttribArray(positionAttribLocationCube);


        initBuffer(gl, modelNormal, gl.ARRAY_BUFFER, Float32Array);

        let normalAttribLocationCube = enableVertexAttrib(
            this.shaderProgram,
            "vertNormal",
            3, 3, 0);
        gl.enableVertexAttribArray(normalAttribLocationCube);

        initBuffer(gl, modelTexCoords, gl.ARRAY_BUFFER, Float32Array);

        let textureAttribLocationCube = enableVertexAttrib(
            this.shaderProgram,
            "vertTexCoords",
            2, 2, 0);
        gl.enableVertexAttribArray(textureAttribLocationCube);


        //--------------------------WORLD--VIEW--PROJECTION--MATRIСES-------------------------------

        let normalMatrix;
        let worldMatrixCube = new Float32Array(16);

        glMatrix.mat4.identity(worldMatrixCube)
        glMatrix.mat4.translate(worldMatrixCube, worldMatrixCube, [0.0, -2.5, 0.0])
        glMatrix.mat4.scale(worldMatrixCube, worldMatrixCube, [2.0, 2.0, 2.0])
        normalMatrix = getNormalMatrix(worldMatrixCube);

        let matWorldLocationCube = gl.getUniformLocation(this.shaderProgram, "mWorld");
        let normalmatrixLocation = gl.getUniformLocation(this.shaderProgram, "u_normalMatrix");
        let matViewLocationCube = gl.getUniformLocation(this.shaderProgram, "mView");
        let matProjLocationCube = gl.getUniformLocation(this.shaderProgram, "mProj");

        gl.uniformMatrix4fv(matWorldLocationCube, false, worldMatrixCube);
        gl.uniformMatrix4fv(matViewLocationCube, false, model.viewMatrixCube);
        gl.uniformMatrix4fv(matProjLocationCube, false, model.projMatrixCube);
        gl.uniformMatrix4fv(normalmatrixLocation, false, normalMatrix);

        //---------------------------SOURCE--SETTINGS-----------------------------------------------

        let viewDirectionLocation = gl.getUniformLocation(this.shaderProgram, "u_viewDirection");
        let sourceDirectionLocation = gl.getUniformLocation(this.shaderProgram, "u_sourceDirection");
        let sourceDiffuseColorLocation = gl.getUniformLocation(this.shaderProgram, "u_sourceDiffuseColor");
        let sourceSpecularColorLocation = gl.getUniformLocation(this.shaderProgram, "u_sourceSpecularColor");

        gl.uniform3fv(viewDirectionLocation, model.viewDirection);
        gl.uniform3fv(sourceDirectionLocation, model.sourceDirection);
        gl.uniform3fv(sourceDiffuseColorLocation, model.sourceDiffuseColor);
        gl.uniform3fv(sourceSpecularColorLocation, model.sourceSpecularColor);

        //---------------------------COLOR--SETTINGS------------------------------------------------

        let shininess = 9;

        let cubeColorLocation = gl.getUniformLocation(this.shaderProgram, "cubeColor");
        gl.uniform3fv(cubeColorLocation,  [0.6, 0.6, 0.6]);

        let shininessLocation = gl.getUniformLocation(this.shaderProgram, "u_shininess");
        let ambientColorLocation = gl.getUniformLocation(this.shaderProgram, "u_sourceAmbientColor");

        gl.uniform1f(shininessLocation, shininess);
        gl.uniform3fv(ambientColorLocation, model.ambientColor);

    }

    draw()
    {
        initBuffer(gl, this.vertices, gl.ARRAY_BUFFER, Float32Array);
        initBuffer(gl, this.indices, gl.ELEMENT_ARRAY_BUFFER, Uint16Array);

        let positionAttribLocationCube = enableVertexAttrib(
            this.shaderProgram,
            "vertPositions",
            3, 3, 0);
        gl.enableVertexAttribArray(positionAttribLocationCube);


        initBuffer(gl, this.normals, gl.ARRAY_BUFFER, Float32Array);

        let normalAttribLocationCube = enableVertexAttrib(
            this.shaderProgram,
            "vertNormal",
            3, 3, 0);
        gl.enableVertexAttribArray(normalAttribLocationCube);

        initBuffer(gl, this.textureCoords, gl.ARRAY_BUFFER, Float32Array);

        let textureAttribLocationCube = enableVertexAttrib(
            this.shaderProgram,
            "vertTexCoords",
            2, 2, 0);
        gl.enableVertexAttribArray(textureAttribLocationCube);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.useProgram(this.shaderProgram)
        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
    }
}
