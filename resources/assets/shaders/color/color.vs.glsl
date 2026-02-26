#version 300 es
layout(location = 0) in vec3 aPosition;

uniform mat4 uVPMatrix;
uniform mat4 uModelMatrix;

void main() {
    gl_Position = uVPMatrix * uModelMatrix * vec4(aPosition, 1.0);
}