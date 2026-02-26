import { DrawMode, Geometry } from "../resources/Geometry.js";

const vertices = new Float16Array([
    // Face avant
    -0.5, -0.5,  0.5, // 0: Bas-Gauche
     0.5, -0.5,  0.5, // 1: Bas-Droite
     0.5,  0.5,  0.5, // 2: Haut-Droite
    -0.5,  0.5,  0.5, // 3: Haut-Gauche
    // Face arrière
    -0.5, -0.5, -0.5, // 4: Bas-Gauche
     0.5, -0.5, -0.5, // 5: Bas-Droite
     0.5,  0.5, -0.5, // 6: Haut-Droite
    -0.5,  0.5, -0.5  // 7: Haut-Gauche
]);

const indices = [
    0, 1, 1, 2, 2, 3, 3, 0, // Contour face avant
    4, 5, 5, 6, 6, 7, 7, 4, // Contour face arrière
    0, 4, 1, 5, 2, 6, 3, 7  // Liaisons entre les deux faces
];

export const Wirecube = new Geometry(vertices, [], [], indices);
Wirecube.UUID = "WIRECUBE";
Wirecube.mode = DrawMode.LINES;