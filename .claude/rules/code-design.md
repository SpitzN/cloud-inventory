---
paths:
  - "src/**/*.{ts,tsx}"
---

# Code design

ESLint enforces the mechanical conventions and they are not repeated here. These are the rules lint cannot check.

## Modules

- **Deep modules.** A module earns its place by hiding something: a small interface over real work. A second responsibility is a reason to split; length is not.
- **One responsibility per module.** A unit holds state, derives data, or renders. `docs/architecture.md` lists the units and what each may depend on.
- **Every layer transforms.** A function, hook or component that only forwards its arguments to the next one is removed, and the caller uses the next one directly.
- **Values travel the shortest path.** A value needed deep in the tree is read where it is used (store, route, address) or handed down by composition. Components do not carry props they do not use.
- **Import from the defining file.** Each name is exported where it is declared and imported from that file.

## Scope

- **Build for a caller that exists.** A prop, option, parameter or abstraction is added when this version has a use for it.
- **One source for each fact.** Option lists, ranks and types are derived from the schemas. A rule lives in one place and everything else reads it.
- **Extract on the third use.** Two similar pieces of code stay separate until a third shows what they share.
- **The library's feature first.** Check a library's own API and examples before writing project code that does the same job.

## Functions

- Guard clauses and early returns keep the main path unindented.
- A boolean parameter that switches behaviour becomes two functions.
- Names use the glossary's terms. A reader knows what a function returns without opening it.

## Types

- Types are built by construction: schema-derived types, `satisfies`, explicit annotations, discriminated unions.
- Zod parses wherever data enters from outside the type system; `docs/architecture.md` lists the boundaries. Inside them, types are trusted.
- Return types are inferred.

## Comments

A comment says what the code cannot.

- **Interface comments** describe an abstraction from the caller's side: what it promises, what it expects, its side effects and invariants. They leave the algorithm out.
- **Implementation comments** explain why this path or workaround was chosen.
- Code that needs a comment to say what it does is renamed or restructured.
