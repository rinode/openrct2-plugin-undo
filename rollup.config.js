import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

const isRelease = process.env.BUILD === "release";
const pluginPath = process.env.OPENRCT2_PLUGIN_PATH;
const outputDir = isRelease ? "./build" : (pluginPath ?? "./build");

/** @type {import("rollup").RollupOptions} */
export default {
    input: "./src/index.ts",
    output: {
        file: outputDir + "/openrct2-plugin-undo.js",
        format: "iife",
    },
    plugins: [
        resolve(),
        typescript({ outDir: outputDir }),
    ],
};
