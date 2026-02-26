import { RESOURCE_POOL } from "../core/DataPool.js";
import { LightmapBaker } from "../core/entities/LightmapBaker.js";
import { Renderer } from "../core/entities/Renderer.js";
import { HEngine } from "../core/HEngine.js";
import { Geometry } from "../core/resources/Geometry.js";
import { Texture } from "../core/resources/Texture.js";
import { EntityEditor } from "./EntityEditor.js";

export class RendererEditor extends EntityEditor {
    /**
     * @param {Renderer} entity 
     * @param {HTMLElement} parent 
     * @param {void} reset 
     * @param {HEngine} engine 
     */
    onInspectorGUI(entity, parent, reset, engine) {
        super.onInspectorGUI(entity, parent, reset, engine);

        if (entity.roughness) {
            let roughnessSpan = document.createElement("span");
            let roughnessLabel = document.createElement("label");
            roughnessLabel.innerHTML = "Roughness :";
            roughnessSpan.appendChild(roughnessLabel);
            let roughnessInput = document.createElement("input");
            roughnessInput.type = "range";
            roughnessInput.min = 0.01;
            roughnessInput.max = 1;
            roughnessInput.step = 0.01;
            roughnessInput.value = entity.roughness;
            roughnessInput.addEventListener("input", (e) => {
                entity.roughness = roughnessInput.valueAsNumber;
            });
            roughnessSpan.appendChild(roughnessInput);
            parent.appendChild(roughnessSpan);
        }

        if (entity.geometryUUID) {
            let span = document.createElement("span");
            let label = document.createElement("label");
            label.innerHTML = "Geometry :";
            span.appendChild(label);
            let input = document.createElement("select");
            for (const element of RESOURCE_POOL.getResourcesByType(Geometry.name)) {
                input.options.add(new Option(element.UUID));
            }
            input.value = entity.geometryUUID;
            input.onchange = () => { 
                entity.geometryUUID = input.value;
                // this.bakeLightmap(entity, engine, bakeButton);
            }
            span.appendChild(input);
            parent.appendChild(span);
        }

        // if (entity.shaderUUID) {
        //     let span = document.createElement("span");
        //     let label = document.createElement("label");
        //     label.innerHTML = "Shader :";
        //     span.appendChild(label);
        //     let input = document.createElement("select");
        //     for (const element of RESOURCE_POOL.getResourcesByType(Shader.name)) {
        //         input.options.add(new Option(element.UUID));
        //     }
        //     input.value = entity.shaderUUID;
        //     input.onchange = () => { entity.shaderUUID = input.value }
        //     span.appendChild(input);
        //     parent.appendChild(span);
        // }

        {
            let span = document.createElement("span");

            let label = document.createElement("label");
            label.innerHTML = "Texture :";
            span.appendChild(label);

            let input = document.createElement("select");
            for (const element of RESOURCE_POOL.getResourcesByType(Texture.name)) {
                input.options.add(new Option(element.UUID));
            }
            input.value = entity.textureUUID;
            input.onchange = () => { entity.textureUUID = input.value }
            span.appendChild(input);

            /*
            let div = document.createElement("div");
            div.className = "imagePicker";
            if (entity.image) {
                const canvas = document.createElement("canvas");
                canvas.width = entity.image.imageBitmap.width;
                canvas.height = entity.image.imageBitmap.height;

                const ctx = canvas.getContext("2d");
                ctx.drawImage(entity.image.imageBitmap, 0, 0);
                div.appendChild(canvas);
            } else {
                const label = document.createElement("p");
                label.innerHTML = "No image data";
                div.appendChild(label);
            }
            div.onclick = async () => {
                const image = await Image.open();
                if (image) {
                    await ImageLoader.save(image, image.UUID);
                    entity.image = image;
                    if (entity.colorMap) {
                        engine.gl.deleteTexture(entity.colorMap);
                    }
                    entity.colorMap = Texture.from(engine.gl, image.imageBitmap);
                    reset();
                }
            }
            span.appendChild(div);
            */

            parent.appendChild(span);
        }

        if (entity.static) {
            let nav = document.createElement("nav");
            const bakeButton = document.createElement("button");
            bakeButton.innerHTML = "Bake lightmap";
            bakeButton.onclick = () => {
                RendererEditor.bakeLightmap(entity, engine, bakeButton);
            }
            nav.appendChild(bakeButton);
            parent.appendChild(nav);
        }
    }

    /**
     * @param {Renderer} entity 
     * @param {HEngine} engine 
     * @param {HTMLButtonElement} bakeButton 
     */
    static bakeLightmap(entity, engine, bakeButton) {
        bakeButton.disabled = true;

        engine.extraProcesses.push(async () => {
            const geometry = RESOURCE_POOL.getResourceByType(Geometry.name, entity.geometryUUID);
            entity.bakeLightmap(engine.gl, geometry);
            // const pixels = entity.bakeLightmap(engine.gl, geometry);
            // await LightmapBaker.exportTexture(pixels, 1024, 1024, "test");

            bakeButton.disabled = false;
        });
    }
}