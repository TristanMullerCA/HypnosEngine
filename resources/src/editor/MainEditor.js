import { DATA_POOL } from "../core/DataPool.js";
import { AudioSource } from "../core/entities/AudioSource.js";
import { Behaviour } from "../core/entities/Behaviour.js";
import { BoxCollider } from "../core/entities/BoxCollider.js";
import { Camera } from "../core/entities/Camera.js";
import { Entity } from "../core/entities/Entity.js";
import { NaniteRenderer } from "../core/entities/NaniteRenderer.js";
import { PointLight } from "../core/entities/PointLight.js";
import { ReflectionProbe } from "../core/entities/ReflectionProbe.js";
import { Renderer } from "../core/entities/Renderer.js";
import { Rigidbody } from "../core/entities/Rigidbody.js";
import { SphereCollider } from "../core/entities/SphereCollider.js";
import { HEngine } from "../core/HEngine.js";
import { SceneLoader } from "../core/io/SceneLoader.js";
import { Cube } from "../core/primitives/Cube.js";
import { QUANTIZED_CUBE } from "../core/primitives/QuantizedCube.js";
import { initAssetEditor } from "./AssetsEditor.js";
import { buildGame } from "./buildGame.js";
import { generateHierarchyUi, selectedEntity } from "./HierarchyEditor.js";
import { clearInspector } from "./InspectorEditor.js";

/**
 * @param {HEngine} engine 
 */
export function InitializeEditor(engine) {
    const entityEditor = document.getElementById("entityContent");

    /** @type {HTMLSelectElement} */
    const addElementSelect = document.getElementById("addElementSelect");

    addElementSelect.options.add(new Option("Camera", "Camera"));
    addElementSelect.options.add(new Option("Renderer", "Renderer"));
    addElementSelect.options.add(new Option("Nanite renderer", "NaniteRenderer"));
    addElementSelect.options.add(new Option("Box collider", "BoxCollider"));
    addElementSelect.options.add(new Option("Sphere collider", "SphereCollider"));
    addElementSelect.options.add(new Option("Point light", "PointLight"));
    addElementSelect.options.add(new Option("Reflection probe", "ReflectionProbe"));
    addElementSelect.options.add(new Option("Behaviour"));
    addElementSelect.options.add(new Option("Rigidbody"));
    addElementSelect.options.add(new Option("AudioSource"));

    const addChildButton = document.getElementById("addChildButton");
    addChildButton.disabled = true;
    addChildButton.onclick = () => { addEntity(selectedEntity) };

    const addParentButton = document.getElementById("addParentButton");
    addParentButton.disabled = true;
    addParentButton.onclick = () => {
        const p = selectedEntity.parent;

        if (p) {
            p.removeChild(selectedEntity);
            const np = addEntity(p);
            np.addChild(selectedEntity);

            entityEditor.innerHTML = "";
            generateHierarchyUi(engine.scene, entityEditor, engine, addChildButton, addParentButton);
        }
    };

    function addEntity(parent) {
        let entity;

        switch (addElementSelect.value) {
            default:
                entity = new Entity();
                break;
            case "Camera": {
                const cam = new Camera(1);
                cam.resize(engine.canvas.width, engine.canvas.height);
                entity = cam;
            } break;
            case "Renderer":
                entity = new Renderer();
                entity.init(engine.gl);
                break;
            case "NaniteRenderer":
                entity = new NaniteRenderer(QUANTIZED_CUBE.UUID);
                entity.init(engine.gl);
                break;
            case "BoxCollider":
                entity = new BoxCollider();
                entity.init(engine.gl);
                break;
            case "SphereCollider":
                entity = new SphereCollider();
                entity.init(engine.gl);
                break;
            case "PointLight":
                entity = new PointLight();
                break;
            case "ReflectionProbe":
                entity = new ReflectionProbe();
                entity.init(engine.gl);
                break;
            case "Behaviour":
                entity = new Behaviour();
                entity.start();
                break;
            case "Rigidbody":
                entity = new Rigidbody();
                break;
            case "AudioSource":
                entity = new AudioSource();
                break;
        }

        DATA_POOL.addResource(entity);
        if (entity) parent.addChild(entity);
        entity.updateTransformations();

        entityEditor.innerHTML = "";
        generateHierarchyUi(engine.scene, entityEditor, engine, addChildButton, addParentButton);
        clearInspector();

        return entity;
    }

    const saveSceneButton = document.getElementById("saveSceneButton");
    saveSceneButton.disabled = !engine.scene;
    saveSceneButton.onclick = async () => {
        saveSceneButton.disabled = true;
        await SceneLoader.save(engine.scene, engine.scene.UUID);
        saveSceneButton.disabled = false;
    };

    const buildProjectButton = document.getElementById("buildProjectButton");
    buildProjectButton.onclick = async () => {
        buildProjectButton.disabled = true;
        await buildGame();
        buildProjectButton.disabled = false;
    };

    if (engine.scene) generateHierarchyUi(engine.scene, entityEditor, engine, addChildButton, addParentButton);

    initAssetEditor(engine);
}