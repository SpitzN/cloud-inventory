import js from "@eslint/js";
import { plugin as shadcn } from "@shadcn/lint";
import prettier from "eslint-config-prettier/flat";
import tailwind from "eslint-plugin-better-tailwindcss";
import boundaries from "eslint-plugin-boundaries";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import { reactRefresh } from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

const PALETTE =
  "red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone";

const NO_REEXPORT = "No re-exports: import from the file that declares the symbol.";

const SIBLING_FEATURE =
  "Features don't import each other. Move the shared fact to src/domain/, or compose both features in a route under src/app/routes/.";

export default defineConfig(
  // .scratch holds local notes and a reference copy with its own tsconfig, and .claude/worktrees
  // holds checkouts of this repository made by agents; neither is part of this project.
  globalIgnores(["dist", "coverage", ".scratch", ".claude/worktrees", "src/components/ui/**"]),

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
      "@typescript-eslint/consistent-type-assertions": ["error", { assertionStyle: "never" }],
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
      "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],
      "@typescript-eslint/no-confusing-void-expression": ["error", { ignoreArrowShorthand: true }],

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
      "no-restricted-imports": [
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
          ],
        },
      ],
    },
  },

  // --- Architecture: layers and feature slices (docs/adr/0009). An import between project
  // files is an error unless a policy below allows it; docs/tooling.md has the table.
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { boundaries },
    settings: {
      "import/resolver": { typescript: { project: "./tsconfig.app.json" } },
      "boundaries/root-path": import.meta.dirname,
      "boundaries/legacy-templates": false,
      // An @/ import the resolver cannot follow counts as an unknown local file, which fails lint.
      // The default would treat it as an external package and skip every boundary check.
      "boundaries/flag-as-external": { unresolvableAlias: false },
      // An element is a folder: every file below it belongs to it. The first match wins, so the
      // generated ui folder comes before the shared components folder that contains it.
      "boundaries/elements": [
        { type: "ui", pattern: "src/components/ui", partialMatch: false },
        { type: "app", pattern: "src/app", partialMatch: false },
        {
          type: "feature",
          pattern: [
            "src/features/*/components",
            "src/features/*/hooks",
            "src/features/*/stores",
            "src/features/*/schemas",
            "src/features/*/lib",
          ],
          partialMatch: false,
          capture: ["featureName"],
        },
        { type: "domain", pattern: "src/domain", partialMatch: false },
        { type: "shared", pattern: ["src/components", "src/hooks"], partialMatch: false },
        { type: "lib", pattern: "src/lib", partialMatch: false },
      ],
      // Single files cannot be elements; these categories make them known.
      "boundaries/files": [
        { category: "entry", pattern: "src/main.tsx" },
        { category: "test", pattern: "src/**/*.test.{ts,tsx}" },
        { category: "style", pattern: "src/**/*.css" },
      ],
    },
    rules: {
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          // Without these two, an import inside one folder (such as a test file beside its
          // subject) and an import of a file with no element (index.css) never reach the policies.
          checkInternals: true,
          checkUnknownLocals: true,
          message:
            "This import crosses a layer boundary ({{from.element.types}} → {{to.element.types}}): see Import direction in docs/tooling.md.",
          policies: [
            {
              from: { file: { categories: "entry" } },
              allow: {
                to: [{ element: { type: ["app", "ui"] } }, { file: { categories: "style" } }],
              },
            },
            {
              from: { element: { type: "app" } },
              allow: {
                to: { element: { type: ["app", "feature", "domain", "shared", "lib", "ui"] } },
              },
            },
            {
              from: { element: { type: "feature" } },
              allow: {
                to: [
                  {
                    element: {
                      type: "feature",
                      captured: { featureName: "{{from.element.captured.featureName}}" },
                    },
                  },
                  { element: { type: ["domain", "shared", "lib", "ui"] } },
                ],
              },
            },
            {
              from: { element: { type: "feature" } },
              disallow: {
                to: {
                  element: {
                    type: "feature",
                    captured: { featureName: "!{{from.element.captured.featureName}}" },
                  },
                },
              },
              message: SIBLING_FEATURE,
            },
            {
              from: { element: { type: "domain" } },
              allow: { to: { element: { type: ["domain", "lib"] } } },
            },
            {
              from: { element: { type: "shared" } },
              allow: { to: { element: { type: ["shared", "lib", "ui"] } } },
            },
            {
              from: { element: { type: "lib" } },
              allow: { to: { element: { type: "lib" } } },
            },
            // Last, so it overrides every allow above: the last matching policy wins.
            {
              disallow: { to: { file: { categories: "test" } } },
              message: "No file imports a test file.",
            },
          ],
        },
      ],
      "boundaries/no-unknown-files": "error",
      "boundaries/no-unknown-dependencies": "error",
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

  // --- shadcn/ui primitives: a caller's className places one and leaves its look alone.
  // The plugin's colour, arbitrary-value and unknown-class rules stay off: the block above
  // already checks those classes.
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { shadcn },
    settings: {
      shadcn: {
        // Appended to every finding: the built-in text offers a new variant in the primitive's file.
        note: "In this project src/components/ui/ stays as generated: do not add a variant or size there.",
      },
    },
    rules: {
      "shadcn/no-restyle": [
        "error",
        {
          allow: ["layout"],
          // The owner's two exceptions: a table cell truncates and aligns its figures, and a
          // badge takes its colour from a theme token (the Criticality badge).
          contracts: [
            { pattern: "^Table(Cell|Head)$", allow: ["layout", "typography"] },
            { pattern: "^Badge$", allow: ["layout", "color"] },
          ],
        },
      ],
      // no-restyle judges only the classes it can read; this reports the ones it cannot.
      "shadcn/require-static-classes": "error",
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
