import { getInverter, supportedActions, PreSnapshot, TileSnapshot, ResultPosition } from "./inverses";
import { pushEntry } from "./history";

const pendingSnapshots = new Map<string, PreSnapshot>();

let suppressed = false;

export function setSuppressed(value: boolean): void {
    suppressed = value;
}

// GAME_COMMAND_FLAG_GHOST = (1 << 5)
const FLAG_GHOST = 32;

function isGhostAction(event: any): boolean {
    if (event.isClientOnly) return true;
    return ((event.args?.flags ?? 0) & FLAG_GHOST) !== 0;
}

function labelFor(action: string): string {
    const m = action.match(/^(.+?)(place|remove|raise|lower|setheight|smooth|setstyle|setcolour)$/);
    if (m) {
        const noun = m[1].replace(/([a-z])([A-Z])/g, "$1 $2");
        const verb = m[2];
        return `${verb.charAt(0).toUpperCase() + verb.slice(1)} ${noun}`;
    }
    return action;
}

function snapshotKey(action: string, args: Record<string, unknown>): string {
    const x = args.x ?? args.x1 ?? "";
    const y = args.y ?? args.y1 ?? "";
    const z = args.z ?? "";
    return `${action}|${x}|${y}|${z}`;
}

const terrainActions = new Set([
    "landraise", "landlower", "landsetheight", "landsmooth",
    "waterraise", "waterlower", "watersetheight", "surfacesetstyle",
]);

function tilesChanged(snapshots: TileSnapshot[]): boolean {
    for (const snap of snapshots) {
        const current = map.getTile(snap.x, snap.y).data;
        if (current.length !== snap.data.length) return true;
        for (let i = 0; i < current.length; i++) {
            if (current[i] !== snap.data[i]) return true;
        }
    }
    return false;
}

function snapshotTiles(args: Record<string, unknown>): TileSnapshot[] {
    const tiles: TileSnapshot[] = [];
    const x1 = (args.x1 ?? args.x) as number | undefined;
    const y1 = (args.y1 ?? args.y) as number | undefined;
    const x2 = (args.x2 ?? args.x) as number | undefined;
    const y2 = (args.y2 ?? args.y) as number | undefined;
    if (x1 == null || y1 == null || x2 == null || y2 == null) return tiles;

    const tx1 = Math.floor(x1 / 32);
    const ty1 = Math.floor(y1 / 32);
    const tx2 = Math.floor(x2 / 32);
    const ty2 = Math.floor(y2 / 32);

    // 1-tile margin for slope spillover
    const margin = 1;
    const mapSize = map.size.x;
    for (let tx = Math.max(0, tx1 - margin); tx <= Math.min(mapSize - 1, tx2 + margin); tx++) {
        for (let ty = Math.max(0, ty1 - margin); ty <= Math.min(mapSize - 1, ty2 + margin); ty++) {
            const tile = map.getTile(tx, ty);
            tiles.push({ x: tx, y: ty, data: Array.from(tile.data) });
        }
    }
    return tiles;
}

const removalActions = new Set([
    "smallsceneryremove", "largesceneryremove", "wallremove",
    "bannerremove", "footpathremove", "footpathadditionremove",
    "trackremove", "parkentranceremove", "rideentranceexitremove",
]);

function snapshotElement(action: string, args: Record<string, unknown>): Record<string, unknown> | undefined {
    const x = args.x as number;
    const y = args.y as number;
    const z = args.z as number;
    if (x == null || y == null) return undefined;

    const tile = map.getTile(Math.floor(x / 32), Math.floor(y / 32));

    for (const el of tile.elements) {
        if (z != null && el.baseZ !== z) continue;

        switch (action) {
            case "smallsceneryremove":
                if (el.type === "small_scenery") {
                    const se = el as SmallSceneryElement;
                    if (se.object === (args.object as number) && se.quadrant === (args.quadrant as number)) {
                        return {
                            direction: se.direction,
                            primaryColour: se.primaryColour,
                            secondaryColour: se.secondaryColour,
                            tertiaryColour: se.tertiaryColour,
                        };
                    }
                }
                break;
            case "largesceneryremove":
                if (el.type === "large_scenery") {
                    const le = el as LargeSceneryElement;
                    return {
                        object: le.object,
                        primaryColour: le.primaryColour,
                        secondaryColour: le.secondaryColour,
                        tertiaryColour: le.tertiaryColour,
                    };
                }
                break;
            case "wallremove":
                if (el.type === "wall") {
                    const we = el as WallElement;
                    if (we.direction === (args.direction as number)) {
                        return {
                            object: we.object,
                            primaryColour: we.primaryColour,
                            secondaryColour: we.secondaryColour,
                            tertiaryColour: we.tertiaryColour,
                        };
                    }
                }
                break;
            case "bannerremove":
                if (el.type === "banner") {
                    const be = el as BannerElement;
                    return { object: be.object, primaryColour: be.primaryColour };
                }
                break;
            case "footpathremove":
                if (el.type === "footpath") {
                    const fe = el as FootpathElement;
                    return {
                        object: fe.object,
                        railingsObject: fe.railingsObject,
                        slopeType: fe.slopeDirection != null ? 1 : 0,
                        slopeDirection: fe.slopeDirection ?? 0,
                    };
                }
                break;
            case "footpathadditionremove":
                if (el.type === "footpath") {
                    const fe = el as FootpathElement;
                    return { object: fe.addition ?? 0 };
                }
                break;
            case "trackremove":
                if (el.type === "track") {
                    const te = el as TrackElement;
                    return {
                        ride: te.ride,
                        rideType: te.rideType,
                        brakeBoosterSpeed: te.brakeBoosterSpeed,
                        colour: te.colourScheme,
                        seatRotation: te.seatRotation,
                    };
                }
                break;
            case "parkentranceremove":
                if (el.type === "entrance") {
                    const ee = el as EntranceElement;
                    return {
                        direction: ee.direction,
                        footpathSurfaceObject: ee.footpathSurfaceObject,
                    };
                }
                break;
            case "rideentranceexitremove":
                if (el.type === "entrance") {
                    const ee = el as EntranceElement;
                    return { direction: ee.direction };
                }
                break;
        }
    }
    return undefined;
}

// After placement, find the actual baseZ from the tile element.
// result.position.z can be wrong on slopes.
function getResultPosition(
    action: string, args: Record<string, unknown>, result: any,
): ResultPosition | undefined {
    const rx = (result?.position?.x ?? args.x) as number | undefined;
    const ry = (result?.position?.y ?? args.y) as number | undefined;
    if (rx == null || ry == null) return undefined;

    const tx = Math.floor(rx / 32);
    const ty = Math.floor(ry / 32);

    if (action === "smallsceneryplace") {
        const tile = map.getTile(tx, ty);
        const obj = args.object as number;
        const quad = args.quadrant as number;
        for (let i = tile.numElements - 1; i >= 0; i--) {
            const el = tile.getElement(i);
            if (el.type === "small_scenery") {
                const se = el as SmallSceneryElement;
                if (se.object === obj && se.quadrant === quad) {
                    return { x: rx, y: ry, z: se.baseZ };
                }
            }
        }
    }

    if (action === "wallplace") {
        const tile = map.getTile(tx, ty);
        const edge = args.edge as number;
        for (let i = tile.numElements - 1; i >= 0; i--) {
            const el = tile.getElement(i);
            if (el.type === "wall") {
                const we = el as WallElement;
                if (we.direction === edge) {
                    return { x: rx, y: ry, z: we.baseZ };
                }
            }
        }
    }

    if (action === "largesceneryplace") {
        const tile = map.getTile(tx, ty);
        const dir = args.direction as number;
        for (let i = tile.numElements - 1; i >= 0; i--) {
            const el = tile.getElement(i);
            if (el.type === "large_scenery") {
                const le = el as LargeSceneryElement;
                if (le.direction === dir) {
                    return { x: rx, y: ry, z: le.baseZ };
                }
            }
        }
    }

    if (action === "trackplace") {
        const tile = map.getTile(tx, ty);
        const dir = args.direction as number;
        const trackType = args.trackType as number;
        for (let i = tile.numElements - 1; i >= 0; i--) {
            const el = tile.getElement(i);
            if (el.type === "track") {
                const te = el as TrackElement;
                if (te.direction === dir && te.trackType === trackType) {
                    return { x: rx, y: ry, z: te.baseZ };
                }
            }
        }
    }

    if (result?.position) {
        return { x: result.position.x, y: result.position.y, z: result.position.z };
    }
    return undefined;
}

function isLocalPlayer(eventPlayer: number): boolean {
    if (network.mode === "none") return true;
    try {
        return eventPlayer === network.currentPlayer.id;
    } catch {
        return true;
    }
}

export function installListener(): void {
    const supported = supportedActions();

    context.subscribe("action.query", (event: any) => {
        if (suppressed) return;
        if (isGhostAction(event)) return;
        const action = event.action as string;
        if (!supported.has(action)) return;
        if (!isLocalPlayer(event.player)) return;

        const args = (event.args ?? {}) as Record<string, unknown>;
        const key = snapshotKey(action, args);
        const snap: PreSnapshot = {};

        if (terrainActions.has(action)) {
            snap.tiles = snapshotTiles(args);
        }
        if (removalActions.has(action)) {
            snap.oldValues = snapshotElement(action, args);
        }

        if (snap.tiles || snap.oldValues) {
            pendingSnapshots.set(key, snap);
        }
    });

    context.subscribe("action.execute", (event: any) => {
        if (suppressed) return;
        if (isGhostAction(event)) return;
        const action = event.action as string;

        if (!supported.has(action)) return;
        if (!isLocalPlayer(event.player)) return;
        if (event.result?.error) return;

        const args = (event.args ?? {}) as Record<string, unknown>;
        const key = snapshotKey(action, args);
        const snap = pendingSnapshots.get(key);
        pendingSnapshots.delete(key);

        if (snap?.tiles && !tilesChanged(snap.tiles)) {
            return;
        }

        const resultPos = getResultPosition(action, args, event.result);

        const inverter = getInverter(action);
        if (!inverter) return;

        const inverse = inverter(args, snap, resultPos);
        if (!inverse) return;

        pushEntry({
            label: labelFor(action),
            action,
            originalArgs: args,
            inverse,
            snapshot: snap,
        });
    });
}
