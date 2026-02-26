import { ReflectionProbe } from "../core/entities/ReflectionProbe.js";
import { HEngine } from "../core/HEngine.js";
import { EntityEditor } from "./EntityEditor.js";

export class BoxColliderEditor extends EntityEditor {
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
            label.innerHTML = "Size X :";
            span.appendChild(label);

            let input = document.createElement("input");
            input.type = "number";
            input.oninput = () => {
                entity.size.x = input.value;
                entity.updateTransformations();
            }
            input.value = entity.size.x;
            span.appendChild(input);

            parent.appendChild(span);
        }
        {
            let span = document.createElement("span");
            let label = document.createElement("label");
            label.innerHTML = "Size Y :";
            span.appendChild(label);

            let input = document.createElement("input");
            input.type = "number";
            input.oninput = () => {
                entity.size.y = input.value;
                entity.updateTransformations();
            }
            input.value = entity.size.y;
            span.appendChild(input);

            parent.appendChild(span);
        }
        {
            let span = document.createElement("span");
            let label = document.createElement("label");
            label.innerHTML = "Size Z :";
            span.appendChild(label);

            let input = document.createElement("input");
            input.type = "number";
            input.oninput = () => {
                entity.size.z = input.value;
                entity.updateTransformations();
            }
            input.value = entity.size.y;
            span.appendChild(input);

            parent.appendChild(span);
        }
    }
}