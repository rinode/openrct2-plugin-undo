import {
    button, horizontal, vertical, listview, label,
    window as flexWindow, Colour, WindowTemplate, compute,
} from "openrct2-flexui";
import {
    revision, getUndoStack, getRedoStack, canUndo, canRedo, clearHistory,
} from "./history";
import { performUndo, performRedo } from "./executor";

const undoItems = compute(revision, () => {
    const stack = getUndoStack();
    const rows: string[][] = [];
    // Show newest first
    for (let i = stack.length - 1; i >= 0; i--) {
        rows.push([String(stack.length - i), stack[i].label]);
    }
    return rows;
});

const redoItems = compute(revision, () => {
    const stack = getRedoStack();
    const rows: string[][] = [];
    for (let i = stack.length - 1; i >= 0; i--) {
        rows.push([String(stack.length - i), stack[i].label]);
    }
    return rows;
});

const undoDisabled = compute(revision, () => !canUndo());
const redoDisabled = compute(revision, () => !canRedo());

const undoLabel = compute(revision, () => {
    const stack = getUndoStack();
    if (stack.length === 0) return "Undo";
    return `Undo: ${stack[stack.length - 1].label}`;
});

const redoLabel = compute(revision, () => {
    const stack = getRedoStack();
    if (stack.length === 0) return "Redo";
    return `Redo: ${stack[stack.length - 1].label}`;
});

export function createUndoWindow(): WindowTemplate {
    return flexWindow({
        title: "Undo / Redo",
        width: 300,
        height: 350,
        padding: 5,
        colours: [Colour.Grey, Colour.Grey],
        content: [
            vertical({
                spacing: 4,
                content: [
                    horizontal({
                        spacing: 4,
                        content: [
                            button({
                                text: undoLabel,
                                height: "20px",
                                width: "1w",
                                disabled: undoDisabled,
                                onClick: () => performUndo(),
                            }),
                            button({
                                text: redoLabel,
                                height: "20px",
                                width: "1w",
                                disabled: redoDisabled,
                                onClick: () => performRedo(),
                            }),
                            button({
                                text: "Clear",
                                height: "20px",
                                width: "50px",
                                onClick: () => clearHistory(),
                            }),
                        ],
                    }),
                    label({ text: "Undo stack:" }),
                    listview({
                        height: "1w",
                        scrollbars: "vertical",
                        isStriped: true,
                        columns: [
                            { header: "#", width: "24px" },
                            { header: "Action" },
                        ],
                        items: undoItems,
                    }),
                    label({ text: "Redo stack:" }),
                    listview({
                        height: "80px",
                        scrollbars: "vertical",
                        isStriped: true,
                        columns: [
                            { header: "#", width: "24px" },
                            { header: "Action" },
                        ],
                        items: redoItems,
                    }),
                ],
            }),
        ],
    });
}
