#version 300 es
precision highp float;

in vec3 vPosition;
in vec2 vTexCoord;
in vec3 vNormal;

uniform sampler2D uLightmap;
uniform sampler2D uColorMap;
uniform samplerCube uCubeMap;

uniform vec3 uViewPos;
uniform int uUseReflection;
uniform float uRoughness;

out vec4 outColor;

void main() {
    vec3 viewDir = normalize(uViewPos - vPosition);
    vec3 normal = -normalize(vNormal);
    vec2 uv = vec2(vTexCoord.x, 1.0 - vTexCoord.y);

    // Calculating lightning from lightmap
    vec3 lightmap = texture(uLightmap, uv).rgb;

    // Calculating reflections from cubemap
    vec3 refl = reflect(-viewDir, normal);
    float NdotV = max(dot(normal, viewDir), 0.0);
    float bias = 1.0;
    float fresnel = bias + (1.0 - bias) * pow(1.0 - NdotV, 3.0);
    vec3 reflection = textureLod(uCubeMap, refl, uRoughness).rgb;

    // Calculating color from color map texture
    vec3 color = texture(uColorMap, uv).rgb;
    
    // Apply with and without reflections color
    if (uUseReflection == 1) {
        outColor = vec4(lightmap * color + (reflection * color * 0.75) + reflection * 0.25, 1.0);
    } else {
        outColor = vec4(lightmap * color, 1.0);
    }
}