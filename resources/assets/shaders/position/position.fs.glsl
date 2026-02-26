#version 300 es
precision highp float;

in vec3 vPosition;
out vec4 outColor;

void main() {
    outColor = vec4(vPosition + 0.5, 1.0);
}