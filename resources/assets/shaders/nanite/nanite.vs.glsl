#version 300 es
precision highp float;
precision highp usampler2D;

layout(location = 0) in uint a_clusterOffset; // Instance attribute

uniform usampler2D u_vertexData;
uniform usampler2D u_indexData;

uniform uvec2 u_vTexSize; // {width, height} of vertex texture
uniform uvec2 u_iTexSize; // {width, height} of index texture

uniform mat4 uVPMatrix;
uniform mat4 uModelMatrix;

uniform vec3 u_meshMin;
uniform vec3 u_meshSize;

flat out uint v_localID;
flat out uint v_clusterID;

// Helper to convert 1D index to 2D texel coordinates
ivec2 getCoords(uint index, uvec2 size) {
    return ivec2(int(index % size.x), int(index / size.x));
}

void main() {
    v_localID = uint(gl_VertexID) % 3u; // 0, 1, or 2
    v_clusterID = a_clusterOffset;

    // 1. Fetch the actual vertex index for this triangle corner
    uint indexPtr = a_clusterOffset + uint(gl_VertexID);

    // Explicitly use uint for the address calculation
    uint x = indexPtr % u_iTexSize.x;
    uint y = indexPtr / u_iTexSize.x;

    // Only convert to ivec2 at the very last second for texelFetch
    ivec2 coords = ivec2(int(x), int(y));
    uint vertexIndex = texelFetch(u_indexData, coords, 0).r;

    // 2. Fetch the quantized position
    uvec3 raw = texelFetch(u_vertexData, getCoords(vertexIndex, u_vTexSize), 0).rgb;

    // 3. De-quantize
    vec3 localPos = u_meshMin + (vec3(raw) / 65535.0 * u_meshSize);
    
    gl_Position = uVPMatrix * uModelMatrix * vec4(localPos, 1.0);
}