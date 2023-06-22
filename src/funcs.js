
let gl = null;

function loadJSON(modelURL)
{
    let xhr = new XMLHttpRequest();
    let model = "";

    xhr.open('GET', modelURL, false);
    xhr.onload = function () {
        if (xhr.status != 200)
        {
            alert('LOAD' + xhr.status + ' : ' + xhr.statusText);
        }
        else
        {
            model = JSON.parse(xhr.responseText)
        }
    }
    xhr.send()
    return model
}

function toFloatColor(intColor)
{
    if (intColor < 0)
        return 0.0;
    else if (intColor > 255)
        return 1.0;
    else
        return  intColor / 255;
}

function getNormalMatrix(ModelMatrix)
{
    let normalMatrix = glMatrix.mat4.create();
    glMatrix.mat4.invert(normalMatrix, ModelMatrix);
    glMatrix.mat4.transpose(normalMatrix, normalMatrix);
    return normalMatrix;
}

function initWebGl(canvas)
{
    gl = canvas.getContext("webgl");

    if (!gl)
    {
        console.log("WebGL not supported")
        gl = canvas.getContext("experimental-webgl");
    }

    if (!gl)
    {
        alert("Your browser does not support WebGL");
    }

    gl.clearColor(0.2, 0.2, 0.2, 1);
    gl.enable(gl.DEPTH_TEST);
    //gl.enable(gl.CULL_FACE);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function loadShader(gl, type, source)
{
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Error! Shader compile status ", gl.getShaderInfoLog(shader));
        return;
    }
    return shader;
}

function initShaderProgram(gl, vsSource, fsSource)
{
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);

    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS))
    {
        console.error("Error! Link program", gl.getProgramInfoLog(shaderProgram));
        return;
    }

    gl.validateProgram(shaderProgram)
    if (!gl.getProgramParameter(shaderProgram, gl.VALIDATE_STATUS))
    {
        console.error("Error! validate program", gl.getProgramInfoLog(shaderProgram));
        return;
    }

    return shaderProgram;
}

function initBuffer(gl, buffer, arrType, dataType)
{
    let BufferObject = gl.createBuffer();
    gl.bindBuffer(arrType, BufferObject);
    gl.bufferData(arrType, new dataType(buffer), gl.STATIC_DRAW);
}

function enableVertexAttrib(shaderProgram, attributeName, size, stride, offset)
{
    let attribLocation = gl.getAttribLocation(shaderProgram, attributeName);
    gl.vertexAttribPointer(
        attribLocation,
        size,
        gl.FLOAT,
        false,
        stride * Float32Array.BYTES_PER_ELEMENT,
        offset * Float32Array.BYTES_PER_ELEMENT
    );

    return attribLocation;
}

function getTexture(imageURL)
{
    let img = new Image();
    img.src = imageURL;

    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    img.onload = function (e)
    {
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    }

    gl.bindTexture(gl.TEXTURE_2D, null);
    return texture;
}


function getTexture(imgSRC) {
    let texture = gl.createTexture();
    let image = new Image();
    image.onload = function () {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    }
    image.src = imgSRC;
    return texture
}