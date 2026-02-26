import { ReflectionProbe } from "../core/entities/ReflectionProbe.js";
import { HEngine } from "../core/HEngine.js";
import { EntityEditor } from "./EntityEditor.js";

export class SphereColliderEditor extends EntityEditor {
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
            label.innerHTML = "Radius :";
            span.appendChild(label);

            let input = document.createElement("input");
            input.type = "number";
            input.oninput = () => {
                entity.radius = input.value;
                entity.updateTransformations();
            }
            input.value = entity.radius;
            span.appendChild(input);

            parent.appendChild(span);
        }
    }
}