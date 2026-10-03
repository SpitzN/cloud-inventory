# Architecture

How Cloud Inventory is built: the domain types, the stack, where each piece of state lives, the routes, the code layout and the tests. What it does is in [product.md](./product.md); how it looks is in [wireframes.md](./wireframes.md). Terms are defined in [GLOSSARY.md](../GLOSSARY.md), and the decisions with real alternatives are in [adr/](./adr/).

## Domain types

Types are inferred from Zod schemas. The schemas follow the first `Resource` and `Application` interfaces, with one change: `openIssues` is added to `Resource`. It was present in the sample data and the table requirements but missing from the interface, so the sample did not type-check as written ([ADR 0008](./adr/0008-open-issues-is-part-of-resource.md)).

```ts
export const ProviderSchema = z.enum(["AWS", "GCP", "Azure"]);
export const EnvironmentSchema = z.enum([
  "production",
  "staging",
  "development",
]);
export const CriticalitySchema = z.enum(["low", "medium", "high", "critical"]);

export const ResourceSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  provider: ProviderSchema,
  region: z.string(),
  environment: EnvironmentSchema,
  criticality: CriticalitySchema,
  owner: z.string(),
  tags: z.array(z.string()),
  // In the sample data and the table requirements, but missing from the first interface (ADR 0008).
  openIssues: z.number().int().nonnegative(),
});

export const ApplicationSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  resourceIds: z.array(z.string()),
});

export type Provider = z.infer<typeof ProviderSchema>;
export type Environment = z.infer<typeof EnvironmentSchema>;
export type Criticality = z.infer<typeof CriticalitySchema>;
export type Resource = z.infer<typeof ResourceSchema>;
export type Application = z.infer<typeof ApplicationSchema>;
```

Rules that follow from the model:

- **Membership lives only in `Application.resourceIds`.** A `Resource` holds no knowledge of Applications, and nothing is ever written into `tags`.
- **Criticality rank** is the position of each value in `CriticalitySchema.options` (`low` lowest, `critical` highest). It is not a second hand-written list.
- **Filter option lists** come from the three enum schemas' `options`.
- **Application ids** are generated with `crypto.randomUUID()`. The example Application has a fixed id, so its address is the same on every first run.
- **Application order** is newest first. New Applications are added to the front of the list; no timestamp field is added to the model.

## Stack

| Concern             | Choice                                                                                                             | Decision record                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| Build and framework | Vite, React 19 with the React Compiler, TypeScript 6 in strict mode                                                |                                                                                                       |
| Checks              | ESLint, Prettier, husky pre-commit hook; see [tooling.md](./tooling.md)                                            |                                                                                                       |
| Routing             | React Router                                                                                                       |                                                                                                       |
| Client state        | Zustand, with its persist middleware for Applications                                                              | [0001](./adr/0001-no-simulated-backend.md)                                                            |
| Table               | TanStack Table v9, rendered with shadcn/ui table markup                                                            | [0003](./adr/0003-tanstack-table-for-the-resources-table.md)                                          |
| Form                | React Hook Form with the Zod resolver                                                                              | [0004](./adr/0004-react-hook-form-with-zod.md)                                                        |
| Schemas and types   | Zod 4; all domain types are schema-derived                                                                         | [0004](./adr/0004-react-hook-form-with-zod.md), [0008](./adr/0008-open-issues-is-part-of-resource.md) |
| Styling             | Tailwind CSS                                                                                                       |                                                                                                       |
| Components          | shadcn/ui, Base UI variants only                                                                                   | [0007](./adr/0007-shadcn-ui-on-base-ui-only.md)                                                       |
| Icons               | lucide-react, shadcn/ui's default                                                                                  |                                                                                                       |
| Font                | Geist, self-hosted through `@fontsource-variable/geist`, shadcn/ui's default; the visual design pass may change it |                                                                                                       |
| Graph               | React Flow (`@xyflow/react`)                                                                                       | [0002](./adr/0002-react-flow-for-the-graph.md)                                                        |
| Toasts              | shadcn/ui's Sonner component                                                                                       |                                                                                                       |
| Theme               | `next-themes`                                                                                                      |                                                                                                       |
| Tests               | Vitest                                                                                                             |                                                                                                       |
| Package manager     | pnpm                                                                                                               |                                                                                                       |

`next-themes` has no Next.js dependency. It is used because shadcn/ui's generated toast component imports its theme hook from it, and because it already follows the system setting on the first visit and remembers the user's choice afterwards. shadcn/ui's Vite template also generates a `theme-provider.tsx` of its own; it is not used.

## Where state lives

There is no backend and no simulated one ([ADR 0001](./adr/0001-no-simulated-backend.md)). The third column says who would own each piece of state in the real product.

| State                                                                  | Home                                                     | In the real product | Reason                                                   |
| ---------------------------------------------------------------------- | -------------------------------------------------------- | ------------------- | -------------------------------------------------------- |
| Resources                                                              | A static, typed module                                   | Server-owned        | Read-only data; never copied into state                  |
| Applications                                                           | Zustand store, saved to localStorage, Zod-parsed on load | Server-owned        | Used on several pages, and durable                       |
| Selection                                                              | A second Zustand store, in memory only                   | Client-owned        | Must outlive the Resources page; the form starts from it |
| Search, filters, sort                                                  | The address query string, Zod-parsed                     | Client-owned        | Survives a reload; shareable                             |
| Form draft                                                             | React Hook Form, seeded from the Selection               | Client-owned        | Transient                                                |
| Open drawer                                                            | The route                                                | Client-owned        | Linkable; Back closes it                                 |
| Theme                                                                  | `next-themes`, in localStorage                           | Client-owned        | Personal preference                                      |
| Sidebar folded or not                                                  | localStorage                                             | Client-owned        | Personal preference                                      |
| Filtered rows, counts, an Application's Members, graph nodes and edges | Computed on every render                                 | Derived             | Derived data is never stored                             |

### The table owns no state

TanStack Table is given controlled state through `state` and the `on…Change` handlers:

- Column filters and sorting come from the address.
- Row selection comes from the Selection store.
- Search is the `name` column's filter.

Its helpers are used as they come:

- **Header checkbox.** The "page rows" helpers: `getIsAllPageRowsSelected`, `getIsSomePageRowsSelected` and `getToggleAllPageRowsSelectedHandler`. With no pagination registered, the "page" is every row that passes the filters, so the checkbox acts on visible rows only and leaves hidden ticked rows alone.
- **Filter counts.** `getFacetedUniqueValues`, which counts each value with the other filters applied and the column's own filter ignored.
- **Row ids.** `getRowId` returns the Resource's id, so the Selection is a set of Resource ids.

### The React Compiler and stable objects

The React Compiler memoizes every component. A child that is handed a stable object whose contents change, and reads from it, does not re-render. Two libraries hand out such objects; both were tested with the compiler on.

- **TanStack Table.** `table` and `row` are read only in the component that calls `useTable` and inside the column definitions' render functions. Children receive plain values: the header checkbox is given `checked`, `indeterminate` and a change handler, not `table`.
- **React Hook Form.** The live preview reads the name and the Members with `useWatch`. Children read form state through `useWatch`, `useFormState` or `Controller`, given `control`; the `form` object is not passed down. `watch()` is not used, because the compiler skips any component that calls it.

## Routes

```
/                      → redirects to /resources
(shell layout)
  /resources           Resources page
  /applications        Applications page
    :id                Application drawer, rendered over the Applications page
  /applications/new    New application page
  *                    not-found page
```

Each route declares its header metadata (the title, and whether to show the back chevron) on the route itself. The shell reads it from the matched routes and parses it with Zod, since the router types it as unknown.

## Code layout

Code is organised by feature, not by file type.

```
src/
  app/                  router, shell (sidebar and header), theme
  components/ui/        shadcn/ui files, as generated
  features/
    resources/          schema, dataset, table columns, toolbar and filters,
                        address parsing, Criticality rank, Selection store, page
    applications/       schema, store, cards page, drawer,
                        creation page, form, Resource combobox
      graph/            graph component, the two node components, ring layout
  lib/                  shared helpers
```

Test files sit beside the code they test.

## Units and their boundaries

| Unit                             | What it does                                                                                           | Depends on                                       |
| -------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------ |
| Resource and Application schemas | Define the domain types and enum option lists                                                          | Zod                                              |
| Dataset module                   | Exports the twelve Resources, a lookup by id, and the example Application                              | The schemas                                      |
| Criticality rank                 | A rank and a comparator                                                                                | Criticality schema                               |
| Address codec                    | Parses the query string into table state and serialises table state back                               | Zod, the enum schemas                            |
| Selection store                  | Holds the ticked Resource ids; toggle, set many, clear                                                 | Zustand                                          |
| Applications store               | Holds Applications; create, remove; saving                                                             | Zustand, saved-data resolution                   |
| Saved-data resolution            | A pure function from whatever is saved to the starting list of Applications                            | Application schema, dataset                      |
| Resources table                  | Columns, controlled TanStack Table instance, table markup                                              | TanStack Table, address codec, Selection store   |
| Resources toolbar                | Search, the three filters, counts, the Create button                                                   | Address codec, Selection store                   |
| `ApplicationForm`                | Name, description and Members fields; validation; submit and cancel                                    | React Hook Form, form schema, `ResourceCombobox` |
| `ResourceCombobox`               | A controlled chip combobox: a list of ids in, a list of ids out                                        | shadcn/ui Combobox, dataset                      |
| `ApplicationGraph`               | Draws a name and a list of Resources as a hub-and-spoke graph; can highlight one node and report hover | React Flow, ring layout                          |
| Ring layout                      | A pure function from a node count to positions                                                         | Nothing                                          |
| Application drawer               | Shows one Application: graph, Members, delete                                                          | Applications store, `ApplicationGraph`           |

Three of these are deliberately ignorant of their surroundings:

- **`ApplicationGraph`** receives a name and a list of Resources. Optionally it also receives the id of the Resource to highlight and a callback for when a node is hovered, which the drawer uses to link the graph to the Member table. The creation page passes live form values; the drawer passes a saved Application. It knows about neither the form nor the store.
- **`ApplicationForm`** receives starting values, the names already in use, and submit and cancel handlers. It does not know it is on a page, so a later Edit feature can place it in a drawer ([ADR 0005](./adr/0005-create-on-a-page-view-and-edit-in-a-drawer.md)).
- **`ResourceCombobox`** is a plain controlled input.

## Where Zod parses

Zod parses at every point where data enters from outside the type system. Inside, the types are trusted and nothing is re-parsed.

| Boundary               | What is parsed                                                                |
| ---------------------- | ----------------------------------------------------------------------------- |
| localStorage           | The saved Applications list, on load                                          |
| Address                | `q`, the three filters, `sort`                                                |
| Route metadata         | Each route's header title and back-chevron flag                               |
| Form                   | The creation form, through React Hook Form's Zod resolver                     |
| TanStack filter values | The value handed to a custom filter function, which the library types loosely |

The form schema is built by a function that takes the existing Application names, so the uniqueness rule lives in the schema.

The static dataset is typed by annotation, not parsed at runtime. One test runs it through the schema.

## Data flows

**Create.**

1. The New application page reads the Selection and seeds the form's Members from it.
2. On submit, the Applications store adds the Application to the front of the list.
3. The Selection store clears.
4. The router goes to `/applications`, replacing the history entry.
5. A toast confirms.

**View.** The drawer reads the id from the route, finds the Application in the store, resolves its `resourceIds` to Resources through the dataset lookup, and passes the name and Resources to `ApplicationGraph` and the Member table.

**Delete.** The drawer asks for confirmation, removes the Application from the store, goes to `/applications`, and a toast confirms.

## Saving and loading

- Applications are saved under one localStorage key with a version number.
- The store's initial state is the first-run state: the example Application alone.
- On load, the saved value arrives as `unknown` and is parsed with Zod.
  - Nothing saved, or a value that fails to parse: the initial state is kept. Nothing crashes and nothing is repaired.
  - A valid list, including an empty one: it replaces the initial state. This is why a deleted example stays deleted.
- A saved Application that refers to a Resource id no longer in the dataset loses that id. The Application is kept, even with no Members left.

## Testing

Tests are deliberately light. They cover pure code only.

| Target                                            | What is checked                                                                                                      |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Criticality comparator and the multi-value filter | Rank order; an empty filter matches everything; several values widen                                                 |
| Address codec                                     | Round trip of valid state; defaults omitted; malformed and unknown values dropped                                    |
| Form schema                                       | Required name, length limits, case-insensitive uniqueness, at least one Member, empty description left out           |
| Dataset                                           | Every row passes `ResourceSchema`; ids are unique; the example Application's Members all exist                       |
| Saved-data resolution                             | First run; unreadable data; an empty saved list; a deleted example stays deleted; a Member whose Resource is missing |

Not tested: the stores, React components, shadcn/ui files, TanStack Table itself, and the graph.

## Connecting a real API

Not built. The migration is described in [ADR 0001](./adr/0001-no-simulated-backend.md): the two server-owned rows of the state table move to a server-state library, and the client-owned rows stay where they are.

## Verified library facts

The design relies on these. Each was checked on 2026-10-02 against the published package and its documentation. The table, form, graph and store code was compiled under TypeScript 6 with the project's compiler options, linted with the project's ESLint config, and run in tests. The checks and the lint setup themselves are described in [tooling.md](./tooling.md).

| Library                              | Fact                                                                                                                              | Consequence                                                                                                                    |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| shadcn/ui (CLI 4.21)                 | Every component the design needs has a Base UI variant, including the combobox with chips and a dropdown with checkbox items      | Initialised with `pnpm dlx shadcn@latest init -t vite -b base -p nova` (Nova is the default preset)                            |
| shadcn/ui                            | The base is fixed at initialisation and cannot be changed afterwards                                                              | Chosen once, at setup                                                                                                          |
| shadcn/ui                            | Base UI variants compose with a `render` prop, not `asChild`                                                                      | Links and triggers are composed with `render`                                                                                  |
| shadcn/ui                            | The generated toast component imports `useTheme` from `next-themes`                                                               | `next-themes` is the theme provider, so the generated file stays untouched                                                     |
| TanStack Table 9.2                   | Tables are created with `useTable` and a `tableFeatures` registry; a feature that is not registered has no API                    | Register column filtering, sorting, row selection and faceting, with the filtered, sorted and faceted row models               |
| TanStack Table 9.2                   | `state` plus `on…Change` handlers still give full outside control; handlers receive updater functions                             | The Selection store and the address codec resolve updaters with the library's `functionalUpdate`                               |
| TanStack Table 9.2                   | The "page rows" selection helpers act on filtered rows when no pagination is registered, and keep hidden ticked rows              | Used for the header checkbox. "Some" stays true when all are ticked, so partial is "some and not all"                          |
| TanStack Table 9.2                   | The "all rows" check `getIsSomeRowsSelected` counts hidden ticked rows                                                            | Not used                                                                                                                       |
| TanStack Table 9.2                   | Faceted unique values ignore the column's own filter and apply the others                                                         | Used for the filter counts; a value with no rows is absent from the map, so read counts with a fallback of 0                   |
| `@hookform/resolvers` 5.9 with Zod 4 | The resolver infers the form's input and output types from the schema, but untyped default values widen an enum field to `string` | Default values are annotated with the schema's input type, and `useForm` is given the input, context and output types          |
| React Flow (`@xyflow/react` 12.12)   | `colorMode` takes light, dark or system; nodes are typed without assertions                                                       | The resolved theme is passed to `colorMode`. `<ReactFlow>` is written without explicit type arguments; it infers the node type |
| React Flow                           | `nodesDraggable`, `nodesConnectable` and `deleteKeyCode` switch off editing while pan, zoom and fit-view stay on                  | The graph is read-only                                                                                                         |
| Zustand 5 `persist`                  | `merge` receives the saved value as `unknown`, and is also called with `undefined` when nothing is saved                          | The Zod parse happens in `merge` and falls back to the initial state                                                           |

The same day, the libraries were run with the React Compiler switched on:

| Combination                         | Result                                                                                                                                                                         | Consequence                                               |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------- |
| React Compiler 1.0 with Vite        | Stable. Enabled through the React plugin's compiler preset                                                                                                                     | Part of project setup                                     |
| TanStack Table 9.2                  | A compiled child given `table` or `row` showed stale selection. Calling the methods in the column definitions and passing values worked for selection, filter and data changes | The table rule in "The React Compiler and stable objects" |
| React Hook Form 7.89                | `useWatch` gives a live preview. `watch()` makes the compiler skip the component. A child reading `form.formState` went stale                                                  | The form rule in the same section                         |
| Zustand 5, React Flow 12            | Selectors, and nodes computed during render, updated correctly                                                                                                                 | None                                                      |
| `next-themes`, shadcn/ui components | Not run with the compiler                                                                                                                                                      | Check when the shell is built                             |

One thing to keep in mind: if pagination is ever added to the Resources table, the "page rows" helpers narrow to the current page, and the header checkbox would need rethinking.
