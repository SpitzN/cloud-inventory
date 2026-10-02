---
paths:
  - "src/**/*.tsx"
  - "src/**/*.css"
---

# UI

Layout per screen is in `docs/wireframes.md` and behaviour in `docs/product.md`. These rules apply to every screen.

## Data drives the form

- Enumerated values (Criticality, Provider, Environment) are badges.
- Numbers are right-aligned with tabular numerals.
- Text that can overflow truncates with an ellipsis, and its full value stays reachable.
- Colour carries meaning from the data. Criticality is the only data-driven colour, and it comes from the four criticality tokens.

## Emphasis

- Default and inactive states are quiet: neutral, outline, no fill. Colour and fill mark what differs from the default.
- Each screen has one primary action, and it is the most explicit element: a filled button with a full label. Secondary actions are ghost or outline.
- A destructive action uses the destructive style and asks for confirmation.

## The hidden layer

- Every icon-only control has a tooltip and an accessible name.
- Every interactive element shows hover, focus and pressed states, rows and cards included.
- Anything revealed on hover is also reachable by keyboard focus.
- Every list, table and drawer has an empty state.
- An action whose result is not visible on screen confirms with a toast.

## Layout

- Primary content aligns left; values and actions align right. Centred text is for empty states.
- Related items sit closer together than unrelated ones, and siblings in a group share one spacing value.
- Structure comes from alignment and spacing before borders: one container per region.
- Spacing and sizes are whole steps of Tailwind's scale, which are multiples of 4px.
- Text stays at 24px or below.

## Tokens

- Every colour is a theme token, defined for light and dark. The visual design pass changes tokens, and components stay as they are.
- One font family.
