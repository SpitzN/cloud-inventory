# Wireframes

How each screen of Cloud Inventory looks: its layout, what sits in each region, and the states a user can see. What each screen does is in [product.md](./product.md). Terms are defined in [GLOSSARY.md](../GLOSSARY.md).

These are layout wireframes, not a visual design. Colour, type, spacing, depth and motion are in [DESIGN.md](../DESIGN.md), and the tokens behind them in `src/index.css`.

Every screen assumes a viewport 1280px wide or more ([ADR 0006](./adr/0006-desktop-only.md)).

## Shell

```
+------------------+---------------------------------------------------+
| Cloud Inventory  | [toggle]  Resources                       [theme] |
|                  +---------------------------------------------------+
| Resources    12  |                                                   |
| Applications  1  |                   page content                    |
|                  |                                                   |
+------------------+---------------------------------------------------+
```

**Sidebar**

- The product name, "Cloud Inventory", at the top.
- Two items, Resources and Applications. Each has an icon and a count: the number of Resources, and the number of Applications.
- The active item is highlighted.
- The sidebar folds to an icon rail. Folded items show their name in a tooltip.

**Header**

- A slim bar that is the page's title bar.
- Left to right: sidebar toggle, back chevron (New application page only), page title. The theme switch is at the far right.
- Page bodies do not repeat the title.

**Page content**

- Capped at 1440px wide and aligned to the left edge of the content area, so rows do not stretch across a wide screen.

**States**

- Sidebar expanded or folded.
- Light or dark theme.

**Why this, not that**

- The sidebar holds the two sections only. It does not list individual Applications.
- There is no breadcrumb. Resources and Applications are both top level; the back chevron appears only on the one page that sits under another.

Behaviour: [product.md, Shell](./product.md#shell).

## Resources page

`/resources`

```
[ Search by name ] [Provider v] [Environment v] [Criticality v] Clear filters  6 of 12      2 selected · Clear  [Create application]
+----+----------------------+---------------+----------+-------------+-------------+-------------+
| [-]| Name                 | Type          | Provider | Environment |Criticality v| Open issues |
+----+----------------------+---------------+----------+-------------+-------------+-------------+
| [x]| payments-api-prod    | EC2 Instance  | AWS      | production  | (Critical)  |           4 |
| [ ]| payments-ledger-db   | RDS Database  | AWS      | production  | (Critical)  |           2 |
| [x]| ci-deploy-role       | IAM Role      | AWS      | production  | (High)      |           7 |
```

**Toolbar**, left to right:

- Search input, placeholder "Search by name".
- Three filter buttons: Provider, Environment, Criticality. Each opens a dropdown of values with a tick box and a count beside each value. A button with active values shows them on the button.
- "Clear filters", shown only when search or a filter is active.
- The row count, for example "6 of 12".
- At the right: the Selection count with a "Clear" action, shown only when a row is ticked, then the "Create application" button.

**Table**

- Columns, in order: checkbox, Name, Type, Provider, Environment, Criticality, Open issues. These are the six data columns the core requirements name and nothing else: no Application column, and no owner, tags or region.
- The three enumerated columns are badges, not plain text.
  - Criticality is a badge coloured by its level. The badge carries the word, so it never relies on colour alone.
  - Provider and Environment are quiet outline badges, so Criticality is the column that draws the eye.
- Open issues is right-aligned with tabular numerals.
- A long name truncates with an ellipsis; the full name shows on hover.
- Sortable headers (Name, Criticality, Open issues) are buttons. The active one shows a direction indicator.
- Ticked rows are highlighted.

**States**

- **Header checkbox:** empty, partial (some visible rows ticked) or ticked (all visible rows ticked).
- **Selection with hidden rows:** the toolbar reads "3 selected (1 hidden)".
- **No matches:** the table body is replaced by a message and a "Clear filters" action.

```
+----+----------------------+---------------+----------+-------------+-------------+-------------+
| [ ]| Name                 | Type          | Provider | Environment | Criticality | Open issues |
+----+----------------------+---------------+----------+-------------+-------------+-------------+
|                                                                                                |
|                        No resources match your search and filters.                             |
|                                      Clear filters                                             |
|                                                                                                |
+------------------------------------------------------------------------------------------------+
```

Behaviour: [product.md, Resources page](./product.md#resources-page).

## New application page

`/applications/new`

```
[toggle] [<] New application                                              [theme]
+-------------------------------+   +----------------------------------------+
| Name                          |   | Preview                                |
| [ Checkout                  ] |   |            (payments-api-prod)         |
| Description  optional         |   |                   |                    |
| [ Cart, orders and ...      ] |   |              [ Checkout ]              |
| Resources · 3                 |   |             /            \             |
| [chip x][chip x][chip x] pay| |   |   (staging-db)      (data-lake)        |
|   payments-ledger-db  RDS ... |   |                                        |
| [Create application] [Cancel] |   |                                        |
+-------------------------------+   +----------------------------------------+
```

**Layout**

- Two columns: the form on the left, a live graph preview on the right.
- The header shows the back chevron.

**Form**, top to bottom:

- **Name:** a text input.
- **Description:** a textarea, marked "optional".
- **Resources:** a chip combobox. The label carries the count, for example "Resources · 3".
  - Each Member is a chip showing the Resource's name, with a remove button. A long name truncates.
  - Typing opens the option list. Each option shows name, Type and the Criticality badge, and is marked when it is already a Member.
- **Buttons:** "Create application" (primary) and "Cancel".

**Preview**

- The same graph as in the Application drawer (see [Graph](#graph)).
- The centre node shows the Name field's current value.

**States**

- **No name yet:** the centre node reads "Untitled application".
- **No Members:** only the centre node is shown, with a hint that added Resources will appear here.
- **Validation errors:** each error appears inline under its field.

Behaviour: [product.md, New application page](./product.md#new-application-page).

## Applications page

`/applications`

```
3 applications                                              [New application]
+----------------------+  +----------------------+  +----------------------+
| Checkout             |  | Payments API         |  | Data Platform        |
| Cart, orders and ... |  | Card processing ...  |  | Analytics wareho...  |
|                      |  |                      |  |                      |
| 3 resources ·        |  | 5 resources ·        |  | 5 resources ·        |
| 6 open issues  (crit)|  | 14 open issues (crit)|  | 15 open issues (high)|
+----------------------+  +----------------------+  +----------------------+
```

**Toolbar**

- The count at the left: "3 applications", "1 application".
- The "New application" button at the right.

**Cards**

- A grid of cards, newest first.
- Each card shows the name and description at the top. Its bottom line reads "5 resources · 15 open issues", with the Members' most critical level at the right as the same Criticality badge as the Resources table. The line sits at the bottom of the card, so the lines of a row of cards align.
- Counts agree with their number: "1 resource", "1 open issue". "0 open issues" is muted. With no Members the line reads "0 resources" alone, with no badge.
- A screen reader hears the badge as "most critical member: high", so the card's link does not end in a bare level.
- A missing description reads "No description" in muted text. A long description is clamped to two lines.
- The whole card is one link.

**States**

- **First run:** one card, the example Application.
- **Empty:** shown once every Application has been deleted. A message explaining that Applications are groups of Resources, a primary "New application" action, and a secondary link to Resources.

```
+--------------------------------------------------------------------------+
|                                                                          |
|                          No applications yet                             |
|        An application is a named group of resources, such as            |
|                           "Payments API".                                |
|                                                                          |
|                 [New application]    Browse resources                    |
|                                                                          |
+--------------------------------------------------------------------------+
```

**Why this, not that**

- Cards, not table rows. With three facts per Application, the row list looked poor in the wireframes.
- The most critical level, not a count at every level. One badge per card keeps Criticality the one loud thing on the page and the grid quick to scan; the drawer's Member table has the full breakdown.

Behaviour: [product.md, Applications page](./product.md#applications-page).

## Application drawer

`/applications/:id`

```
                              +----------------------------------------+
   (Applications page,        | Data Platform                      [x] |
    dimmed, behind)           | Analytics warehouse, pipelines and ... |
                              | +------------------------------------+ |
                              | |              graph                 | |
                              | +------------------------------------+ |
                              | Member resources · 5                   |
                              | name        type      crit.   issues   |
                              | ...                                    |
                              | [Delete application]                   |
                              +----------------------------------------+
```

**Layout**

- A drawer that opens from the right, over the Applications page, which is dimmed behind it. It floats 8px in from the window's top, right and bottom edges, with rounded corners.
- Width is about 55% of the window, with a 560px minimum, so a graph of up to 12 nodes has room.

**Contents**, top to bottom:

- The Application's name, with a close button at the right.
- The description, when there is one.
- The graph.
- The Member table, headed "Member resources · 5", with four columns: name, Type, Criticality, open issues. Criticality is the same badge as in the Resources table.
- "Delete application", styled as a destructive action.

**States**

- **Linked highlight:** hovering or focusing a Member row highlights its graph node, and hovering a node highlights its row.
- **No Members:** the graph shows the centre node alone and the Member table is empty.
- **Delete confirmation:** a dialog over the drawer. It names the Application, states that its Resources are not affected, and offers "Delete" and "Cancel".

Behaviour: [product.md, Application drawer](./product.md#application-drawer). Why a drawer and not a page: [ADR 0005](./adr/0005-create-on-a-page-view-and-edit-in-a-drawer.md).

## Graph

```
                 (• payments-api-prod)
                 ( EC2 Instance · AWS  4)
                          |
   (• staging-db ...)--[ Checkout ]--(• data-lake ...)
```

- **Centre node:** the Application's name. It is the only filled node.
- **Resource node:** Criticality dot, name, Type and Provider, and the open issue count. A long name truncates. The node is too small for a badge, so Criticality is a dot here; the Member table beside the graph carries the word.
- **Edges:** one straight line from the centre to each Resource node.
- **Layout:** a ring around the centre. The first node sits at the top and the rest follow clockwise at equal angles. The ring grows with the number of nodes so they never overlap, from 1 to 12.
- **Controls:** zoom in, zoom out, and fit to view.
- **Theme:** follows the light or dark theme.

**States**

- **Highlighted node:** one Resource node can be shown highlighted (used by the drawer's linked highlight).
- **Centre only:** no Resource nodes.

Behaviour: [product.md, Graph](./product.md#graph).

## Feedback and fallback screens

- **Toasts:** a short message at the edge of the window. Used after creating an Application (naming it), after deleting one, and when an Application is not found. The creation toast is a success toast: tinted with the success colour and marked with a check, so it stands out from the drawer it appears over.
- **Not-found page:** shown inside the shell for an unknown address, with a way back to Resources.
- **Error screen:** shown in place of the page content after an unexpected error, with a way back to Resources.
