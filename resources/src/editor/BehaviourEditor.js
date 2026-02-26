import { EntityEditor } from "./EntityEditor.js";

require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' } });

let monacoLoaded = false;

export class BehaviourEditor extends EntityEditor {
    /**
     * @param {Behaviour} entity 
     * @param {HTMLElement} parent 
     * @param {void} reset 
     * @param {HEngine} engine 
     */
    onInspectorGUI(entity, parent, reset, engine) {
        if (!monacoLoaded) {
            monacoLoaded = true;
            require(['vs/editor/editor.main'], async () => {
                const definitions = `
                    declare class Vec3 {
                        x: number;
                        y: number;
                        z: number;
                        static add(v1: Vec3, v2: Vec3): Vec3;
                    }

                    declare class Input {
                        keyboard: Keyboard;
                        mouse: Mouse;
                        gamepad: Gamepad;
                    }

                    declare class Keyboard {
                        isPressed(code: number): boolean;
                    }

                    declare class Mouse {
                        viewportPosition: Vec3;
                        screenPosition: Vec3;
                        isDown: boolean;
                    }

                    declare class Behaviour {
                        position: Vec3;
                        rotation: Vec3;
                        scale: Vec3;
                    }
                `;

                const libUri = 'ts:filename/my-lib.d.ts';
                monaco.languages.typescript.javascriptDefaults.addExtraLib(definitions, libUri);
                monaco.editor.createModel(definitions, 'typescript', monaco.Uri.parse(libUri));

                this.onInspectorGUI(entity, parent, reset, engine);
            });
            return;
        }

        const article = document.createElement("article");
        super.displayName(entity, article, reset);
        parent.appendChild(article);
        parent.appendChild(document.createElement("br"));

        const editor = document.createElement("div");
        editor.className = "scriptEditor";

        // Création de l'instance
        const monacoEditor = monaco.editor.create(editor, {
            value: entity.code,
            language: 'javascript',
            theme: 'vs-dark',
            automaticLayout: true,
            fontSize: 13,
            autoIndent: 'none',
            guides: { indentation: true },
            minimap: { enabled: false },
            fixedOverflowWidgets: true
        });

        parent.appendChild(editor);

        const btn = document.createElement("button");
        btn.innerHTML = "Update script";

        btn.onclick = (ev) => {
            const code = monacoEditor.getValue();
            entity.code = code;
            entity.load();
        }

        parent.appendChild(btn);
    }
}