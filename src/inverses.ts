// Maps action names to functions that produce the inverse action.
// Returns null if the action can't be reversed.

export interface InverseAction {
    action: string;
    args: Record<string, unknown>;
}

export interface TileSnapshot {
    x: number;
    y: number;
    data: number[];
}

export interface ResultPosition {
    x: number;
    y: number;
    z: number;
}

export type PreSnapshot = {
    tiles?: TileSnapshot[];
    oldValues?: Record<string, unknown>;
};

type Inverter = (args: Record<string, unknown>, snap?: PreSnapshot, resultPos?: ResultPosition) => InverseAction | null;

const inverters: Record<string, Inverter> = {
    // Scenery (use result position for z since args.z can be 0 for auto-height)
    smallsceneryplace: (a, _snap, pos) => ({
        action: "smallsceneryremove",
        args: {
            x: pos?.x ?? a.x, y: pos?.y ?? a.y, z: pos?.z ?? a.z,
            object: a.object, quadrant: a.quadrant,
        },
    }),
    smallsceneryremove: (a, snap) => {
        const old = snap?.oldValues;
        if (!old) return null;
        return {
            action: "smallsceneryplace",
            args: {
                x: a.x, y: a.y, z: a.z,
                direction: old.direction ?? 0,
                object: a.object, quadrant: a.quadrant,
                primaryColour: old.primaryColour ?? 0,
                secondaryColour: old.secondaryColour ?? 0,
                tertiaryColour: old.tertiaryColour ?? 0,
            },
        };
    },

    largesceneryplace: (a, _snap, pos) => ({
        action: "largesceneryremove",
        args: {
            x: pos?.x ?? a.x, y: pos?.y ?? a.y, z: pos?.z ?? a.z,
            direction: a.direction, tileIndex: 0,
        },
    }),
    largesceneryremove: (a, snap) => {
        const old = snap?.oldValues;
        if (!old) return null;
        return {
            action: "largesceneryplace",
            args: {
                x: a.x, y: a.y, z: a.z,
                direction: a.direction,
                object: old.object ?? 0,
                primaryColour: old.primaryColour ?? 0,
                secondaryColour: old.secondaryColour ?? 0,
                tertiaryColour: old.tertiaryColour ?? 0,
            },
        };
    },

    wallplace: (a, _snap, pos) => ({
        action: "wallremove",
        args: { x: pos?.x ?? a.x, y: pos?.y ?? a.y, z: pos?.z ?? a.z, direction: a.edge },
    }),
    wallremove: (a, snap) => {
        const old = snap?.oldValues;
        if (!old) return null;
        return {
            action: "wallplace",
            args: {
                x: a.x, y: a.y, z: a.z,
                object: old.object ?? 0, edge: a.direction,
                primaryColour: old.primaryColour ?? 0,
                secondaryColour: old.secondaryColour ?? 0,
                tertiaryColour: old.tertiaryColour ?? 0,
            },
        };
    },

    bannerplace: (a, _snap, pos) => ({
        action: "bannerremove",
        args: { x: pos?.x ?? a.x, y: pos?.y ?? a.y, z: pos?.z ?? a.z, direction: a.direction },
    }),
    bannerremove: (a, snap) => {
        const old = snap?.oldValues;
        if (!old) return null;
        return {
            action: "bannerplace",
            args: {
                x: a.x, y: a.y, z: a.z, direction: a.direction,
                object: old.object ?? 0, primaryColour: old.primaryColour ?? 0,
            },
        };
    },

    footpathplace: (a, _snap, pos) => ({
        action: "footpathremove",
        args: { x: pos?.x ?? a.x, y: pos?.y ?? a.y, z: pos?.z ?? a.z },
    }),
    footpathremove: (a, snap) => {
        const old = snap?.oldValues;
        if (!old) return null;
        return {
            action: "footpathplace",
            args: {
                x: a.x, y: a.y, z: a.z,
                direction: old.direction ?? 0,
                object: old.object ?? 0,
                railingsObject: old.railingsObject ?? 0,
                slopeType: old.slopeType ?? 0,
                slopeDirection: old.slopeDirection ?? 0,
                constructFlags: 0,
            },
        };
    },
    footpathlayoutplace: (a, _snap, pos) => ({
        action: "footpathremove",
        args: { x: pos?.x ?? a.x, y: pos?.y ?? a.y, z: pos?.z ?? a.z },
    }),

    footpathadditionplace: (a, _snap, pos) => ({
        action: "footpathadditionremove",
        args: { x: pos?.x ?? a.x, y: pos?.y ?? a.y, z: pos?.z ?? a.z },
    }),
    footpathadditionremove: (a, snap) => {
        const old = snap?.oldValues;
        if (!old) return null;
        return {
            action: "footpathadditionplace",
            args: { x: a.x, y: a.y, z: a.z, object: old.object ?? 0 },
        };
    },

    trackplace: (a, _snap, pos) => ({
        action: "trackremove",
        args: {
            x: pos?.x ?? a.x, y: pos?.y ?? a.y, z: pos?.z ?? a.z,
            direction: a.direction, trackType: a.trackType, sequence: 0,
        },
    }),
    trackremove: (a, snap) => {
        const old = snap?.oldValues;
        if (!old) return null;
        return {
            action: "trackplace",
            args: {
                x: a.x, y: a.y, z: a.z,
                direction: a.direction,
                ride: old.ride ?? 0,
                trackType: a.trackType,
                rideType: old.rideType ?? 0,
                brakeSpeed: old.brakeBoosterSpeed ?? 0,
                colour: old.colour ?? 0,
                seatRotation: old.seatRotation ?? 0,
                trackPlaceFlags: 0,
                isFromTrackDesign: false,
            },
        };
    },

    parkentranceplace: (a, _snap, pos) => ({
        action: "parkentranceremove",
        args: { x: pos?.x ?? a.x, y: pos?.y ?? a.y, z: pos?.z ?? a.z },
    }),
    parkentranceremove: (a, snap) => {
        const old = snap?.oldValues;
        if (!old) return null;
        return {
            action: "parkentranceplace",
            args: {
                x: a.x, y: a.y, z: a.z,
                direction: old.direction ?? 0,
                footpathSurfaceObject: old.footpathSurfaceObject ?? 0,
            },
        };
    },

    rideentranceexitplace: (a) => ({
        action: "rideentranceexitremove",
        args: { x: a.x, y: a.y, ride: a.ride, station: a.station, isExit: a.isExit },
    }),
    rideentranceexitremove: (a, snap) => {
        const old = snap?.oldValues;
        if (!old) return null;
        return {
            action: "rideentranceexitplace",
            args: {
                x: a.x, y: a.y,
                direction: old.direction ?? 0,
                ride: a.ride, station: a.station, isExit: a.isExit,
            },
        };
    },

    // Terrain: undone by restoring tile data snapshots
    landraise: (_a, snap) => tileRestore(snap),
    landlower: (_a, snap) => tileRestore(snap),
    landsetheight: (_a, snap) => tileRestore(snap),
    landsmooth: (_a, snap) => tileRestore(snap),
    waterraise: (_a, snap) => tileRestore(snap),
    waterlower: (_a, snap) => tileRestore(snap),
    watersetheight: (_a, snap) => tileRestore(snap),
    surfacesetstyle: (_a, snap) => tileRestore(snap),
};

// Returns a "__tilerestore" pseudo-action that the executor handles directly.
function tileRestore(snap?: PreSnapshot): InverseAction | null {
    if (!snap?.tiles || snap.tiles.length === 0) return null;
    return {
        action: "__tilerestore",
        args: { tiles: snap.tiles },
    };
}

export function getInverter(action: string): Inverter | undefined {
    return inverters[action];
}

export function supportedActions(): ReadonlySet<string> {
    return new Set(Object.keys(inverters));
}
