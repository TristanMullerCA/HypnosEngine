import { Geometry } from "../resources/Geometry.js";

// Les 8 coins du cube (x, y, z)
const cubeVertices = new Float32Array([
    // Devant (Face 0) - Indices 0,1,2,3
    -0.5,-0.5, 0.5,   0.5,-0.5, 0.5,   0.5, 0.5, 0.5,  -0.5, 0.5, 0.5,
    // Derrière (Face 1) - Indices 4,5,6,7
    -0.5,-0.5,-0.5,  -0.5, 0.5,-0.5,   0.5, 0.5,-0.5,   0.5,-0.5,-0.5,
    // Haut (Face 2) - Indices 8,9,10,11
    -0.5, 0.5,-0.5,  -0.5, 0.5, 0.5,   0.5, 0.5, 0.5,   0.5, 0.5,-0.5,
    // Bas (Face 3) - Indices 12,13,14,15
    -0.5,-0.5,-0.5,   0.5,-0.5,-0.5,   0.5,-0.5, 0.5,  -0.5,-0.5, 0.5,
    // Droite (Face 4) - Indices 16,17,18,19
     0.5,-0.5,-0.5,   0.5, 0.5,-0.5,   0.5, 0.5, 0.5,   0.5,-0.5, 0.5,
    // Gauche (Face 5) - Indices 20,21,22,23
    -0.5,-0.5,-0.5,  -0.5,-0.5, 0.5,  -0.5, 0.5, 0.5,  -0.5, 0.5,-0.5
]);

// Complexe mapping with different part per face
const cubeUVs = new Float32Array([
    // Devant (0.0 à 0.33 x)
    0.0, 0.0, 0.33, 0.0, 0.33, 0.5, 0.0, 0.5,
    // Derrière (0.33 à 0.66 x)
    0.33, 0.0, 0.33, 0.5, 0.66, 0.5, 0.66, 0.0,
    // Haut (0.66 à 1.0 x)
    0.66, 0.0, 0.66, 0.5, 1.0, 0.5, 1.0, 0.0,
    // Bas (0.0 à 0.33 x, ligne du bas)
    0.0, 0.5, 0.33, 0.5, 0.33, 1.0, 0.0, 1.0,
    // Droite (0.33 à 0.66 x, ligne du bas)
    0.33, 0.5, 0.33, 1.0, 0.66, 1.0, 0.66, 0.5,
    // Gauche (0.66 à 1.0 x, ligne du bas)
    0.66, 0.5, 0.66, 1.0, 1.0, 1.0, 1.0, 0.5
]);

// the entire image appear on every single face
// const cubeUVs = new Float32Array([
//     // Front
//     0.0, 0.0,  1.0, 0.0,  1.0, 1.0,  0.0, 1.0,
//     // Back
//     0.0, 0.0,  1.0, 0.0,  1.0, 1.0,  0.0, 1.0,
//     // Top
//     0.0, 0.0,  1.0, 0.0,  1.0, 1.0,  0.0, 1.0,
//     // Bottom
//     0.0, 0.0,  1.0, 0.0,  1.0, 1.0,  0.0, 1.0,
//     // Right
//     0.0, 0.0,  1.0, 0.0,  1.0, 1.0,  0.0, 1.0,
//     // Left
//     0.0, 0.0,  1.0, 0.0,  1.0, 1.0,  0.0, 1.0
// ]);

const cubeNormals = new Float32Array([
    // Devant (Z+)
    0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
    // Derrière (Z-)
    0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
    // Haut (Y+)
    0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
    // Bas (Y-)
    0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
    // Droite (X+)
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
    // Gauche (X-)
    -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0
]);

// L'ordre pour dessiner les 12 triangles (2 par face)
const cubeIndices = new Int32Array([
    0, 2, 1,      0, 3, 2,    // Devant
    4, 6, 5,      4, 7, 6,    // Derrière
    8, 10, 9,     8, 11, 10,  // Haut
    12, 14, 13,   12, 15, 14, // Bas
    16, 18, 17,   16, 19, 18, // Droite
    20, 22, 21,   20, 23, 22  // Gauche
]);

export const Cube = new Geometry(cubeVertices, cubeUVs, cubeNormals, cubeIndices);
Cube.UUID = "CUBE";