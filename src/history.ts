import { store } from "openrct2-flexui";
import { InverseAction, PreSnapshot } from "./inverses";

export interface HistoryEntry {
    label: string;
    action: string;
    originalArgs: Record<string, unknown>;
    inverse: InverseAction;
    snapshot?: PreSnapshot;
}

export interface BatchEntry {
    label: string;
    entries: HistoryEntry[];
}

export type StackEntry = HistoryEntry | BatchEntry;

export function isBatch(entry: StackEntry): entry is BatchEntry {
    return "entries" in entry;
}

const MAX_HISTORY = 50;

const undoStack: StackEntry[] = [];
const redoStack: StackEntry[] = [];

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

export function pushBatchEntry(batch: BatchEntry): void {
    undoStack.push(batch);
    if (undoStack.length > MAX_HISTORY) {
        undoStack.shift();
    }
    redoStack.length = 0;
    bump();
}

export function peekUndo(): StackEntry | undefined {
    return undoStack[undoStack.length - 1];
}

export function peekRedo(): StackEntry | undefined {
    return redoStack[redoStack.length - 1];
}

export function popUndo(): StackEntry | undefined {
    const entry = undoStack.pop();
    if (entry) {
        redoStack.push(entry);
        bump();
    }
    return entry;
}

export function popRedo(): StackEntry | undefined {
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

export function getUndoStack(): readonly StackEntry[] {
    return undoStack;
}

export function getRedoStack(): readonly StackEntry[] {
    return redoStack;
}

export function canUndo(): boolean { return undoStack.length > 0; }
export function canRedo(): boolean { return redoStack.length > 0; }

export { revision };
