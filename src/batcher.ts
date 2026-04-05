import { HistoryEntry, pushEntry, pushBatchEntry } from "./history";

/**
 * Number of ticks after the last action before a batch is flushed.
 * At ~33ms per tick, 5 ticks ≈ 165ms.
 */
let debounceTicks = 5;

let currentBatch: HistoryEntry[] = [];
let lastActionTick = -1;
let currentTick = 0;
let mouseHeld = false;

export function setDebounceTicks(ticks: number): void {
    debounceTicks = Math.max(1, ticks);
}

export function getDebounceTicks(): number {
    return debounceTicks;
}

export function initBatcher(): void {
    context.subscribe("interval.tick", () => {
        currentTick++;

        if (currentBatch.length > 0 && !mouseHeld) {
            if (currentTick - lastActionTick >= debounceTicks) {
                flushBatch();
            }
        }
    });
}

export function setMouseHeld(held: boolean): void {
    const wasHeld = mouseHeld;
    mouseHeld = held;

    // Mouse released — flush the batch immediately
    if (wasHeld && !held && currentBatch.length > 0) {
        flushBatch();
    }
}

export function addAction(entry: HistoryEntry): void {
    currentBatch.push(entry);
    lastActionTick = currentTick;
}

function flushBatch(): void {
    if (currentBatch.length === 0) return;

    if (currentBatch.length === 1) {
        pushEntry(currentBatch[0]);
    } else {
        pushBatchEntry({
            label: summarize(currentBatch),
            entries: [...currentBatch],
        });
    }
    currentBatch = [];
}

function summarize(entries: HistoryEntry[]): string {
    const counts = new Map<string, number>();
    for (const e of entries) {
        counts.set(e.label, (counts.get(e.label) ?? 0) + 1);
    }
    let best = entries[0].label;
    let bestCount = 0;
    for (const [label, count] of counts) {
        if (count > bestCount) {
            best = label;
            bestCount = count;
        }
    }
    return `${best} (x${entries.length})`;
}
