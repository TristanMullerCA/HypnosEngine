import { Entity } from "../core/entities/Entity.js";
import { HEngine } from "../core/HEngine.js";
import { Mathf } from "../core/math/Mathf.js";

export class EntityEditor {
    /**
     * @param {Entity} entity 
     * @param {HTMLElement} parent 
     * @param {void} reset 
     * @param {HEngine} engine 
     */
    onInspectorGUI(entity, parent, reset, engine) {
        this.displayName(entity, parent, reset);
        this.displayStatic(entity, parent, reset);
        parent.appendChild(document.createElement("br"));

        if (entity.position && !entity.static) {
            this.displayPosition(entity, parent);
            parent.appendChild(document.createElement("br"));
        }

        if (entity.rotation && !entity.static) {
            this.displayRotation(entity, parent);
            parent.appendChild(document.createElement("br"));
        }

        if (entity.scale && !entity.static) {
            this.displayScale(entity, parent);
            parent.appendChild(document.createElement("br"));
        }
    }

    displayName(entity, parent, reset) {
        const span = document.createElement("span");
        const label = document.createElement("label");
        label.innerHTML = "Name :";
        span.appendChild(label);

        const checkbox = document.createElement("input");
        checkbox.type = "text";
        checkbox.value = entity.name;
        checkbox.onchange = () => {
            entity.name = checkbox.value;
            reset();
        };
        span.appendChild(checkbox);

        parent.appendChild(span);
    }

    displayStatic(entity, parent, reset) {
        const span = document.createElement("span");
        const label = document.createElement("label");
        label.innerHTML = "Is static :";
        span.appendChild(label);

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        if (entity.static) checkbox.setAttribute("checked", "true");
        checkbox.onchange = () => {
            entity.static = checkbox.checked;
            reset();
        };
        span.appendChild(checkbox);

        parent.appendChild(span);
    }

    displayPosition(entity, parent) {
        let positionXSpan = document.createElement("span");
        let positionXLabel = document.createElement("label");
        positionXLabel.innerHTML = "Local position X :";
        positionXSpan.appendChild(positionXLabel);
        let positionXInput = document.createElement("input");
        positionXInput.id = "positionXInput";
        positionXInput.type = "number";
        positionXInput.valueAsNumber = entity.position.x;
        positionXInput.oninput = () => {
            entity.position.x = positionXInput.valueAsNumber ?? 0;
            entity.updateTransformations();
        };
        positionXSpan.appendChild(positionXInput);
        parent.appendChild(positionXSpan);

        let positionYSpan = document.createElement("span");
        let positionYLabel = document.createElement("label");
        positionYLabel.innerHTML = "Local position Y :";
        positionYSpan.appendChild(positionYLabel);
        let positionYInput = document.createElement("input");
        positionYInput.id = "positionYInput";
        positionYInput.type = "number";
        positionYInput.valueAsNumber = entity.position.y;
        positionYInput.oninput = () => {
            entity.position.y = positionYInput.valueAsNumber ?? 0;
            entity.updateTransformations();
        };
        positionYSpan.appendChild(positionYInput);
        parent.appendChild(positionYSpan);

        let positionZSpan = document.createElement("span");
        let positionZLabel = document.createElement("label");
        positionZLabel.innerHTML = "Local position Z :";
        positionZSpan.appendChild(positionZLabel);
        let positionZInput = document.createElement("input");
        positionZInput.id = "positionZInput";
        positionZInput.type = "number";
        positionZInput.valueAsNumber = entity.position.z;
        positionZInput.oninput = () => {
            entity.position.z = positionZInput.valueAsNumber ?? 0;
            entity.updateTransformations();
        };
        positionZSpan.appendChild(positionZInput);
        parent.appendChild(positionZSpan);
    }

    displayRotation(entity, parent) {
        let rotationXSpan = document.createElement("span");
        let rotationXLabel = document.createElement("label");
        rotationXLabel.innerHTML = "Local rotation X :";
        rotationXSpan.appendChild(rotationXLabel);
        let rotationXInput = document.createElement("input");
        rotationXInput.type = "number";
        rotationXInput.valueAsNumber = Mathf.Rad2Deg(entity.rotation.x);
        rotationXInput.oninput = () => {
            entity.rotation.x = Mathf.Deg2Rad(rotationXInput.valueAsNumber ?? 0);
            entity.updateTransformations();
        };
        rotationXSpan.appendChild(rotationXInput);
        parent.appendChild(rotationXSpan);

        let rotationYSpan = document.createElement("span");
        let rotationYLabel = document.createElement("label");
        rotationYLabel.innerHTML = "Local rotation Y :";
        rotationYSpan.appendChild(rotationYLabel);
        let rotationYInput = document.createElement("input");
        rotationYInput.type = "number";
        rotationYInput.valueAsNumber = Mathf.Rad2Deg(entity.rotation.y);
        rotationYInput.oninput = () => {
            entity.rotation.y = Mathf.Deg2Rad(rotationYInput.valueAsNumber ?? 0);
            entity.updateTransformations();
        };
        rotationYSpan.appendChild(rotationYInput);
        parent.appendChild(rotationYSpan);

        let rotationZSpan = document.createElement("span");
        let rotationZLabel = document.createElement("label");
        rotationZLabel.innerHTML = "Local rotation Z :";
        rotationZSpan.appendChild(rotationZLabel);
        let rotationZInput = document.createElement("input");
        rotationZInput.type = "number";
        rotationZInput.valueAsNumber = Mathf.Rad2Deg(entity.rotation.z);
        rotationZInput.oninput = () => {
            entity.rotation.z = Mathf.Deg2Rad(rotationZInput.valueAsNumber ?? 0);
            entity.updateTransformations();
        };
        rotationZSpan.appendChild(rotationZInput);
        parent.appendChild(rotationZSpan);
    }

    displayScale(entity, parent) {
        let scaleXSpan = document.createElement("span");
        let scaleXLabel = document.createElement("label");
        scaleXLabel.innerHTML = "Local scale X :";
        scaleXSpan.appendChild(scaleXLabel);
        let scaleXInput = document.createElement("input");
        scaleXInput.type = "number";
        scaleXInput.valueAsNumber = entity.scale.x;
        scaleXInput.oninput = () => {
            entity.scale.x = scaleXInput.valueAsNumber ?? 0;
            entity.updateTransformations();
        };
        scaleXSpan.appendChild(scaleXInput);
        parent.appendChild(scaleXSpan);

        let scaleYSpan = document.createElement("span");
        let scaleYLabel = document.createElement("label");
        scaleYLabel.innerHTML = "Local scale Y :";
        scaleYSpan.appendChild(scaleYLabel);
        let scaleYInput = document.createElement("input");
        scaleYInput.type = "number";
        scaleYInput.valueAsNumber = entity.scale.y;
        scaleYInput.oninput = () => {
            entity.scale.y = scaleYInput.valueAsNumber ?? 0;
            entity.updateTransformations();
        };
        scaleYSpan.appendChild(scaleYInput);
        parent.appendChild(scaleYSpan);

        let scaleZSpan = document.createElement("span");
        let scaleZLabel = document.createElement("label");
        scaleZLabel.innerHTML = "Local scale Z :";
        scaleZSpan.appendChild(scaleZLabel);
        let scaleZInput = document.createElement("input");
        scaleZInput.type = "number";
        scaleZInput.valueAsNumber = entity.scale.z;
        scaleZInput.oninput = () => {
            entity.scale.z = scaleZInput.valueAsNumber ?? 0;
            entity.updateTransformations();
        };
        scaleZSpan.appendChild(scaleZInput);
        parent.appendChild(scaleZSpan);
    }
}