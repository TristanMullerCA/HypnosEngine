// Voici comment générer mathématiquement cette direction de 
// rayon dans ton Fragment Shader GLSL pour WebGL2.
// L'objectif est de transformer deux nombres aléatoires (compris entre 0 et 1) en un 
// vecteur 3D qui pointe dans une direction cohérente avec la surface de ton objet.
// 1. La fonction de Bruit (Noise)
// En WebGL pur, il n'y a pas de fonction random(). On utilise une fonction de hachage mathématique basée sur les coordonnées du pixel (gl_FragCoord) et le numéro de l'itération actuelle.
// 2. Échantillonnage de l'Hémisphère (Cosine Weighted)
// Au lieu de lancer des rayons dans toutes les directions (même parallèlement à la surface), on utilise un échantillonnage pondéré par le cosinus. Cela signifie qu'on lance plus de rayons vers le "haut" (la normale), là où la lumière a le plus d'impact.
// 3. Aligner le rayon avec la Normale
// Le vecteur généré ci-dessus est dans un espace local (où Z est le haut). Tu dois le faire pivoter pour qu'il soit aligné avec la normale réelle de ta surface 3D.

// Fonction de hash simple pour générer un nombre pseudo-aléatoire
float hash(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.yzx + 33.33);
    return fract((p.x + p.y) * p.z);
}

// Transformation de hashs en vecteur
vec3 getSample(float r1, float r2) {
    float phi = 2.0 * 3.14159265 * r1;
    float cosTheta = sqrt(1.0 - r2);
    float sinTheta = sqrt(r2);
    return vec3(cos(phi) * sinTheta, sin(phi) * sinTheta, cosTheta);
}

// Créer une direction basée sur la normal et deux nombres aléatoires pour le lancé de rayons.
vec3 computeGIRay(vec3 normal, vec2 pixelCoords, int frameIteration) {
    // 1. Générer deux nombres aléatoires basés sur le pixel et le temps
    float r1 = hash(vec3(pixelCoords, float(frameIteration)));
    float r2 = hash(vec3(pixelCoords, float(frameIteration) + 1.0));

    // 2. Créer une base orthogonale à partir de la normale
    vec3 up = abs(normal.z) < 0.999 ? vec3(0, 0, 1) : vec3(1, 0, 0);
    vec3 tangent = normalize(cross(up, normal));
    vec3 bitangent = cross(normal, tangent);

    // 3. Obtenir le rayon dans l'espace local
    vec3 sampleDir = getSample(r1, r2);

    // 4. Transformer vers l'espace du monde (World Space)
    return normalize(tangent * sampleDir.x + bitangent * sampleDir.y + normal * sampleDir.z);
}