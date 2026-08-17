import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  {
    ignores: [
      "dist/",
      "node_modules/",
      "backend/node_modules/",
    ],
  },

  js.configs.recommended,

  {
    files: ["**/*.{js,jsx}"],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },

      globals: {
  ...globals.browser,
  ...globals.node,
  chrome: "readonly",
},
    },

    plugins: {
      react: pluginReact,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },

    settings: {
      react: {
        version: "detect",
      },
    },

    rules: {
      ...pluginReact.configs.recommended.rules,

      ...reactHooks.configs.flat.recommended.rules,

      "react/react-in-jsx-scope": "off",

      "react/prop-types": "off",

      "react-refresh/only-export-components": [
        "warn",
        {
          allowConstantExport: true,
        },
      ],
    },
  },
];