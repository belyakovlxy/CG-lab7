
class Plane
{
    constructor() {
        this.vertices = []
        this.indices = []
        this.normals = []
        this.textureCoords = []

        this.texture = ""
        this.shaderProgram = ""
    }
    createPlane(height, width, h_polydons, w_polygons)
    {
        let z_init = -height / 2
        let x_init = -width / 2

        let z_step = height / h_polydons
        let x_step = width / w_polygons

        let vertices = []
        for (let i = 0; i < h_polydons; ++i)
        {
            for (let j = 0; j < w_polygons; ++j)
            {
                vertices.push(x_init + j * x_step, 0.0, z_init + i * z_step)
            }
        }

        let indices = []
        for (let i = 0; i < h_polydons - 1; ++i)
        {
            for (let j = 0; j < w_polygons - 1; ++j)
            {
                indices.push(i + j * w_polygons, i + 1 + j * w_polygons, i + (j + 1) * w_polygons)
                indices.push(i + 1 + j * w_polygons, i + (j + 1) * w_polygons, i + 1 + (j + 1) * w_polygons)
            }
        }

        let normals = []
        for (let i = 0; i < 2 * h_polydons * w_polygons; ++i)
        {
            normals.push(0.0, 1.0, 0.0)
        }

        let textureVertices = []
        for (let i = 0; i < h_polydons; ++i)
        {
            for (let j = 0; j < w_polygons; ++j)
            {
                textureVertices.push(1 - i/h_polydons, 1 - j/w_polygons)
            }
        }

        this.vertices = vertices
        this.indices = indices
        this.normals = normals
        this.textureCoords = textureVertices
    }

    initPlane(model)
    {
        this.createPlane(20, 10, 200, 100)
        let modelVertices = this.vertices;
        let modelIndices = this.indices;
        let modelTexCoords = this.textureCoords;
        let modelNormal = this.normals;

        console.log(modelVertices)

        let imgSRC = "src/textures/wood.jpg";
        let texture = gl.createTexture();
        let image = new Image();
        image.onload = function () {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.bindTexture(gl.TEXTURE_2D, null);
        }
        image.src = imgSRC;

        this.texture = texture
        //
    //  Set buffer data to attributes
    //
        this.shaderProgram = initShaderProgram(gl, vsSource, fsSource)
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
        glMatrix.mat4.translate(worldMatrixCube, worldMatrixCube, [0.0, -3.0, 4.5])
        glMatrix.mat4.scale(worldMatrixCube, worldMatrixCube, [1.0, 1.0, 1.0])

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

        let shininess = 4;

        let shininessLocation = gl.getUniformLocation(this.shaderProgram, "u_shininess");
        let ambientColorLocation = gl.getUniformLocation(this.shaderProgram, "u_sourceAmbientColor");

        gl.uniform1f(shininessLocation, shininess);
        gl.uniform3fv(ambientColorLocation, model.ambientColor);


        this.shaderProgram.samplerUniform = gl.getUniformLocation(this.shaderProgram, "u_sampler");
        gl.uniform1i(this.shaderProgram.samplerUniform, 0);

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
