import { RESOURCE_POOL } from "./DataPool.js";
import { Entity } from "./entities/Entity.js";
import { HEngine } from "./HEngine.js";
import { AudioClipLoader } from "./io/AudioClipLoader.js";
import { GeometryLoader } from "./io/GeometryLoader.js";
import { Icon } from "./io/Icon.js";
import { SceneLoader } from "./io/SceneLoader.js";
import { TextureLoader } from "./io/TextureLoader.js";
import { Cube } from "./primitives/Cube.js";
import { loadBunny, QUANTIZED_CUBE } from "./primitives/QuantizedCube.js";
import { Wirecube } from "./primitives/Wirecube.js";
import { WireSphere } from "./primitives/WireSphere.js";
import { IncludedShaders } from "./resources/IncludedShaders.js";

const isNeutralino = typeof NL_MODE !== 'undefined';

export function start() {
    async function init() {
        // Configuring window
        const canvas = document.getElementById("hypnos");
        const engine = new HEngine(canvas);

        window.addEventListener("resize", (ev) => {
            engine.resize();
        });

        // Configuring assets folder
        if (isNeutralino) {
            try {
                await Neutralino.filesystem.createDirectory(NL_PATH + '/assets');
            } catch (error) {
                console.warn(error.message);
            }
        }

        // Add default assets
        await IncludedShaders.load();
        RESOURCE_POOL.addResource(IncludedShaders.unlight);
        RESOURCE_POOL.addResource(IncludedShaders.bake);
        RESOURCE_POOL.addResource(IncludedShaders.lightmap);
        RESOURCE_POOL.addResource(IncludedShaders.color);
        RESOURCE_POOL.addResource(IncludedShaders.nanite);

        RESOURCE_POOL.addResource(Cube);
        await loadBunny();
        RESOURCE_POOL.addResource(QUANTIZED_CUBE);
        RESOURCE_POOL.addResource(Wirecube);
        RESOURCE_POOL.addResource(WireSphere);

        // Add saved assets
        const files = await Neutralino.filesystem.readDirectory(NL_PATH + "/assets/");

        for (const file of files) {
            if (file.entry.endsWith(".scene")) {
                const scene = await SceneLoader.load(file.entry.substring(file.entry.length - 6, file.entry));
                RESOURCE_POOL.addResource(scene);
                console.log(`Adding scene asset '${file.entry}' to pool`);
            } else if (file.entry.endsWith(".geo")) {
                const geometry = await GeometryLoader.load(file.entry.substring(file.entry.length - 4, file.entry));
                RESOURCE_POOL.addResource(geometry);
                console.log(`Adding geometry asset '${file.entry}' to pool`);
            } else if (file.entry.endsWith(".map")) {
                const texture = await TextureLoader.load(file.entry.substring(file.entry.length - 4, file.entry));
                RESOURCE_POOL.addResource(texture);
                console.log(`Adding texture asset '${file.entry}' to pool`);
            } else if (file.entry.endsWith(".clip")) {
                const clip = await AudioClipLoader.load(file.entry.substring(file.entry.length - 5, file.entry));
                RESOURCE_POOL.addResource(clip);
                console.log(`Adding audio clip asset '${file.entry}' to pool`);
            } else {
                console.warn(`Asset file not recognized ${file.entry}`)
            }
        }

        // Load default scene
        const scenes = RESOURCE_POOL.getResourcesByType(Entity.name);
        if (scenes.length > 0) {
            let indexScene = scenes[0];

            for (const scene of scenes) {
                if (scene.name == "Index") {
                    indexScene = scene;
                    break;
                }
            }

            await engine.load(indexScene);
        }

        // Load project mode (editor or game)
        try {
            const configFile = await Neutralino.resources.readFile('/resources/config.json');

            if (configFile) {
                const config = JSON.parse(configFile);

                if (config.isEditor) {
                    import("./../editor/Editor.js")
                        .then((module) => {
                            module.InitializeEditor(engine);
                        })
                        .catch((reason) => {
                            console.error(reason);
                        });

                    Icon.convertPngToIco("/resources/assets/icons/appIcon.png", NL_PATH + "/favicon.ico");
                } else {
                    const entityEditor = document.getElementById("entityEditor");
                    if (entityEditor) entityEditor.remove();
                    const mainInspector = document.getElementById("mainInspector");
                    if (mainInspector) mainInspector.remove();
                }
            }
        } catch (error) {
            console.warn("config.json not found");
        }

        // Start rendering loop
        startRenderingLoop(engine);
    }

    /**
     * @param {HEngine} engine 
     */
    function startRenderingLoop(engine) {
        const fpsSpan = document.getElementById("fps");
        let fps = 0;
        let lastTime = 0;

        function loop(timestamp) {
            if ((timestamp - lastTime) > 1000) {
                fpsSpan.innerHTML = "FPS : " + fps;
                lastTime = timestamp;
                fps = 0;
            } else {
                fps += 1;
            }

            engine.render();

            window.requestAnimationFrame(loop);
        }

        loop();
    }

    init();
}