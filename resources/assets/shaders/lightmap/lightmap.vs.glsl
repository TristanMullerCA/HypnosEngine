#version 300 es
layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec2 aTexCoord;
layout(location = 2) in vec3 aNormal;

uniform mat4 uVPMatrix;
uniform mat4 uModelMatrix;

out vec3 vPosition;
out vec2 vTexCoord;
out vec3 vNormal;

void main() {
    vPosition = (uModelMatrix * vec4(aPosition, 1.0)).rgb;
    vTexCoord = aTexCoord;
    vNormal = (vec4(aNormal, 1.0)).rgb;
    gl_Position = uVPMatrix * vec4(vPosition, 1.0);
}