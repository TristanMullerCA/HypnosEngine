import { AudioSource } from "../core/entities/AudioSource.js";
import { Behaviour } from "../core/entities/Behaviour.js";
import { BoxCollider } from "../core/entities/BoxCollider.js";
import { Entity } from "../core/entities/Entity.js";
import { ReflectionProbe } from "../core/entities/ReflectionProbe.js";
import { Renderer } from "../core/entities/Renderer.js";
import { SphereCollider } from "../core/entities/SphereCollider.js";
import { AudioSourceEditor } from "./AudioSourceEditor.js";
import { BehaviourEditor } from "./BehaviourEditor.js";
import { BoxColliderEditor } from "./BoxColliderEditor.js";
import { EntityEditor } from "./EntityEditor.js";
import { selectedEntity } from "./HierarchyEditor.js";
import { ReflectionProbeEditor } from "./ReflectionProbeEditor.js";
import { RendererEditor } from "./RendererEditor.js";
import { SphereColliderEditor } from "./SphereColliderEditor.js";

const inspectorContent = document.getElementById("inspectorContent");

/**
 * @param {Entity} entity 
 */
export function generateEntityInspectorUi(entity, engine) {
    clearInspector();

    if (entity instanceof Behaviour) {
        new BehaviourEditor().onInspectorGUI(entity, inspectorContent, () => {
            generateEntityInspectorUi(entity, engine);
        }, engine);
    } else {
        const article = document.createElement("article");

        const title = document.createElement("h2");
        title.innerHTML = selectedEntity.constructor.name;
        article.appendChild(title);

        let editor = new EntityEditor();

        if (entity instanceof Renderer) {
            editor = new RendererEditor();
        } else if (entity instanceof ReflectionProbe) {
            editor = new ReflectionProbeEditor();
        } else if (entity instanceof BoxCollider) {
            editor = new BoxColliderEditor();
        } else if (entity instanceof SphereCollider) {
            editor = new SphereColliderEditor();
        } else if (entity instanceof AudioSource) {
            editor = new AudioSourceEditor();
        }

        editor.onInspectorGUI(entity, article, () => {
            generateEntityInspectorUi(entity, engine);
        }, engine);

        inspectorContent.appendChild(article);
    }
}


export function clearInspector() {
    inspectorContent.innerHTML = "";
}