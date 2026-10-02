# shadcn/ui on Base UI only

shadcn/ui ships each component on a choice of primitive libraries. Cloud Inventory uses the Base UI variants only and never mixes in Radix ones. Base UI is the newer library and is under active development, accessibility is its stated primary focus, the chip combobox the creation form needs exists in that variant, and the author has used it in production. It is also shadcn/ui's default for new projects.

## Consequences

- The choice is made once, when the project is initialised, and applies to every component.
- Base UI components compose with a `render` prop, where Radix ones use `asChild`.
