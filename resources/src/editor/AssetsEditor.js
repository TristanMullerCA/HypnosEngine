import { RESOURCE_POOL } from "../core/DataPool.js";
import { Entity } from "../core/entities/Entity.js";
import { AudioClipLoader } from "../core/io/AudioClipLoader.js";
import { FileExplorer } from "../core/io/FileExplorer.js";
import { GeometryLoader } from "../core/io/GeometryLoader.js";
import { ImageLoader } from "../core/io/ImageLoader.js";
import { ObjLoader } from "../core/io/ObjLoader.js";
import { SceneLoader } from "../core/io/SceneLoader.js";
import { TextureLoader } from "../core/io/TextureLoader.js";
import { AudioClip } from "../core/resources/AudioClip.js";
import { Geometry } from "../core/resources/Geometry.js";
import { Texture } from "../core/resources/Texture.js";
import { generateHierarchyUi } from "./HierarchyEditor.js";
import { clearInspector } from "./InspectorEditor.js";

const sceneAssets = document.getElementById("sceneAssets");
const geoAssets = document.getElementById("geoAssets");
const texAssets = document.getElementById("texAssets");
const clipAssets = document.getElementById("clipAssets");

/**
 * @param {HEngine} engine 
 */
export function initAssetEditor(engine) {
    const createSceneButton = document.getElementById("addSceneButton");
    createSceneButton.onclick = async () => {
        const name = prompt("Scene name ?", "Root");

        if (name) {
            if (name != "Index") {
                const root = new Entity(name);
                RESOURCE_POOL.addResource(root);
                SceneLoader.save(root, root.UUID);
                drawSceneEditor(root, engine);
            } else {
                alert("Please use another name");
                createSceneButton.click();
            }
        }
    };

    const addGeoButton = document.getElementById("addGeoButton");
    addGeoButton.onclick = async () => {
        const path = await FileExplorer.openFile("Open geometry files", "Mesh (*.obj)", ["obj"]);

        if (path) {
            const content = await Neutralino.filesystem.readFile(path);
            let geometry;

            if (path.endsWith(".obj")) {
                geometry = ObjLoader.parse(content);
            }

            if (geometry) {
                RESOURCE_POOL.addResource(geometry);
                await GeometryLoader.save(geometry, geometry.UUID);
                drawGeometryEditor(geometry, engine);
            }
        }
    };

    const addTexButton = document.getElementById("addTexButton");
    addTexButton.onclick = async () => {
        const bitmap = await ImageLoader.open();

        if (bitmap) {
            const texture = new Texture(bitmap);
            RESOURCE_POOL.addResource(texture);
            await TextureLoader.save(texture, texture.UUID);
            drawTextureEditor(texture, engine);
        }
    };

    const addClipButton = document.getElementById("addClipButton");
    addClipButton.onclick = async () => {
        const clip = await AudioClipLoader.open();

        if (clip) {
            RESOURCE_POOL.addResource(clip);
            await AudioClipLoader.save(clip, clip.UUID);
            drawAudioClipEditor(clip, engine);
        }
    };

    drawAssetsEditor(engine);
}

/**
 * @param {HEngine} engine 
 */
export function drawAssetsEditor(engine) {
    console.debug("Draw assets editor");

    sceneAssets.innerHTML = "";
    for (const element of RESOURCE_POOL.getResourcesByType(Entity.name)) {
        drawSceneEditor(element, engine);
    }

    geoAssets.innerHTML = "";
    for (const element of RESOURCE_POOL.getResourcesByType(Geometry.name)) {
        drawGeometryEditor(element, engine);
    }

    texAssets.innerHTML = "";
    for (const element of RESOURCE_POOL.getResourcesByType(Texture.name)) {
        drawTextureEditor(element, engine);
    }

    clipAssets.innerHTML = "";
    for (const element of RESOURCE_POOL.getResourcesByType(AudioClip.name)) {
        drawAudioClipEditor(element, engine);
    }
}

function drawSceneEditor(scene, engine) {
    const span = document.createElement("span");
    span.className = "asset";

    const label = document.createElement("label");
    label.innerHTML = scene.name;
    span.appendChild(label);

    const startbutton = document.createElement("button");
    startbutton.innerHTML = "Set first";
    startbutton.disabled = scene.name == "Index";
    startbutton.onclick = async () => {
        const scenes = RESOURCE_POOL.getResourcesByType(Entity.name);
        for (const s of scenes) {
            if (s.name == "Index") {
                s.name = scene.name;
                break;
            }
        }
        scene.name = "Index";
        SceneLoader.save(scene, scene.UUID);
        drawAssetsEditor(engine);
    };
    span.appendChild(startbutton);

    const button = document.createElement("button");
    button.innerHTML = "Open";
    button.disabled = engine.scene ? engine.scene.UUID == scene.UUID : false;
    button.onclick = async () => {
        if (engine.scene) {
            if (confirm("Save current scene ?")) {
                SceneLoader.save(engine.scene, engine.scene.UUID);
            }
        }

        await engine.load(scene);

        const entityEditor = document.getElementById("entityContent");
        entityEditor.innerHTML = "";
        generateHierarchyUi(engine.scene, entityEditor, engine, null, null);
        drawAssetsEditor(engine);
        clearInspector();
    };
    span.appendChild(button);

    sceneAssets.appendChild(span);
}

function drawGeometryEditor(geometry, engine) {
    const span = document.createElement("span");
    span.className = "asset";

    const label = document.createElement("label");
    label.innerHTML = geometry.UUID;
    span.appendChild(label);

    const button = document.createElement("button");
    button.innerHTML = "Remove";
    span.appendChild(button);

    geoAssets.appendChild(span);
}

function drawTextureEditor(texture, engine) {
    const span = document.createElement("span");
    span.className = "asset";

    const label = document.createElement("label");
    label.innerHTML = texture.UUID;
    span.appendChild(label);

    const button = document.createElement("button");
    button.innerHTML = "Remove";
    span.appendChild(button);

    texAssets.appendChild(span);
}

function drawAudioClipEditor(clip, engine) {
    const span = document.createElement("span");
    span.className = "asset";

    const label = document.createElement("label");
    label.innerHTML = clip.UUID;
    span.appendChild(label);

    const button = document.createElement("button");
    button.innerHTML = "Remove";
    span.appendChild(button);

    clipAssets.appendChild(span);
}