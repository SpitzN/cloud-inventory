import js from "@eslint/js";
import prettier from "eslint-config-prettier/flat";
import tailwind from "eslint-plugin-better-tailwindcss";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import { reactRefresh } from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

const PALETTE =
  "red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone";

const NO_REEXPORT =
  "No re-exports: import from the file that declares the symbol.";

// A later `no-restricted-imports` entry REPLACES an earlier one for the same file,
// so every zone rebuilds the full option object through this helper.
const restrictedImports = (...zonePatterns) => [
  "error",
  {
    paths: [
      {
        name: "@tanstack/react-table",
        importNames: ["Table", "Row", "Cell", "Header", "Column"],
        message:
          "Do not type component props as core table objects: a compiled child goes stale. Call table/row methods in the column-def render function and pass plain values.",
      },
    ],
    patterns: [
      {
        regex: "^\\.\\./",
        message: "Use the @/ alias instead of parent-relative imports.",
      },
      ...zonePatterns,
    ],
  },
];

const noApp = {
  regex: "^@/app/",
  message: "Only src/app may import from @/app.",
};
const noFeatures = {
  regex: "^@/features/",
  message: "Shared code must not import from features.",
};
const noApplications = {
  regex: "^@/features/applications/",
  message:
    "resources must not import from applications (applications may import from resources).",
};

export default defineConfig(
  // .scratch holds local notes and a reference copy with its own tsconfig, and .claude/worktrees
  // holds checkouts of this repository made by agents; neither is part of this project.
  globalIgnores([
    "dist",
    "coverage",
    ".scratch",
    ".claude/worktrees",
    "src/components/ui/**",
  ]),

  // eslint-disable comments are inert and reported; with --max-warnings 0 they fail the run.
  {
    linterOptions: {
      noInlineConfig: true,
      reportUnusedDisableDirectives: "error",
    },
  },

  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // --- TypeScript strictness
      "@typescript-eslint/consistent-type-assertions": [
        "error",
        { assertionStyle: "never" },
      ],
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-expect-error": true,
          "ts-ignore": true,
          "ts-nocheck": true,
          "ts-check": false,
        },
      ],
      // Preset options that reject idiomatic React code; relaxed deliberately.
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } },
      ],
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        { allowNumber: true },
      ],
      "@typescript-eslint/no-confusing-void-expression": [
        "error",
        { ignoreArrowShorthand: true },
      ],

      // --- Style of code
      "no-nested-ternary": "error",
      "no-restricted-syntax": [
        "error",
        { selector: "ExportAllDeclaration", message: NO_REEXPORT },
        { selector: "ExportNamedDeclaration[source]", message: NO_REEXPORT },
        {
          selector: "ExportNamedDeclaration[declaration=null][source=null]",
          message:
            "No export lists: export at the declaration (export const / function / type / interface).",
        },
      ],
      complexity: ["error", 10],
      "max-depth": ["error", 2],
      "max-params": ["error", 3],
      "max-nested-callbacks": ["error", 2],
      "prefer-destructuring": "off",
      "@typescript-eslint/prefer-destructuring": [
        "error",
        {
          VariableDeclarator: { array: true, object: true },
          AssignmentExpression: { array: false, object: false },
        },
      ],
      "no-else-return": ["error", { allowElseIf: false }],
      "no-useless-return": "error",
      "no-unneeded-ternary": "error",
      "no-lonely-if": "error",

      // --- Modules
      "no-restricted-exports": [
        "error",
        {
          restrictDefaultExports: {
            direct: true,
            named: true,
            defaultFrom: true,
            namedFrom: true,
            namespaceFrom: true,
          },
        },
      ],
      "no-restricted-imports": restrictedImports(),
    },
  },

  // --- Import direction: app -> features -> (lib, components); applications -> resources, never back.
  {
    files: ["src/lib/**", "src/components/**"],
    rules: { "no-restricted-imports": restrictedImports(noFeatures, noApp) },
  },
  {
    files: ["src/features/**"],
    rules: { "no-restricted-imports": restrictedImports(noApp) },
  },
  {
    files: ["src/features/resources/**"],
    rules: {
      "no-restricted-imports": restrictedImports(noApp, noApplications),
    },
  },

  // --- React, React Compiler, accessibility
  {
    files: ["src/**/*.{ts,tsx}"],
    extends: [
      reactHooks.configs.flat["recommended-latest"],
      reactRefresh.configs.vite(),
      jsxA11y.flatConfigs.strict,
    ],
    rules: {
      // Not in any preset.
      "react-hooks/no-deriving-state-in-effects": "error",
      // The preset ships these three as warnings.
      "react-hooks/exhaustive-deps": "error",
      "react-hooks/incompatible-library": "error",
      "react-hooks/unsupported-syntax": "error",
    },
  },

  // --- Tailwind v4: theme tokens only
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { "better-tailwindcss": tailwind },
    settings: { "better-tailwindcss": { entryPoint: "src/index.css" } },
    rules: {
      "better-tailwindcss/no-restricted-classes": [
        "error",
        {
          restrict: [
            {
              pattern: "\\[([^\\[\\]]*?)\\](?!:)",
              message: "No arbitrary values: add a theme token.",
            },
            {
              pattern: `^(.*[:-])?(${PALETTE})-(50|[1-9]00|950)(\\/.+)?$`,
              message: "No raw palette colours: use a theme token.",
            },
            {
              pattern: "^(.*:)?text-[3-9]xl(\\/.+)?$",
              message: "No text larger than 24px (text-2xl).",
            },
          ],
        },
      ],
      "better-tailwindcss/no-unknown-classes": [
        "error",
        { ignore: ["^nodrag$", "^nopan$", "^nowheel$"] },
      ],
    },
  },

  // --- Exceptions
  {
    files: ["*.config.{js,ts}"],
    languageOptions: { globals: globals.node },
    rules: { "no-restricted-exports": "off" },
  },
  { files: ["*.config.js"], extends: [js.configs.recommended] },
  { files: ["**/*.test.{ts,tsx}"], rules: { "max-nested-callbacks": "off" } },

  // Prettier owns formatting: keep this last.
  prettier,
);
