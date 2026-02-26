import { Geometry } from "../resources/Geometry.js";

export class ObjLoader {

    /**
     * @param {string} obj
     * @returns {Geometry}
     */
    static parse(obj) {
        if (!obj) {
            throw new Error("Object to parse is null");
        }

        var lines = obj.split('\n');

        let name = "Untitled";
        let vertices = [];
        let normals = [];
        let texcoords = [];

        let geometryVertices = [];
        let geometryNormals = [];
        let geometryTexcoords = [];
        let geometryIndices = [];

        const indexMap = new Map(); // Pour stocker les combinaisons uniques
        let currentIndex = 0;

        for (const line of lines) {
            let word = line.trim().split(/\s+/); // Utilise regex pour gérer les espaces doubles

            if (line.startsWith('o ')) {
                name = line.substring(2);
            } else if (line.startsWith('v ')) {
                vertices.push(parseFloat(word[1]), parseFloat(word[2]), parseFloat(word[3]));
            } else if (line.startsWith('vn ')) {
                normals.push(parseFloat(word[1]), parseFloat(word[2]), parseFloat(word[3]));
            } else if (line.startsWith('vt ')) {
                texcoords.push(parseFloat(word[1]), parseFloat(word[2]));
            } else if (line.startsWith('f ')) {
                // word contient : ["f", "2/4/2", "5/5/2", "8/6/2", "4/7/2", "1/8/2"]
                let faceData = word.slice(1).filter(v => v.length > 0);

                // Boucle de triangulation : transforme un polygone de N sommets en (N-2) triangles
                for (let i = 1; i < faceData.length - 1; i++) {
                    // On forme un triangle systématique : [Premier, Précédent, Actuel]
                    const triangle = [
                        faceData[0],   // Toujours le premier sommet (pivot)
                        faceData[i],   // Sommet précédent
                        faceData[i + 1]  // Sommet actuel
                    ];

                    for (const vertexString of triangle) {
                        if (indexMap.has(vertexString)) {
                            // On réutilise l'index si la combinaison v/vt/vn existe déjà
                            geometryIndices.push(indexMap.get(vertexString));
                        } else {
                            // Nouveau sommet unique détecté
                            let split = vertexString.split('/');

                            // Extraction des indices (OBJ commence à 1, donc -1)
                            const vIdx = (parseInt(split[0]) - 1);
                            const tIdx = (parseInt(split[1]) - 1);
                            const nIdx = (parseInt(split[2]) - 1);

                            // Ajout des données physiques
                            geometryVertices.push(vertices[vIdx * 3], vertices[vIdx * 3 + 1] * -1, vertices[vIdx * 3 + 2]);

                            // Sécurité pour les UVs
                            if (!isNaN(tIdx)) {
                                geometryTexcoords.push(texcoords[tIdx * 2], texcoords[tIdx * 2 + 1]);
                            } else {
                                geometryTexcoords.push(0, 0); // Fallback si pas d'UV
                            }

                            // Sécurité pour les Normales
                            if (!isNaN(nIdx)) {
                                geometryNormals.push(normals[nIdx * 3], normals[nIdx * 3 + 1], normals[nIdx * 3 + 2]);
                            } else {
                                geometryNormals.push(0, 1, 0); // Fallback (Up)
                            }

                            // Enregistrement de l'index
                            indexMap.set(vertexString, currentIndex);
                            geometryIndices.push(currentIndex);
                            currentIndex++;
                        }
                    }
                }
            }
        }

        return new Geometry(geometryVertices, geometryTexcoords, geometryNormals, geometryIndices);
    }

}