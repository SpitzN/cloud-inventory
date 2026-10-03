# shadcn/ui on Base UI only

shadcn/ui ships each component on a choice of primitive libraries. Cloud Inventory uses the Base UI variants only and never mixes in Radix or React Aria ones. Base UI is the newer library and is under active development, accessibility is its stated primary focus, the chip combobox the creation form needs exists in that variant, and the author has used it in production. It is also shadcn/ui's default for new projects.

## Consequences

- The choice is made once, when the project is initialised, and applies to every component.
- Base UI components compose with a `render` prop, where Radix ones use `asChild`.
- The owner adds components with the shadcn CLI, which takes the variant from the style in `components.json`. The Radix and React Aria packages are not installed, and code from the documentation's Radix or React Aria tabs is not used.
