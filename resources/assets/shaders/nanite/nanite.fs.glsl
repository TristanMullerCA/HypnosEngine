#version 300 es
precision highp float;

flat in uint v_localID;
flat in uint v_clusterID;

out vec4 fragColor;

void main() {
    fragColor = vec4(fract(float(v_clusterID) * 0.123), fract(float(v_clusterID) * 0.456), fract(float(v_clusterID) * 0.789), 1.0);
    // fragColor = vec4(1.0,1.0,1.0, 1.0);
}