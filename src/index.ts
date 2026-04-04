const PLUGIN_NAME = "openrct2-plugin-boilerplate";
const PLUGIN_VERSION = "0.0.2";

function main(): void {
    if (typeof ui !== "undefined") {
        ui.registerMenuItem("My Plugin", () => {
            ui.showTextInput({
                title: "Hello",
                description: "This is a boilerplate plugin.",
                initialValue: "",
                callback: () => {},
            });
        });
    }

    console.log(`[${PLUGIN_NAME}] loaded v${PLUGIN_VERSION}`);
}

registerPlugin({
    name: PLUGIN_NAME,
    version: PLUGIN_VERSION,
    licence: "MIT",
    authors: [""],
    type: "local",
    targetApiVersion: 77,
    main,
});
