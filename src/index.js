console.log("Script is running")

let canvas = document.getElementById("pedestal");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;



initWebGl(canvas);
console.log(gl)


sceneModel = {}

let viewMatrixCube = new Float32Array(16);
let projMatrixCube = new Float32Array(16);

glMatrix.mat4.lookAt(viewMatrixCube, [10.0, 10, 20.0], [0, 0, 0], [0, 1, 0]);
glMatrix.mat4.perspective(projMatrixCube, getRadAngle(45), canvas.width / canvas.height, 0.1, 1000.0);

sceneModel["viewMatrixCube"] = viewMatrixCube
sceneModel["projMatrixCube"] = projMatrixCube


let viewDirection = glMatrix.vec3.create();
let sourceDirection = glMatrix.vec3.create();
let sourceDiffuseColor = glMatrix.vec3.create();
let sourceSpecularColor = glMatrix.vec3.create();

glMatrix.vec3.transformMat4(viewDirection, viewDirection, viewMatrixCube);
glMatrix.vec3.set(sourceDirection,0.0,-2.0,0.0);
glMatrix.vec3.set(sourceDiffuseColor, 1.0, 1.0, 1.0);
glMatrix.vec3.set(sourceSpecularColor, 1.0, 1.0, 1.0);

sceneModel["viewDirection"] = viewDirection
sceneModel["sourceDirection"] = sourceDirection
sceneModel["sourceDiffuseColor"] = sourceDiffuseColor
sceneModel["sourceSpecularColor"] = sourceSpecularColor

let ambientColor = glMatrix.vec3.fromValues(0.1, 0.1, 0.1);
sceneModel["ambientColor"] = ambientColor


//
//=============================== FIRE ==================================================
//

function normalize(vec)
{
    let magn = Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2])
    vec[0] = vec[0] / magn;
    vec[1] = vec[1] / magn;
    vec[2] = vec[2] / magn;
}
class FireParticle
{
    constructor(initPosition) {
        this.destinationPoint = [initPosition[0], initPosition[1] + 3, initPosition[2]];

        this.x = Math.random() - 0.5 + initPosition[0];
        this.y = initPosition[1];
        this.z = Math.random() - 0.5 + initPosition[2];

        this.initPosition = initPosition;

        this.flatAngle = 2 * Math.PI * Math.random();
        this.angle = Math.PI * Math.random();

        this.vector = [-Math.cos(this.flatAngle) * Math.sin(this.angle), Math.cos(this.angle), Math.sin(this.angle) * Math.sin(this.flatAngle)]
        normalize(this.vector);
    }

    move()
    {
        let vecToDestination = [this.x - this.destinationPoint[0], this.y - this.destinationPoint[1], this.z - this.destinationPoint[2]];
        normalize(vecToDestination);


        let vecChange = [(this.vector[0] - vecToDestination[0]) / 15, (this.vector[1] - vecToDestination[1]) / 15, (this.vector[2] - vecToDestination[2]) / 15];

        this.vector[0] = this.vector[0] + vecChange[0];
        this.vector[1] = this.vector[1] + vecChange[1];
        this.vector[2] = this.vector[2] + vecChange[2];

        normalize(this.vector);

        this.x = this.x + this.vector[0] * 0.01;
        this.y = this.y + this.vector[1] * 0.01;
        this.z = this.z + this.vector[2] * 0.01;

        this.destinationPoint[0] = 2 * Math.random() - 1
        this.destinationPoint[3] = 2 * Math.random() - 1
        if (this.y > this.destinationPoint[1] + 0.1)
        {
            this.x = Math.random() - 0.5 + this.initPosition[0];
            this.y = this.initPosition[1];
            this.z = Math.random() - 0.5 + this.initPosition[2];

            this.flatAngle = 2 * Math.PI * Math.random();
            this.angle = Math.PI * Math.random();

            this.vector = [-Math.cos(this.flatAngle) * Math.sin(this.angle), Math.cos(this.angle), Math.sin(this.angle) * Math.sin(this.flatAngle)]
            normalize(this.vector);
        }
    }
}

class FireSystem
{
    constructor(particlesCount, initPosition) {
        this.particlesCount = particlesCount;

        this.speedToUpwards = 0.001;
        this.MaxY = 3.0;

        this.initPosition = initPosition;
        this.particles = []
        this.particlesCoords = []

        let p;
        for (let i = 0; i < this.particlesCount; ++i)
        {
            p = new FireParticle(this.initPosition);
            this.particles.push(p);
            this.particlesCoords.push(p.x, p.y, p.z);
        }
    }

    move()
    {
        this.particlesCoords = []
        for (let i = 0; i < this.particlesCount; ++i)
        {
            this.particles[i].move();
            this.particlesCoords.push(this.particles[i].x, this.particles[i].y, this.particles[i].z);
        }
    }

}


// ---------------------------  FIRE SHADER PROGRAM ----------------------

let fireShaderProgram = initShaderProgram(gl, fireVsShader, fireFsShader);
gl.useProgram(fireShaderProgram);

initBuffer(gl, null, gl.ARRAY_BUFFER, Float32Array);

let a_FirePosition = enableVertexAttrib(
    fireShaderProgram,
    "a_Position",
    3, 0, 0);
gl.enableVertexAttribArray(a_FirePosition);

// --------------------------- FIREWORKS UNIFORMS ------------------------------

// let worldMatrix = new Float32Array(16)
// glMatrix.mat4.identity(worldMatrix)

let worldMatrix = new Float32Array(16);
let viewMatrix = new Float32Array(16);
let projMatrix = new Float32Array(16);

glMatrix.mat4.identity(worldMatrix)

let u_mWorldFire = gl.getUniformLocation(fireShaderProgram, "u_mWorld");
let u_mViewFire = gl.getUniformLocation(fireShaderProgram, "u_mView");
let u_mProjFire = gl.getUniformLocation(fireShaderProgram, "u_mProj");

gl.uniformMatrix4fv(u_mWorldFire, false, worldMatrix);
gl.uniformMatrix4fv(u_mViewFire, false, viewMatrixCube);
gl.uniformMatrix4fv(u_mProjFire, false, projMatrixCube);

let u_initPosition = gl.getUniformLocation(fireShaderProgram, "u_initPosition");
gl.uniform3fv(u_initPosition, [0.0, 5.0, 0.0]);


//
// ---------------------------  DRAW FIRE  --------------------------------------
//

let fireSystem = new FireSystem(1000, [0.0, 2.0, 0.0]);

function drawFire()
{
    initBuffer(gl, fireSystem.particlesCoords , gl.ARRAY_BUFFER, Float32Array);

    a_FirePosition = enableVertexAttrib(
        fireShaderProgram,
        "a_Position",
        3, 0, 0);
    gl.enableVertexAttribArray(a_FirePosition);
    gl.useProgram(fireShaderProgram);

    gl.uniform3fv(u_initPosition, fireSystem.initPosition);
    fireSystem.move();
    gl.drawArrays(gl.POINTS, 0, fireSystem.particlesCount);
}



let sourceStep = 5.0

// document.addEventListener('keydown', (event) => {
//     let name = event.key;
//     if (name == "[")
//     {
//         glMatrix.vec3.set(sourceDirection, sourceDirection[0] + sourceStep, sourceDirection[1], sourceDirection[2]);
//         gl.uniform3fv(sourceDirectionLocation, sourceDirection);
//
//         console.log(sourceDirection[0], sourceDirection[1], sourceDirection[2])
//     }
//     if (name == "]")
//     {
//         glMatrix.vec3.set(sourceDirection, sourceDirection[0] - sourceStep, sourceDirection[1], sourceDirection[2]);
//         gl.uniform3fv(sourceDirectionLocation, sourceDirection);
//
//         console.log(sourceDirection[0], sourceDirection[1], sourceDirection[2])
//     }
//     if (name == ";")
//     {
//         glMatrix.vec3.set(sourceDirection, sourceDirection[0], sourceDirection[1] + sourceStep, sourceDirection[2]);
//         gl.uniform3fv(sourceDirectionLocation, sourceDirection);
//
//         console.log(sourceDirection[0], sourceDirection[1], sourceDirection[2])
//     }
//     if (name == "'")
//     {
//         glMatrix.vec3.set(sourceDirection, sourceDirection[0], sourceDirection[1] - sourceStep, sourceDirection[2]);
//         gl.uniform3fv(sourceDirectionLocation, sourceDirection);
//
//         console.log(sourceDirection[0], sourceDirection[1], sourceDirection[2])
//     }
//     if (name == ".")
//     {
//         glMatrix.vec3.set(sourceDirection, sourceDirection[0], sourceDirection[1], sourceDirection[2] + sourceStep);
//         gl.uniform3fv(sourceDirectionLocation, sourceDirection);
//
//         console.log(sourceDirection[0], sourceDirection[1], sourceDirection[2])
//     }
//     if (name == "/")
//     {
//         glMatrix.vec3.set(sourceDirection, sourceDirection[0], sourceDirection[1], sourceDirection[2] - sourceStep);
//         gl.uniform3fv(sourceDirectionLocation, sourceDirection);
//
//         console.log(sourceDirection[0], sourceDirection[1], sourceDirection[2])
//     }
// }, false);

let plane = new Plane()
plane.initPlane(sceneModel)
//
let lighter = new Lighter()
lighter.initPlane(sceneModel)


let loop = () =>

{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //drawFire()
    plane.draw()
    //lighter.draw()
    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
