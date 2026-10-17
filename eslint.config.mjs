import { defineConfig } from "eslint/config";
import obsidianmd from "eslint-plugin-obsidianmd";

export default defineConfig([
    ...obsidianmd.configs.recommended,
    {
        ignores: ["main.js"],
    },
    {
        languageOptions: {
            parserOptions: {
                projectService: {
                    allowDefaultProject: [
                        "eslint.config.*",
                        "esbuild.config.mjs",
                    ],
                },
            },
        },
        rules: {
            "obsidianmd/ui/sentence-case": [
                "warn",
                {
                    brands: ["Grimmory"],
                },
            ],
        },
    },
    {
        files: ["**/*.ts"],
        rules: {
            "@typescript-eslint/consistent-type-imports": "error",
        },
    },
    {
        files: ["esbuild.config.mjs"],
        rules: {
            // Build script: runs in Node at build time, never inside Obsidian.
            "obsidianmd/no-nodejs-modules": "off",
        },
    },
    {
        files: ["test/**/*.ts"],
        rules: {
            // Tests run in Node via `node --test` and are never bundled into the plugin.
            "obsidianmd/no-nodejs-modules": "off",
            "@typescript-eslint/no-floating-promises": [
                "error",
                {
                    allowForKnownSafeCalls: [
                        { from: "package", name: "test", package: "node:test" },
                    ],
                },
            ],
        },
    },
]);
