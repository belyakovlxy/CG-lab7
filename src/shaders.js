//====================== FIRE  =============================

let fireVsShader = [
    'attribute vec3 a_Position;' +
    '' +
    'uniform mat4 u_mWorld;' +
    'uniform mat4 u_mView;' +
    'uniform mat4 u_mProj;' +
    'uniform vec3 u_initPosition;' +
    '' +
    'varying vec3 v_color;' +
    '' +
    'void main()' +
    '{' +
    '   gl_Position = u_mProj * u_mView * u_mWorld * vec4(a_Position, 1.0);' +
    '   float xQ = (a_Position[0] - u_initPosition[0]) * (a_Position[0] - u_initPosition[0]) / 0.7 / 0.7;' +
    '   float yQ = (a_Position[1] - u_initPosition[1]) * (a_Position[1] - u_initPosition[1]) / 1.5 / 1.5;' +
    '   float zQ = (a_Position[2] - u_initPosition[2]) * (a_Position[2] - u_initPosition[2]) / 0.7 / 0.7;' +
    '   ' +
    '   float coef = (xQ + yQ + zQ);' +
    '' +
    '   if (coef > 0.7)' +
    '   {' +
    '       v_color = vec3(1.0, 0.22, 0.0);' +
    '   }' +
    '   else if (coef > 0.5)' +
    '   {' +
    '       v_color = vec3(1.0, 0.28, 0.01);' +
    '   }' +
    '   else if (coef > 0.1)' +
    '   {' +
    '       v_color = vec3(1.0, 0.67, 0.01);' +
    '   }' +
    '   else' +
    '   {' +
    '       v_color = vec3(1.0, 1.0, 0.0);' +
    '   }' +
    '' +
    '   gl_PointSize = 7.0;' +
    '}'
]

let fireFsShader = [
    'precision mediump float;' +
    '' +
    'uniform vec3 u_Color;' +
    '' +
    'varying vec3 v_color;' +
    '' +
    'void main()' +
    '{' +
    '' +
    '   gl_FragColor = vec4(v_color, 1.0);' +
    '}'
]

let vsSource =
    [
        'precision mediump float;',
        'attribute vec3 vertPositions;',
        'attribute vec3 vertColor;',
        'attribute vec3 vertNormal;',
        'attribute vec2 vertTexCoords;',

        'varying vec3 fragColor;',
        'varying vec3 fragPosition;',
        'varying vec3 fragNormal;',
        'varying vec2 fragTexCoords;',
        '',
        'uniform mat4 mWorld;',
        'uniform mat4 mView;',
        'uniform mat4 mProj;',
        'uniform vec3 cubeColor;',
        'uniform mat4 u_normalMatrix;',
        '',
        'const vec3 centerPos = vec3(0.0, 0.0, 0.0);',
        '',
        'void main()',
        '{',
        'fragTexCoords = vertTexCoords;',
        'gl_Position = mProj * mView * mWorld * vec4(vertPositions, 1.0);',
        '',
        'vec3 N = normalize(vertNormal);',
        'fragNormal = normalize((u_normalMatrix * vec4(vertNormal,1.0)).xyz);',
        'fragColor = cubeColor;',
        'fragPosition = (mWorld * vec4(vertPositions,1.0)).xyz;',

        '}',
    ].join('\n');

let fsSource =
    [
        'precision mediump float;',
        '',
        'varying vec3 fragColor;',
        'varying vec3 fragPosition;',
        'varying vec3 fragNormal;',
        'varying vec2 fragTexCoords;',
        '',
        'uniform vec3 u_viewDirection;',
        'uniform vec3 u_sourceDirection;',
        'uniform float u_shininess;',
        '',
        'uniform vec3 u_sourceDiffuseColor;',
        'uniform vec3 u_sourceSpecularColor;',
        'uniform vec3 u_sourceAmbientColor;',

        'uniform float u_coefTex;',
        'uniform float u_coefColor;',
        'uniform bool u_blended;',

        'uniform sampler2D u_sampler;',
        '',
        '',
        'void main()',
        '{',
            'vec3 color = vec3(0.0, 0.0, 0.0);',
            'vec3 lightDir = normalize(u_sourceDirection - fragPosition);',
            'vec3 viewDir = normalize(u_viewDirection);',
            'vec3 reflectDir = normalize(reflect(-lightDir,fragNormal));',

            'float spec = pow(max(dot(viewDir,reflectDir), 0.0), u_shininess * 0.25 *u_shininess);',
            'vec3 specular = (spec * u_sourceSpecularColor);',

            'float diffuse = max(dot(fragNormal,lightDir), 0.0);' +
            '' +
            'color = specular * u_sourceSpecularColor + u_sourceAmbientColor + diffuse * u_sourceDiffuseColor;' +
            '' +
            '//gl_FragColor = vec4(color, 1.0) * vec4(fragColor, 1.0) + vec4(color, 1.0) + vec4(fragColor * diffuse * u_sourceDiffuseColor, 1.0) + vec4(u_sourceAmbientColor, 1.0) * vec4(fragColor, 1.0);\n' +
            'gl_FragColor = texture2D(u_sampler, fragTexCoords) * vec4(color, 1.0);\n' +


        '}',
    ].join('\n');

let lighterVsSource =
    [
        'precision mediump float;',
        'attribute vec3 vertPositions;',
        'attribute vec3 vertColor;',
        'attribute vec3 vertNormal;',
        'attribute vec2 vertTexCoords;',

        'varying vec3 fragColor;',
        'varying vec3 fragPosition;',
        'varying vec3 fragNormal;',
        'varying vec2 fragTexCoords;',
        '',
        'uniform mat4 mWorld;',
        'uniform mat4 mView;',
        'uniform mat4 mProj;',
        'uniform vec3 cubeColor;',
        'uniform mat4 u_normalMatrix;',
        '',
        'const vec3 centerPos = vec3(0.0, 0.0, 0.0);',
        '',
        'void main()',
        '{',
        'fragTexCoords = vertTexCoords;',
        'gl_Position = mProj * mView * mWorld * vec4(vertPositions, 1.0);',
        '',
        'vec3 N = normalize(vertNormal);',
        'fragNormal = normalize((u_normalMatrix * vec4(vertNormal,1.0)).xyz);',
        'fragColor = cubeColor;',
        'fragPosition = (mWorld*vec4(vertPositions,1.0)).xyz;',

        '}',
    ].join('\n');

let lighterFsSource =
    [
        'precision mediump float;',
        '',
        'varying vec3 fragColor;',
        'varying vec3 fragPosition;',
        'varying vec3 fragNormal;',
        'varying vec2 fragTexCoords;',
        '',
        'uniform vec3 u_viewDirection;',
        'uniform vec3 u_sourceDirection;',
        'uniform float u_shininess;',
        '',
        'uniform vec3 u_sourceDiffuseColor;',
        'uniform vec3 u_sourceSpecularColor;',
        'uniform vec3 u_sourceAmbientColor;',

        'uniform float u_coefTex;',
        'uniform float u_coefColor;',
        'uniform bool u_blended;',

        'uniform sampler2D u_sampler;',
        '',
        '',
        'void main()',
        '{',
        'vec3 color = vec3(0.0, 0.0, 0.0);',
        'vec3 lightDir = normalize(u_sourceDirection - fragPosition);',
        'vec3 viewDir = normalize(u_viewDirection);',
        'float spec = 0.0;',
        'vec3 normal = normalize(fragNormal);',
        'vec3 reflectDir = normalize(reflect(-lightDir,normal));',
        'spec = pow(max(dot(viewDir,reflectDir), 0.0), u_shininess * 0.25 *u_shininess);',
        'color = (spec * u_sourceSpecularColor);',

        'float diffuse = max(dot(normal,lightDir), 0.0);' +
        '' +
        '//gl_FragColor = vec4(color, 1.0) * vec4(fragColor, 1.0) + vec4(color, 1.0) + vec4(fragColor * diffuse * u_sourceDiffuseColor, 1.0) + vec4(u_sourceAmbientColor, 1.0) * vec4(fragColor, 1.0);\n' +
        'gl_FragColor = vec4(fragColor * diffuse * u_sourceDiffuseColor, 1.0);\n' +

        '}',
    ].join('\n');

