# OpenRCT2 Plugin Boilerplate

A boilerplate for creating OpenRCT2 plugins with TypeScript, Rollup, and GitHub Actions.

## Features

- TypeScript with ES2020 target for QuickJS (OpenRCT2's JS engine)
- Rollup bundling with watch mode for development
- Automated releases via GitHub Actions
- OpenRCT2 type definitions via `@openrct2/types`

## Requirements

- [Node.js](https://nodejs.org/) v16+
- [OpenRCT2](https://openrct2.org/)

## Quick Start

1. Click "Use this template" to create your repo
2. Clone it and run `npm install`
3. Update the plugin name in `package.json`, `rollup.config.js`, and `src/index.ts`

## Development

```bash
npm run develop   # builds to plugin folder with watch mode
npm run build     # release build to ./build/
```

Set the `OPENRCT2_PLUGIN_PATH` environment variable in `rollup.config.js` to your OpenRCT2 plugin directory:

- **Windows:** `C:/Users/<YourUsername>/Documents/OpenRCT2/plugin`
- **macOS:** `~/Library/Application Support/OpenRCT2/plugin`
- **Linux:** `~/.config/OpenRCT2/plugin`

With hot-reloading enabled in OpenRCT2, changes are reflected in-game without restarting.

## Project Structure

```
src/
  index.ts    Entry point, plugin registration
```

## Releases

Releases are automated with GitHub Actions. Push a version tag to trigger a build:

```bash
git tag v1.0.0
git push origin v1.0.0
```

## License

MIT
