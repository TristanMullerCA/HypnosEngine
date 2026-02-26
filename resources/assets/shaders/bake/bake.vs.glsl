#version 300 es
layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec2 aTexCoord;
layout(location = 2) in vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uNormalMatrix;

out vec3 vWorldPos;
out vec3 vNormal;

void main() {
    vWorldPos = vec3(uModelMatrix * vec4(aPosition, 1));
    vNormal = vec3(uNormalMatrix * vec4(aNormal, 1));

    // On transforme l'UV (0 à 1) en coordonnées WebGL (-1 à 1)
    // Cela dessine littéralement les faces du cube à plat sur le framebuffer
    gl_Position = vec4(aTexCoord * 2.0 - 1.0, 0.0, 1.0);
}