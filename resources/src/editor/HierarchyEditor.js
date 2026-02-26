import { Entity } from "../core/entities/Entity.js";
import { generateEntityInspectorUi } from "./InspectorEditor.js";

export let selectedEntity;
export let selectedEntityElement;
const expandedEntities = new Map();

/**
 * @param {Entity} entity 
 * @param {HTMLElement} parentElement 
 */
export function generateHierarchyUi(entity, parentElement, engine, addChildButton, addParentButton) {
    const article = document.createElement("article");
    const childrenParent = document.createElement("div");

    const saveSceneButton = document.getElementById("saveSceneButton");
    if (saveSceneButton) saveSceneButton.disabled = !engine.scene;

    article.onclick = (e) => {
        e.stopPropagation();
        if (selectedEntityElement) selectedEntityElement.classList.remove("selected");
        article.classList.add("selected");
        selectedEntity = entity;
        selectedEntityElement = article;
        generateEntityInspectorUi(selectedEntity, engine);
        if (addChildButton) addChildButton.disabled = !selectedEntity;
        if (addParentButton) addParentButton.disabled = !selectedEntity?.parent;
    };

    const expandButton = document.createElement("button");
    function updateExpanded() {
        const expanded = expandedEntities.has(entity.UUID) ? expandedEntities.get(entity.UUID) : false;
        expandButton.innerHTML = expanded ? "▼" : "▶";

        childrenParent.innerHTML = "";

        if (expanded) {
            for (const child of entity.children) {
                generateHierarchyUi(child, childrenParent, engine, addChildButton, addParentButton);
            }
        }
    }
    expandButton.onclick = (e) => {
        e.stopPropagation();
        const expanded = expandedEntities.has(entity.UUID) ? expandedEntities.get(entity.UUID) : false;
        expandedEntities.set(entity.UUID, !expanded);
        updateExpanded();
    };
    if (entity.children.length == 0) expandButton.disabled = true;
    article.appendChild(expandButton);

    const span = document.createElement("span");
    span.innerHTML = " <strong>" + entity.constructor.name + "</strong>";
    if (entity.name) span.innerHTML += " : " + entity.name;
    article.appendChild(span);

    const deleteButton = document.createElement("button");
    deleteButton.innerHTML = "✘";
    deleteButton.onclick = (e) => {
        e.stopPropagation();

        if (entity.parent) {
            if (confirm("Delete " + entity.constructor.name + " ?")) {
                entity.remove();
                selectedEntity = null;
                selectedEntityElement = null;

                const entityEditor = document.getElementById("entityContent");
                entityEditor.innerHTML = "";
                generateHierarchyUi(engine.scene, entityEditor, engine, addChildButton, addParentButton);
                addChildButton.disabled = true;
            }
        }
    };
    deleteButton.disabled = !entity.parent;
    article.appendChild(deleteButton);

    article.appendChild(childrenParent);

    parentElement.appendChild(article);
    updateExpanded();
}