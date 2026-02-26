import { Vec3 } from "../math/Vec3.js";
import { Resource } from "../Resource.js";

export class QuantizedGeometry extends Resource {
    /**
     * @param {Uint16Array} vertices 
     * @param {Uint16Array} indices 
     * @param {number[]} min 
     * @param {number[]} size 
     * @param {any} clusters 
     */
    constructor(vertices, indices, min, size, clusters) {
        super();
        this.vertices = vertices;
        this.indices = indices;
        this.min = min;
        this.size = size;
        this.clusters = clusters;
    }

    /**
     * @param {Float32Array} rawPositions 
     * @returns {QuantizedGeometry}
     */
    static quantize(rawPositions) {
        const uniquePositions = [];
        const hash = new Map();
        const indices = new Uint32Array(rawPositions.length / 3);
        let indexCount = 0;

        // 1. Indexing (Welding vertices)
        for (let i = 0; i < rawPositions.length; i += 3) {
            const x = rawPositions[i];
            const y = rawPositions[i + 1];
            const z = rawPositions[i + 2];
            const key = `${x},${y},${z}`; // Simple hash

            if (hash.has(key)) {
                indices[i / 3] = hash.get(key);
            } else {
                const newIdx = indexCount++;
                hash.set(key, newIdx);
                uniquePositions.push(x, y, z);
                indices[i / 3] = newIdx;
            }
        }

        // 2. Find Bounding Box of unique positions
        let min = [Infinity, Infinity, Infinity];
        let max = [-Infinity, -Infinity, -Infinity];
        for (let i = 0; i < uniquePositions.length; i += 3) {
            for (let j = 0; j < 3; j++) {
                min[j] = Math.min(min[j], uniquePositions[i + j]);
                max[j] = Math.max(max[j], uniquePositions[i + j]);
            }
        }

        const size = [max[0] - min[0], max[1] - min[1], max[2] - min[2]];
        const quantized = new Uint16Array(uniquePositions.length);

        // 3. Quantize unique vertices
        for (let i = 0; i < uniquePositions.length; i += 3) {
            for (let j = 0; j < 3; j++) {
                const scale = size[j] === 0 ? 0 : 65535 / size[j];
                quantized[i + j] = Math.floor((uniquePositions[i + j] - min[j]) * scale);
            }
        }

        // 4. Calculate clusters
        const clusters = QuantizedGeometry.buildClustersFromQuantized(indices, quantized, min, size);

        // Assuming maxTris = 128 (384 indices per cluster)
        const INDICES_PER_CLUSTER = 128 * 3;
        const totalClusters = clusters.length;

        // Create a buffer that is perfectly sized for every cluster
        const paddedIndices = new Uint32Array(totalClusters * INDICES_PER_CLUSTER);

        for (let i = 0; i < totalClusters; i++) {
            const cluster = clusters[i];
            const writeOffset = i * INDICES_PER_CLUSTER;

            // 1. Record the STARTING index for this cluster for your Instance Buffer
            // This is the value that goes into 'visibleOffsets'
            cluster.indexOffset = writeOffset;

            // 2. Copy the actual triangle data
            paddedIndices.set(cluster.indices, writeOffset);

            // 3. DEGENERATE PADDING:
            // If the cluster has fewer than 128 triangles, fill the rest
            // with the very last valid vertex index.
            // Use the first vertex of the first triangle as the filler
            const fillerVertex = cluster.indices[0];

            for (let j = cluster.indices.length; j < INDICES_PER_CLUSTER; j++) {
                paddedIndices[writeOffset + j] = fillerVertex;
            }
        }

        return new QuantizedGeometry(quantized, paddedIndices, min, size, clusters);
    }

    static buildClustersFromQuantized(indices, quantizedPos, meshMin, meshSize, maxTris = 128) {
        const triangleCount = indices.length / 3;
        const usedTriangles = new Uint8Array(triangleCount); // 0 = unused, 1 = used
        const clusters = [];

        // 1. Build Vertex-to-Triangle Adjacency
        const vToT = new Map();
        for (let i = 0; i < triangleCount; i++) {
            for (let j = 0; j < 3; j++) {
                const vIdx = indices[i * 3 + j];
                if (!vToT.has(vIdx)) vToT.set(vIdx, []);
                vToT.get(vIdx).push(i);
            }
        }

        // 2. The Global Loop: Keep going until 100% of triangles are assigned
        let totalAssigned = 0;
        while (totalAssigned < triangleCount) {

            // Find the first available triangle to start a new cluster
            let seedIdx = -1;
            for (let i = 0; i < triangleCount; i++) {
                if (usedTriangles[i] === 0) {
                    seedIdx = i;
                    break;
                }
            }

            if (seedIdx === -1) break; // Should never happen given the while condition

            const clusterIndices = [];
            const queue = [seedIdx];
            const queuedForThisPass = new Set([seedIdx]);

            while (queue.length > 0 && clusterIndices.length < maxTris * 3) {
                const triIdx = queue.shift();

                // Commit triangle
                clusterIndices.push(indices[triIdx * 3], indices[triIdx * 3 + 1], indices[triIdx * 3 + 2]);
                usedTriangles[triIdx] = 1;
                totalAssigned++;

                // Find neighbors
                for (let j = 0; j < 3; j++) {
                    const vIdx = indices[triIdx * 3 + j];
                    const neighbors = vToT.get(vIdx);
                    for (let n of neighbors) {
                        if (usedTriangles[n] === 0 && !queuedForThisPass.has(n)) {
                            // Check if we have room for 3 more indices
                            if (clusterIndices.length + (queue.length + 1) * 3 <= maxTris * 3) {
                                queue.push(n);
                                queuedForThisPass.add(n);
                            }
                        }
                    }
                }
            }

            clusters.push({
                indices: new Uint32Array(clusterIndices),
                sphere: this.calculateQuantizedSphere(clusterIndices, quantizedPos, meshMin, meshSize)
            });
        }

        return clusters;
    }

    static calculateQuantizedSphere(clusterIndices, quantizedPos, meshMin, meshSize) {
        let centerX = 0, centerY = 0, centerZ = 0;
        const uniqueVerts = new Set(clusterIndices);

        // Average positions for center
        uniqueVerts.forEach(vIdx => {
            centerX += quantizedPos[vIdx * 3];
            centerY += quantizedPos[vIdx * 3 + 1];
            centerZ += quantizedPos[vIdx * 3 + 2];
        });

        centerX /= uniqueVerts.size;
        centerY /= uniqueVerts.size;
        centerZ /= uniqueVerts.size;

        // Find max distance for radius
        let maxDistSq = 0;
        uniqueVerts.forEach(vIdx => {
            const dx = quantizedPos[vIdx * 3] - centerX;
            const dy = quantizedPos[vIdx * 3 + 1] - centerY;
            const dz = quantizedPos[vIdx * 3 + 2] - centerZ;
            maxDistSq = Math.max(maxDistSq, dx * dx + dy * dy + dz * dz);
        });

        // CRITICAL: Convert the sphere from Quantized units (0-65535) back to World Space
        const worldCenter = [
            meshMin[0] + (centerX / 65535) * meshSize[0],
            meshMin[1] + (centerY / 65535) * meshSize[1],
            meshMin[2] + (centerZ / 65535) * meshSize[2]
        ];

        // Scale radius (use the largest dimension of meshSize to be safe)
        const maxScale = Math.max(meshSize[0], meshSize[1], meshSize[2]) / 65535;
        const worldRadius = Math.sqrt(maxDistSq) * maxScale;

        return {
            center: new Vec3(worldCenter[0], worldCenter[1], worldCenter[2]),
            radius: worldRadius
        };
    }

    /**
     * @param {WebGL2RenderingContext} gl 
     */
    init(gl) {
        if (this.vao) return;

        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);

        const maxClusters = this.clusters.length;
        const instanceIDBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, instanceIDBuffer);

        // Initialize with an empty array to be safe
        gl.bufferData(gl.ARRAY_BUFFER, new Uint32Array(maxClusters), gl.STREAM_DRAW);

        gl.enableVertexAttribArray(0);
        gl.vertexAttribIPointer(0, 1, gl.UNSIGNED_INT, 0, 0);
        gl.vertexAttribDivisor(0, 1);
        this.instanceBuffer = instanceIDBuffer;

        // Store the full objects (texture + width/height) returned by createDataTexture
        this.vertexData = QuantizedGeometry.createDataTexture(gl, this.vertices,
            gl.RGB_INTEGER, gl.RGB16UI, gl.UNSIGNED_SHORT);

        this.indexData = QuantizedGeometry.createDataTexture(gl, this.indices,
            gl.RED_INTEGER, gl.R32UI, gl.UNSIGNED_INT);

        this.vao = vao;
    }

    static createDataTexture(gl, data, format, internalFormat, type) {
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);

        // 1. Determine how many "slots" (pixels) we need
        const componentsPerPixel = (format === gl.RGB_INTEGER) ? 3 : 1;
        const totalPixelsNeeded = Math.ceil(data.length / componentsPerPixel);

        // 2. Calculate square-ish dimensions
        const width = 384; // Stay under common GPU limits
        const height = Math.ceil(totalPixelsNeeded / width);

        // 3. IMPORTANT: The ArrayBufferView MUST be exactly width * height * components
        const requiredLength = width * height * componentsPerPixel;

        let finalData = data;
        if (data.length < requiredLength) {
            // Create a padded version so WebGL doesn't complain about "not big enough"
            finalData = new data.constructor(requiredLength);
            finalData.set(data);
        }

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        gl.texImage2D(
            gl.TEXTURE_2D, 0, internalFormat,
            width, height, 0,
            format, type, finalData
        );

        return { texture: tex, width, height };
    }
}