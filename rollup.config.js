import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

const isRelease = process.env.BUILD === "release";
const pluginPath = process.env.OPENRCT2_PLUGIN_PATH;

/** @type {import("rollup").RollupOptions} */
export default {
    input: "./src/index.ts",
    output: {
        file: isRelease
            ? "./build/openrct2-plugin-boilerplate.js"
            : (pluginPath ?? "./build") + "/openrct2-plugin-boilerplate.js",
        format: "iife",
    },
    plugins: [
        resolve(),
        typescript(),
    ],
};
