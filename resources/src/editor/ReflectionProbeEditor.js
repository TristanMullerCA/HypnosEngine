import { ReflectionProbe } from "../core/entities/ReflectionProbe.js";
import { HEngine } from "../core/HEngine.js";
import { EntityEditor } from "./EntityEditor.js";

export class ReflectionProbeEditor extends EntityEditor {
    /**
     * @param {ReflectionProbe} entity 
     * @param {HTMLElement} parent 
     * @param {void} reset 
     * @param {HEngine} engine 
     */
    onInspectorGUI(entity, parent, reset, engine) {
        super.onInspectorGUI(entity, parent, reset, engine);

        {
            let span = document.createElement("span");
            let label = document.createElement("label");
            label.innerHTML = "Bake cubemap :";
            span.appendChild(label);

            let value = document.createElement("button");
            value.innerHTML = "Bake";
            value.onclick = () => {
                entity.updateTransformations();
                entity.bake(engine.gl);
            }
            span.appendChild(value);

            parent.appendChild(span);
        }

        if (entity.cubemap) {
            let span = document.createElement("span");
            let label = document.createElement("label");
            label.innerHTML = "Export cubemap :";
            span.appendChild(label);

            let value = document.createElement("button");
            value.innerHTML = "Export";
            value.onclick = () => {
                ReflectionProbe.exportCubemap(engine.gl, entity.cubemap, entity.resolution);
            }
            span.appendChild(value);

            parent.appendChild(span);
        }
    }
}