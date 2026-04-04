import { popUndo, popRedo, canUndo, canRedo } from "./history";
import { InverseAction, TileSnapshot } from "./inverses";
import { setSuppressed } from "./listener";

function restoreTiles(tiles: TileSnapshot[]): void {
    for (const snap of tiles) {
        const tile = map.getTile(snap.x, snap.y);
        tile.data = new Uint8Array(snap.data);
    }
}

function executeInverse(inverse: InverseAction): void {
    setSuppressed(true);
    try {
        if (inverse.action === "__tilerestore") {
            restoreTiles(inverse.args.tiles as TileSnapshot[]);
        } else {
            context.executeAction(inverse.action, inverse.args as any);
        }
    } finally {
        // Delay one tick so the action.execute hook fires before we resume listening
        context.setTimeout(() => setSuppressed(false), 1);
    }
}

export function performUndo(): boolean {
    if (!canUndo()) return false;
    const entry = popUndo();
    if (!entry) return false;
    executeInverse(entry.inverse);
    return true;
}

export function performRedo(): boolean {
    if (!canRedo()) return false;
    const entry = popRedo();
    if (!entry) return false;

    setSuppressed(true);
    try {
        context.executeAction(entry.action, entry.originalArgs as any);
    } finally {
        context.setTimeout(() => setSuppressed(false), 1);
    }
    return true;
}
