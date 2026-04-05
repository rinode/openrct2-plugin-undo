# OpenRCT2 Undo

Undo/redo plugin for OpenRCT2. Tracks player-initiated actions and lets you reverse them with Ctrl+Z / Ctrl+Y.

## Supported Actions

- Small scenery, large scenery, walls, banners (place/remove)
- Footpaths and footpath additions (place/remove)
- Track pieces (place/remove)
- Park entrances, ride entrances/exits (place/remove)
- Terrain raise/lower/smooth/set height (via tile data snapshots)
- Water raise/lower/set height
- Surface style changes

Only the local player's actions are tracked. Ghost/preview actions are ignored. History is capped at 50 entries. New actions clear the redo stack.

## Action Batching

Rapid sequences of actions are automatically grouped into a single undo/redo entry. This means dragging terrain up and down, placing a row of path tiles, or other quick repeated actions can be undone in one step instead of individually.

Batching uses a debounce window (default 5 ticks, ~165ms). Actions that occur within this window of each other are merged into a single batch.

## Shortcuts

- **Ctrl+Z** - Undo
- **Ctrl+Y** - Redo

Rebindable in OpenRCT2's keyboard settings.

## Setup

```bash
npm install
```

Set `OPENRCT2_PLUGIN_PATH` in `rollup.config.js`:

- **Windows:** `C:/Users/<YourUsername>/Documents/OpenRCT2/plugin`
- **macOS:** `~/Library/Application Support/OpenRCT2/plugin`
- **Linux:** `~/.config/OpenRCT2/plugin`

```bash
npm run develop   # watch mode, builds to plugin folder
npm run build     # release build to ./build/
```

## License

MIT
