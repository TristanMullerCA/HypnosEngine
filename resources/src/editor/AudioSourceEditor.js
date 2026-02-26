import { RESOURCE_POOL } from "../core/DataPool.js";
import { AudioClip } from "../core/resources/AudioClip.js";
import { EntityEditor } from "./EntityEditor.js";

export class AudioSourceEditor extends EntityEditor {
    /**
     * @param {AudioSource} entity 
     * @param {HTMLElement} parent 
     * @param {void} reset 
     * @param {HEngine} engine 
     */
    onInspectorGUI(entity, parent, reset, engine) {
        super.onInspectorGUI(entity, parent, reset, engine);

        {
            let span = document.createElement("span");
            let label = document.createElement("label");
            label.innerHTML = "Audio clip :";
            span.appendChild(label);

            let input = document.createElement("select");
            for (const element of RESOURCE_POOL.getResourcesByType(AudioClip.name)) {
                input.options.add(new Option(element.UUID));
            }
            input.value = entity.audioClipUUID;
            input.onchange = () => { entity.audioClipUUID = input.value }
            span.appendChild(input);

            parent.appendChild(span);
        }

        if (entity.audioClipUUID) {
            let span = document.createElement("span");
            let label = document.createElement("label");
            label.innerHTML = "Play :";
            span.appendChild(label);

            let value = document.createElement("button");
            value.innerHTML = "Play";
            value.onclick = () => {
                entity.play();
            }
            span.appendChild(value);

            parent.appendChild(span);
        }
    }
}