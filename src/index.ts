import { installListener } from "./listener";
import { performUndo, performRedo } from "./executor";
import { createUndoWindow } from "./ui";

const PLUGIN_NAME = "openrct2-plugin-undo";
const PLUGIN_VERSION = "0.1.0";

function main(): void {
    installListener();

    if (typeof ui !== "undefined") {
        ui.registerMenuItem("Undo / Redo", () => {
            createUndoWindow().open();
        });

        ui.registerShortcut({
            id: "openrct2-plugin-undo.undo",
            text: "Undo last action",
            bindings: ["CTRL+Z"],
            callback: () => performUndo(),
        });

        ui.registerShortcut({
            id: "openrct2-plugin-undo.redo",
            text: "Redo last undone action",
            bindings: ["CTRL+Y"],
            callback: () => performRedo(),
        });
    }

    console.log(`[${PLUGIN_NAME}] loaded v${PLUGIN_VERSION}`);
}

registerPlugin({
    name: PLUGIN_NAME,
    version: PLUGIN_VERSION,
    licence: "MIT",
    authors: ["rinode"],
    type: "local",
    targetApiVersion: 77,
    main,
});
