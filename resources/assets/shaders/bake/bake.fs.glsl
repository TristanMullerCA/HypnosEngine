#version 300 es
precision highp float;

in vec3 vWorldPos;
in vec3 vNormal;

uniform vec3 uLightPos[32];
uniform float uLightRadius[32];

out vec3 outColor;

void main() {
    vec3 normal = normalize(vNormal);
    float diffuse = 0.0;

    for (int i; i<32; ++i) {
        float radius = uLightRadius[i];

        if (radius > 0.0) {
            vec3 lightPos = uLightPos[i];
            vec3 lightVec = lightPos - vWorldPos;
            vec3 lightDir = normalize(lightVec);

            float NdotL = max(dot(normal, lightDir), 0.0);
            float NdotLB = max(dot(normal, lightDir) + 0.5 * 0.5, 0.0);

            float distance = length(lightVec);
            // float attenuation = 1.0 / (1.0 + radius * (distance * distance));
            float attenuation = 1.0 / (distance * distance);

            diffuse += (NdotL + NdotLB) * 0.5 * attenuation;
        }
    }

    outColor = clamp(vec3(1.0) * diffuse, 0.0, 1.0);
}