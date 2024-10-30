import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import importPlugin from "eslint-plugin-import";

export default [
    { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
    { languageOptions: { globals: globals.browser } },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    importPlugin.flatConfigs.recommended,
    {
        ...pluginReact.configs.flat.recommended,
        settings: {
            react: {
                version: "detect",
            },
            "import/parsers": {
                "@typescript-eslint/parser": [".ts", ".tsx"],
            },
            "import/resolver": {
                typescript: {
                    alwaysTryTypes: true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`
                    project: ".",
                },
            },
        },
        rules: {
            semi: [2, "never"],
            "react-native/no-inline-styles": 0,
            "jsx-quotes": [2, "prefer-single"],
            "no-shadow": 0,
            "no-catch-shadow": 0,
            "no-mixed-spaces-and-tabs": [2, "smart-tabs"],
            // no-spaced-func breaks on typescript and already handled by prettier
            "no-spaced-func": 0,
            "react/react-in-jsx-scope": 2,
            "@typescript-eslint/no-explicit-any": "off",
            "import/order": [
                2,
                {
                    groups: [
                        ["builtin", "external"],
                        "internal",
                        ["sibling", "parent", "index"],
                        "object",
                        "type",
                    ],
                    pathGroups: [
                        {
                            pattern: "@berty/**",
                            group: "internal",
                            position: "before",
                        },
                    ],
                    // https://github.com/import-js/eslint-plugin-import/issues/2291#issuecomment-1050199872
                    pathGroupsExcludedImportTypes: [],
                    "newlines-between": "always",
                    alphabetize: {
                        order: "asc",
                        caseInsensitive: true,
                    },
                },
            ],
        },
    },
];
