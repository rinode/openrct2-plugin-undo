import { popUndo, popRedo, canUndo, canRedo, isBatch, StackEntry } from "./history";
import { InverseAction, TileSnapshot } from "./inverses";
import { setSuppressed } from "./listener";

function restoreTiles(tiles: TileSnapshot[]): void {
    for (const snap of tiles) {
        const tile = map.getTile(snap.x, snap.y);
        tile.data = new Uint8Array(snap.data);
    }
}

function executeSingleInverse(inverse: InverseAction): void {
    if (inverse.action === "__tilerestore") {
        restoreTiles(inverse.args.tiles as TileSnapshot[]);
    } else {
        context.executeAction(inverse.action, inverse.args as any);
    }
}

function executeInverse(entry: StackEntry): void {
    setSuppressed(true);
    try {
        if (isBatch(entry)) {
            // Undo in reverse order
            for (let i = entry.entries.length - 1; i >= 0; i--) {
                executeSingleInverse(entry.entries[i].inverse);
            }
        } else {
            executeSingleInverse(entry.inverse);
        }
    } finally {
        context.setTimeout(() => setSuppressed(false), 1);
    }
}

function executeRedo(entry: StackEntry): void {
    setSuppressed(true);
    try {
        if (isBatch(entry)) {
            // Redo in forward order
            for (const e of entry.entries) {
                context.executeAction(e.action, e.originalArgs as any);
            }
        } else {
            context.executeAction(entry.action, entry.originalArgs as any);
        }
    } finally {
        context.setTimeout(() => setSuppressed(false), 1);
    }
}

export function performUndo(): boolean {
    if (!canUndo()) return false;
    const entry = popUndo();
    if (!entry) return false;
    executeInverse(entry);
    return true;
}

export function performRedo(): boolean {
    if (!canRedo()) return false;
    const entry = popRedo();
    if (!entry) return false;
    executeRedo(entry);
    return true;
}
