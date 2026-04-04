import { store, Store } from "openrct2-flexui";
import { InverseAction, PreSnapshot } from "./inverses";

export interface HistoryEntry {
    label: string;
    action: string;
    originalArgs: Record<string, unknown>;
    inverse: InverseAction;
    snapshot?: PreSnapshot;
}

const MAX_HISTORY = 50;

const undoStack: HistoryEntry[] = [];
const redoStack: HistoryEntry[] = [];

const revision = store(0);
function bump(): void { revision.set(revision.get() + 1); }

export function pushEntry(entry: HistoryEntry): void {
    undoStack.push(entry);
    if (undoStack.length > MAX_HISTORY) {
        undoStack.shift();
    }
    redoStack.length = 0;
    bump();
}

export function peekUndo(): HistoryEntry | undefined {
    return undoStack[undoStack.length - 1];
}

export function peekRedo(): HistoryEntry | undefined {
    return redoStack[redoStack.length - 1];
}

export function popUndo(): HistoryEntry | undefined {
    const entry = undoStack.pop();
    if (entry) {
        redoStack.push(entry);
        bump();
    }
    return entry;
}

export function popRedo(): HistoryEntry | undefined {
    const entry = redoStack.pop();
    if (entry) {
        undoStack.push(entry);
        bump();
    }
    return entry;
}

export function clearHistory(): void {
    undoStack.length = 0;
    redoStack.length = 0;
    bump();
}

export function getUndoStack(): readonly HistoryEntry[] {
    return undoStack;
}

export function getRedoStack(): readonly HistoryEntry[] {
    return redoStack;
}

export function canUndo(): boolean { return undoStack.length > 0; }
export function canRedo(): boolean { return redoStack.length > 0; }

export { revision };
