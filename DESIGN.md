---
name: Cloud Inventory
description: A quiet console for triaging cloud Resources and reading Applications as graphs.
colors:
  background: "oklch(0.993 0.003 264)"
  foreground: "oklch(0.2 0.02 264)"
  card: "oklch(1 0 0)"
  popover: "oklch(1 0 0)"
  primary: "oklch(0.42 0.13 264)"
  primary-foreground: "oklch(0.99 0.003 264)"
  secondary: "oklch(0.96 0.008 264)"
  secondary-foreground: "oklch(0.25 0.03 264)"
  muted: "oklch(0.965 0.006 264)"
  muted-foreground: "oklch(0.5 0.02 264)"
  accent: "oklch(0.925 0.035 264)"
  accent-foreground: "oklch(0.25 0.03 264)"
  border: "oklch(0.915 0.008 264)"
  input: "oklch(0.88 0.01 264)"
  ring: "oklch(0.27 0.11 264)"
  sidebar: "oklch(0.975 0.006 264)"
  destructive: "oklch(0.49 0.185 18)"
  success: "oklch(0.5 0.12 152)"
  success-surface: "color-mix(in srgb, oklch(0.5 0.12 152) 14%, oklch(1 0 0))"
  tone-neutral: "oklch(0.5 0.03 255)"
  tone-caution: "oklch(0.47 0.1 78)"
  tone-warning: "oklch(0.47 0.145 42)"
  tone-danger: "oklch(0.55 0.2 28)"
  background-dark: "oklch(0.165 0.008 264)"
  foreground-dark: "oklch(0.96 0.005 264)"
  card-dark: "oklch(0.2 0.01 264)"
  popover-dark: "oklch(0.215 0.01 264)"
  primary-dark: "oklch(0.8 0.09 264)"
  primary-foreground-dark: "oklch(0.18 0.02 264)"
  secondary-dark: "oklch(0.26 0.012 264)"
  muted-dark: "oklch(0.25 0.01 264)"
  muted-foreground-dark: "oklch(0.71 0.015 264)"
  accent-dark: "oklch(0.3 0.05 264)"
  border-dark: "oklch(1 0 0 / 10%)"
  input-dark: "oklch(1 0 0 / 15%)"
  ring-dark: "oklch(0.86 0.08 264)"
  sidebar-dark: "oklch(0.185 0.01 264)"
  destructive-dark: "oklch(0.82 0.1 18)"
  success-dark: "oklch(0.75 0.14 152)"
  success-surface-dark: "color-mix(in srgb, oklch(0.75 0.14 152) 18%, oklch(0.215 0.01 264))"
  tone-neutral-dark: "oklch(0.72 0.03 255)"
  tone-caution-dark: "oklch(0.82 0.12 85)"
  tone-warning-dark: "oklch(0.75 0.15 50)"
  tone-danger-dark: "oklch(0.68 0.19 28)"
typography:
  headline:
    fontFamily: "Fira Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.4
  title:
    fontFamily: "Fira Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.5
  body:
    fontFamily: "Fira Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
    fontFeature: "tnum"
  body-strong:
    fontFamily: "Fira Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.43
  label:
    fontFamily: "Fira Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.33
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "14px"
  2xl: "18px"
  pill: "26px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "32px"
  button-primary-hover:
    backgroundColor: "oklch(0.42 0.13 264 / 80%)"
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "32px"
  button-outline-hover:
    backgroundColor: "{colors.muted}"
  button-ghost-hover:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.foreground}"
  button-destructive:
    backgroundColor: "oklch(0.49 0.185 18 / 10%)"
    textColor: "{colors.destructive}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.lg}"
    height: "32px"
  button-destructive-hover:
    backgroundColor: "oklch(0.49 0.185 18 / 20%)"
  input:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "4px 10px"
    height: "32px"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.xl}"
    padding: "16px"
  badge-neutral:
    backgroundColor: "transparent"
    textColor: "{colors.tone-neutral}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
    height: "20px"
  badge-caution:
    backgroundColor: "oklch(0.47 0.1 78 / 10%)"
    textColor: "{colors.tone-caution}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
    height: "20px"
  badge-warning:
    backgroundColor: "oklch(0.47 0.145 42 / 14%)"
    textColor: "{colors.tone-warning}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
    height: "20px"
  badge-danger:
    backgroundColor: "{colors.tone-danger}"
    textColor: "{colors.background}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
    height: "20px"
  sidebar-item-active:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-foreground}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.md}"
    height: "32px"
  table-row-selected:
    backgroundColor: "{colors.accent}"
  toast-success:
    backgroundColor: "{colors.success-surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.2xl}"
  graph-application-node:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.lg}"
    padding: "0 12px"
  graph-resource-node:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "0 12px"
---

# Design System: Cloud Inventory

The visual system as built. The tokens live in `src/index.css`, the primitives in `src/components/ui/` (shadcn/ui on Base UI), and the rules that bind every screen in [.claude/rules/ui.md](./.claude/rules/ui.md). Layouts are in [docs/wireframes.md](./docs/wireframes.md). The frontmatter above is normative: its keys are the CSS custom properties without the `--`, and a `-dark` suffix marks the value under `.dark`.

## Overview

**Creative North Star: "The Quiet Console"**

Every default state recedes into blue-cast neutrals, so the screen has only two voices: Criticality and the one primary action. An engineer scanning twelve Resources or a graph of Members should find the critical one first, without the interface competing for attention. Calm, precise and legible: the craft shows in states, alignment and numbers, not in decoration.

The surfaces are paper and ink with a slight blue cast (hue 264), in a light and a dark theme that follow the system setting. Density is moderate, set by 32px controls, 14px body text and a 4px spacing scale. One family, Fira Sans, at three weights carries every role. Depth is flat at rest; a shadow answers a state or marks a layer above the page.

Motion is one short response. Transitions take 150ms on one ease-out curve (`cubic-bezier(0.22, 1, 0.36, 1)`). A page fades in and rises 4px over 200ms, the drawer slides in from the right, and a card lifts 2px on hover. Under reduced motion, every movement becomes a fade.

**Key Characteristics:**

- Two loud things only: the four Criticality tones and the filled primary button.
- Blue-cast neutrals, defined for light and dark, with every colour a token.
- One family (Fira Sans 400, 500, 600) and no text above 24px.
- Flat surfaces separated by hairline rings; shadows only for state or layers.
- Tabular numerals, right-aligned, with zero counts muted.
- 150ms ease-out responses, reduced to fades when the system asks.

## Colors

A cool, near-monochrome ink-blue world, with four warm Criticality tones as the only data-driven colour.

### Primary

- **Deep Ink Blue** (`primary`): the filled primary button (one per screen), the Application node at the centre of the graph, and the highlighted Resource node's border. In dark it lifts to a pale periwinkle (`primary-dark`) with dark text.
- **Focus Ink** (`ring`): a darker step of the same hue, drawn at 50% as the 3px focus ring. Chosen to clear 3:1 at that opacity on every surface; in dark it is a light step (`ring-dark`).

### Neutral

- **Cool Paper** (`background`): the page.
- **White Card** (`card`, `popover`): cards, graph nodes, the drawer, dialogs, menus and toasts. In dark, the popover sits one step above the card so overlays read as nearer.
- **Ink** (`foreground`): body text and titles.
- **Muted Ink** (`muted-foreground`): secondary text, the "0 open issues" count, metadata such as a node's type and provider, and the graph's edges at 50%.
- **Muted Wash** (`muted`): the hover tint of rows, ghost and outline buttons.
- **Selection Tint** (`accent`): selected table rows, the linked highlight between Member rows and graph nodes, and the active sidebar item. It is kept apart from the hover tint so a selection stays visible under the pointer.
- **Sidebar Paper** (`sidebar`): the sidebar, one step below the page.
- **Hairline** (`border`, `input`): dividers and the 1px borders of inputs and outline buttons. In dark they are white at 10% and 15%.

### Status

- **Destructive Rose** (`destructive`): the Delete action, as text on its own 10% tint, and form errors. Its hue (18) stays apart from the danger tone (28), so an action never reads as data. It clears 4.5:1 on its tint at rest and on hover.
- **Success Green** (`success`, `success-surface`): the "Application created" toast only: its check icon, a 50% border and a tinted surface. Hue 152 is clear of every Criticality tone.

### Criticality

Each tone clears 4.5:1 as badge text on its own tint, also on a selected row. The fill rises with the level, so the order reads without colour.

- **Neutral Slate** (`tone-neutral`): low. Outline only, no fill.
- **Caution Ochre** (`tone-caution`): medium. A 10% tint.
- **Warning Amber-Rust** (`tone-warning`): high. A 14% tint with a 35% border.
- **Danger Red** (`tone-danger`): critical. The only solid badge, with page-coloured text.

### Named Rules

**The Two Voices Rule.** Only Criticality and the screen's one primary action carry saturated colour. If something else on screen is coloured, it is either a state (focus, selection, error) or a mistake.

**The Data Colour Rule.** Criticality is the only colour that comes from the data, and it always comes with its word. A dot on a graph node carries an accessible name; a badge carries the level as text.

**The Both Themes Rule.** Every colour is a token defined under `:root` and `.dark`. A literal colour in a component is a defect.

## Typography

**Body Font:** Fira Sans (with `ui-sans-serif, system-ui, sans-serif`), latin subset at 400, 500 and 600, loaded from `@fontsource/fira-sans`. The heading font token points at the same family.

**Character:** a humanist sans drawn for screens. Open apertures keep long resource names and region codes legible at 12–14px, and its tabular figures keep columns of counts aligned.

### Hierarchy

- **Headline** (600, 20px, 1.4): the drawer's Application name, through the drawer title's project `large` size. The largest text in the product.
- **Title** (600, 16px, 1.5): the page title in the 48px header. Card titles use the same size at 500.
- **Body** (400, 14px, 1.43): table cells, form fields, card text, descriptions. Counts use tabular numerals.
- **Body Strong** (500, 14px, 1.43): buttons, the active sidebar item, graph node names, section headings inside the drawer (at 600).
- **Label** (500, 12px, 1.33): badges, a node's type and provider line, the graph attribution.

### Named Rules

**The 24px Ceiling Rule.** No text exceeds 24px. Hierarchy comes from weight and position, not size: the jump from body to headline is 14px to 20px.

**The One Family Rule.** Fira Sans carries every role. A monospace second family was declined; identifiers stay in the sans.

## Layout

A desktop console at 1280px and wider; nothing narrower is targeted. A collapsible sidebar (icon-only when collapsed) sits beside the content. The header is 48px tall with a bottom hairline, holding the sidebar toggle, an optional back chevron, the page title and the theme switch at the right.

Content sits in a 16px padded column capped at 1440px, aligned left. Pages stack their regions with 16px gaps; related controls within a region sit 8px apart. Applications are a three-column card grid with 16px gutters. The drawer floats 8px in from the viewport's right edge at 55% of the width (at least 560px), and its graph has a fixed 384px height above the Member table. Its header holds the name to one line and the description to two.

Every size and gap is a whole step of the 4px scale. Primary content aligns left; values and actions align right. Centred text is for empty states only.

### Named Rules

**The One Container Rule.** Structure comes from alignment and spacing before borders: one container per region, never a card inside a card.

## Elevation & Depth

Flat at rest, shadow as response. Surfaces are separated by tone (sidebar, page, card, popover) and by a 1px hairline or a 10% foreground ring. A shadow appears only when something responds to the pointer or sits above the page.

### Shadow Vocabulary

- **Lift** (`box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`): an Application card on hover, together with a 2px rise.
- **Layer** (`box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`): toasts, which sit above the drawer.

### Named Rules

**The Flat-By-Default Rule.** A surface at rest has no shadow. If a shadow is visible on a resting element that is not a layer, remove it.

## Shapes

Gently rounded and consistent. The base radius is 10px (`--radius: 0.625rem`), and everything derives from it: 8px for sidebar items, 10px for buttons, inputs and graph nodes, 14px for cards and the floating drawer, 18px for toasts. Badges are fully rounded pills. The Criticality dot on a graph node is an 8px circle. Borders are 1px; the focus ring is 3px at 50% of the focus ink.

## Components

Refined and restrained: compact 32px controls, one filled primary, quiet outline and ghost secondaries.

### Buttons

- **Shape:** gently rounded (10px), 32px tall with 10px side padding; icon buttons are 28px or 32px square.
- **Primary:** Deep Ink Blue fill with near-white text. One per screen, with a full label ("New application", "Create").
- **Hover / Focus / Press:** primary fades to 80%; outline and ghost take the muted wash. Focus draws the 3px ring. Pressing nudges the button down 1px. All in 150ms ease-out.
- **Outline / Ghost:** outline has a hairline border on the page colour; ghost has none. Both are for secondary actions and icon controls.
- **Destructive:** rose text on a 10% rose tint, deepening to 20% on hover. Always followed by a confirmation dialog.

### Badges

- **Style:** 20px pills, 12px medium text, 8px side padding.
- **Criticality:** the four tones above, rising from outline to solid. In the combobox they sit in a fixed column so levels align.
- **Provider and Environment:** outline badges in ink, so enumerated values read as values without adding colour.

### Cards

- **Corner Style:** 14px.
- **Background:** White Card, with a 10% foreground ring instead of a border.
- **Shadow Strategy:** none at rest; Lift and a 2px rise on hover (no rise under reduced motion).
- **Internal Padding:** 16px.
- **Content:** a truncated name, a two-line description, and a bottom line reading "5 resources · 15 open issues" with the most critical Member's badge at the right.

### Inputs / Fields

- **Style:** 32px tall, 1px input hairline, transparent fill (a 30% input wash in dark), 10px radius.
- **Focus:** the border takes the ring colour and the 3px ring appears.
- **Error:** the border turns destructive with a 20% destructive ring, and the message below is announced.
- **Counter:** the description's character count, such as "42/200", sits at the textarea's bottom right in muted body text with tabular numerals, inside the field's border.

### Tables

- **Rows:** hover takes the muted wash at 50%; selected and linked-highlight rows take the selection tint, which wins over hover. Focusable rows draw a 2px inset focus outline.
- **Numbers:** right-aligned, tabular; a zero count is muted.

### Navigation

- **Sidebar:** Sidebar Paper, 14px items 32px tall with 16px icons and a count at the right. Hover fades to the selection tint through the project `fade` variant; the active item holds it and turns medium. Collapses to icons, with tooltips.

### Toasts

- **Style:** 18px radius, popover surface, Layer shadow, bottom right, above the drawer.
- **Success:** tinted with Success Green, a 50% green border and a green check, so "Application created" stands out from the drawer it appears over. Other toasts stay neutral.

### Application Graph

- **Canvas:** transparent, with edges in muted ink at 50%. Zoom and fit controls are three outline icon buttons at the bottom left; the attribution sits bottom right in 12px muted text.
- **Application node:** a Deep Ink Blue block with the name in the primary's foreground, at the centre of a ring.
- **Resource node:** a White Card block with a Criticality dot, the name over a 12px type and provider line, and the open issue count at the right. When linked from the Member table, its border turns Deep Ink Blue and the 3px ring appears, fading in over 150ms.

## Do's and Don'ts

### Do:

- **Do** take every colour from a token in `src/index.css`, defined under both `:root` and `.dark`.
- **Do** keep one filled primary button per screen; make every other action outline or ghost.
- **Do** pair every Criticality colour with its word or an accessible name.
- **Do** right-align numbers with tabular numerals and mute a zero count.
- **Do** give every interactive element hover and focus states, rows and cards included. Buttons also press; cards and rows have no pressed state.
- **Do** use 150ms on the default ease-out for state changes, and turn movement into a fade under reduced motion.
- **Do** change the look through tokens and project `cva` variants; leave the generated primitives in `src/components/ui/` as generated (ADR 0010).

### Don't:

- **Don't** colour anything from the data except Criticality.
- **Don't** use text above 24px, or a second font family.
- **Don't** put a shadow on a resting surface, or nest a card inside a card.
- **Don't** reuse the danger tone for destructive actions or the success green for data; each has its own hue.
- **Don't** use the hover tint (muted) to mark selection; selection is the accent tint.
- **Don't** write a literal colour, radius or off-scale spacing value in a component.
