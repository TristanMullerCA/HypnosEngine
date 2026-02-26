#version 300 es
precision highp float;

in vec2 vTexCoord;

uniform sampler2D uColorMap;

out vec4 outColor;

void main() {
    vec2 uv = vec2(vTexCoord.x, 1.0 - vTexCoord.y);

    // Calculating color from color map texture
    vec3 color = texture(uColorMap, uv).rgb;

    outColor = vec4(color, 1.0);
}