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
        files: ["esbuild.config.mjs"],
        rules: {
            "obsidianmd/no-nodejs-modules": "off",
        },
    },
]);
