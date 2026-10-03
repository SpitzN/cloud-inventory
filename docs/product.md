# Product

What Cloud Inventory does: its scope, the behaviour of every screen, and the rules that hold across screens. How each screen looks is in [wireframes.md](./wireframes.md). The data it starts with is in [dataset.md](./dataset.md). Terms are defined in [GLOSSARY.md](../GLOSSARY.md).

## What this is

Cloud Inventory is a small frontend for the kind of console a cloud security company runs. Such a product monitors an organisation's cloud Resources: buckets, databases, compute, IAM roles. An Application is a named, logical group of Resources, for example "Payments API".

The UI browses Resources, groups a Selection into a new Application, and views the Applications created. There is no backend: state is held in the client.

### Core requirements

1. Display Resources in a table: name, Type, Provider, Environment, Criticality, open issues.
2. Search by name and filter by Provider, Environment and Criticality.
3. Select multiple Resources and create a named Application from the Selection.
4. List created Applications.
5. Visualise an Application as a graph: a central Application node connected to its Member nodes.
6. TypeScript and React; runnable from a fresh clone with one documented command.
7. A README: how to run it, what was built, and what would come next.

## Scope

### In this version

- Everything in the core requirements above.
- Sorting on three columns.
- Applications saved in the browser.
- One example Application on first run.
- Deleting an Application.
- Light and dark themes.
- A small set of unit tests on pure code.

### Not in this version

These are listed in the README under "What would come next". The full list is in [What would come next](#what-would-come-next).

- Editing an Application.
- A Resource details view showing owner, tags and region.
- Layouts below 1280px wide.
- A New application page that survives a reload.
- A real API.
- Graph extensions.
- Pagination or virtualisation of the table.

### Phases

The product was built first, complete and working, on shadcn/ui's default theme. A visual design pass followed, through the theme tokens; it is recorded in [DESIGN.md](../DESIGN.md).

## Shell

- **Routes.** `/` redirects to `/resources`. The pages are `/resources`, `/applications`, `/applications/new` and `/applications/:id`. Any other address shows the not-found page inside the shell.
- **Sidebar.** The Applications item is active on `/applications`, `/applications/new` and `/applications/:id`. The folded state is remembered across reloads.
- **Titles.** "Resources", "Applications", "New application". The drawer route keeps "Applications".
- **Document title.** `<page title> · Cloud Inventory`.
- **Theme.** The first visit follows the system setting. After the switch is used, the choice is remembered.
- **Back chevron.** Shown only on the New application page. It behaves like that page's Cancel button.

## Resources page

`/resources`

### Search

- A case-insensitive substring match on `name`, after trimming.
- Applies as the user types.

### Filters

- Three filters: Provider, Environment and Criticality. Each is a dropdown in which several values can be ticked.
- Beside each value is a count: the number of rows with that value, given the current search and the other two filters. A filter's own ticked values do not reduce its counts.
- Values within one filter widen the result (AWS or GCP). Filters combine to narrow it (AWS and production). Search narrows further.
- A filter button with active values shows them on the button.
- "Clear filters" appears when search or any filter is active, and resets all of them.
- A count reads "6 of 12".
- When nothing matches, the table body is replaced by a message and a "Clear filters" action.

### Sorting

- Sortable columns: Name, Criticality and Open issues.
- Clicking a sortable header sorts by it; clicking again reverses the direction.
- First-click directions: Name ascending, Criticality most critical first, Open issues highest first.
- Criticality sorts by its rank (low, medium, high, critical), not alphabetically.
- The default order, when no sort is chosen: most critical first, then most open issues.
- Ties are always broken by name, ascending.
- The active sort column shows a direction indicator. In the default state the indicator is on Criticality.

### Address state

Search, filters and sort are held in the query string and survive a reload.

| Parameter     | Value                                                                     | Example                     |
| ------------- | ------------------------------------------------------------------------- | --------------------------- |
| `q`           | search text                                                               | `q=payments`                |
| `provider`    | comma-separated Providers                                                 | `provider=AWS,GCP`          |
| `environment` | comma-separated Environments                                              | `environment=production`    |
| `criticality` | comma-separated levels                                                    | `criticality=critical,high` |
| `sort`        | `<column>.<asc\|desc>`, column one of `name`, `criticality`, `openIssues` | `sort=openIssues.desc`      |

- Unknown or malformed values are dropped silently; the rest still apply.
- A parameter at its default is omitted from the address.
- Updates replace the current history entry, so Back does not step through keystrokes.

### Selection

- A checkbox on every row and one in the header.
- The Selection survives search, filter and sort changes, so a group can be built across filters.
- The header checkbox ticks or unticks only the rows currently visible. It shows the partial state when some but not all visible rows are ticked.
- When any row is ticked, the toolbar shows the count and a "Clear" action. If some ticked rows are hidden by the current filters it reads "3 selected (1 hidden)". "Clear" unticks every row, including hidden ones.
- The Selection survives navigating to another page and back. It is not saved across reloads.

### Create button

- "Create application" is at the right of the toolbar and is always enabled.
- It goes to `/applications/new`.

## New application page

`/applications/new`

### Starting Members

- The form's Members start as the current Selection, wherever the user came from. With nothing ticked, the form starts with no Members.
- Seeded Members are listed in the default table order: most critical first, then most open issues, then name.
- The form holds its own list. Adding or removing a Member in the form does not change the Selection.
- A reload empties the Selection, so it also empties the form.

### Fields

| Field       | Control                   | Rules                                                                                                                                    |
| ----------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Name        | text input                | Required after trimming. At most 60 characters. Must not match an existing Application's name, ignoring case and surrounding whitespace. |
| Description | textarea, marked optional | At most 200 characters after trimming.                                                                                                   |
| Resources   | chip combobox             | At least one Member.                                                                                                                     |

### Resources combobox

- Typing filters the option list by name.
- Picking an option adds a Member, shown as a chip at the end of the list.
- A chip is removed with its remove button, or with Backspace in an empty input.
- The label above shows the count, for example "Resources · 3".

### Preview

- The centre node shows the Name field's current value, or "Untitled application" while it is empty.
- Nodes appear and disappear as Members are added and removed.
- With no Members, only the centre node is shown, with a hint that added Resources will appear here.

### Validation

- Runs on submit. After a failed submit, fields re-validate as they change.
- Errors appear inline under their field. Focus moves to the first invalid field.
- The Create button stays enabled, so the reason for a failure is never hidden.

### Create

1. Saves the Application: its name (trimmed), its description (trimmed, and left out when empty), and its Members in the order shown.
2. Puts it at the front of the Applications list.
3. Clears the Selection.
4. Opens the new Application's drawer at `/applications/:id`, with `/applications` in place of the form in the history: closing the drawer, or Back, shows the list with the new card first, and Back never returns to a filled form.
5. Shows a toast naming the new Application.

### Cancel

- The Cancel button and the header's back chevron do the same thing: return to the previous page. If the page was opened directly, with no earlier page in Cloud Inventory, they go to `/applications`.
- The Selection is left untouched, so returning to Resources shows the same ticks.
- There is no "discard changes?" prompt.

## Applications page

`/applications`

- The "New application" button goes to `/applications/new`.
- Applications are listed newest first.
- Each card is one link to `/applications/:id`, reachable and activatable by keyboard.
- Each card shows its Members' most critical level and the sum of their open issues. Both are worked out from the Members when the card is shown; neither is saved on the Application.
- When there are no Applications, the empty state is shown. Its primary action goes to `/applications/new` and its secondary link to `/resources`.

## Application drawer

`/applications/:id`

- The route renders the Applications page with the drawer on top.
- The drawer is modal. It closes with its close button, Escape, a click on the overlay, or the browser's Back. Closing goes to `/applications`.
- A reload or a shared link reopens the same drawer.
- The Member table and the graph's ring list Members in the default table order: most critical first, then most open issues, then name.
- Hovering or focusing a Member row highlights its graph node, and hovering a node highlights its row.
- **Delete.** "Delete application" opens a confirmation dialog. Confirming removes the Application, goes to `/applications` and shows a toast. The Application's Resources are not affected. Delete exists only in the drawer.
- **Unknown id.** Goes to `/applications`, replacing the history entry, and shows an "Application not found" toast.

## Graph

- One centre node for the Application and one node per Member, each connected to the centre.
- The layout is the same every time for the same input.
- The user can pan, zoom, and fit the graph to view.
- The view refits when the set of nodes changes.
- Nodes cannot be dragged, connected or deleted.

## First run and saved data

- **Membership.** A Resource can be a Member of any number of Applications. Membership is recorded on the Application only; a Resource holds no record of it, and nothing is ever written into its tags.
- **Names.** Application names are unique, ignoring case and surrounding whitespace. This includes the example Application's name.
- **Saved.** Applications, the theme and the sidebar's folded state are saved in the browser and survive a reload.
- **Not saved.** The Selection and the form's contents. Search, filters and sort live in the address.
- **First run.** With nothing saved, Cloud Inventory starts with the example Application alone (see [dataset.md](./dataset.md#the-example-application)).
- **Unreadable saved data.** With no valid saved list, Cloud Inventory starts from the first-run state. It does not crash and does not try to repair the data.
- **Deleting the example.** The example Application stays deleted. An empty saved list is a valid saved list.
- **Missing Resources.** A saved Application that refers to a Resource no longer in the dataset loses that Member. The Application is kept, even if it is left with no Members.

## Edge cases

| Situation                                                                        | Behaviour                                                                                                                              |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Search and filters match nothing                                                 | A message in place of the table body, with "Clear filters"                                                                             |
| Every Application has been deleted                                               | The empty state on the Applications page                                                                                               |
| `/applications/:id` with an unknown id                                           | Go to `/applications`, show "Application not found"                                                                                    |
| Saved data cannot be read                                                        | Start from the first-run state                                                                                                         |
| A saved Application refers to a missing Resource                                 | That Member is dropped; the Application is kept                                                                                        |
| Malformed filter or sort values in the address                                   | Ignored; valid ones still apply                                                                                                        |
| New application page opened directly, then cancelled                             | Goes to `/applications`                                                                                                                |
| New application page reloaded                                                    | The form starts empty, because the Selection is not saved                                                                              |
| "New application" clicked on the Applications page while rows are ticked         | The form starts with the ticked Resources as Members                                                                                   |
| An Application with no Members (possible only through the missing-Resource rule) | The card reads "0 resources", with no Criticality and no open issues; the drawer shows the centre node alone and an empty Member table |
| An unknown address                                                               | The not-found page, inside the shell                                                                                                   |
| An unexpected runtime error                                                      | An error screen with a way back to Resources                                                                                           |

## Accessibility

- Every control is reachable and operable by keyboard, with a visible focus indicator.
- Row checkboxes are labelled with the Resource's name; the header checkbox is labelled as selecting all visible rows.
- Sortable headers are buttons and expose the current sort direction.
- Dialogs and the drawer trap focus and return it to the trigger on close.
- Criticality is never conveyed by colour alone.
- The graph is not the only way to read an Application: the Member table presents the same data as text.
- Form errors are associated with their fields and announced.

## README

The README contains:

- A link to the live demo, if one is deployed.
- How to run it: one command, `pnpm install && pnpm dev`.
- What was built, with the routes and a short tour.
- Decisions and trade-offs, including where each piece of state lives, with links to the ADRs.
- How the `openIssues` mismatch was resolved: it was in the sample data and the table requirements but missing from the first `Resource` interface, so it was added to the interface ([ADR 0008](./adr/0008-open-issues-is-part-of-resource.md)).
- Additions beyond the core requirements: sorting, saved Applications, the example Application, delete, dark theme.
- The dataset's reasoning, from [dataset.md](./dataset.md).
- How a real API would be connected ([ADR 0001](./adr/0001-no-simulated-backend.md)).
- What would come next.
- Where AI was used, and how its output was shaped and reviewed.

## What would come next

- Edit an Application, in a drawer, reusing the creation form.
- A Resource details view showing owner, tags and region.
- Layouts for smaller screens.
- A New application page that survives a reload.
- A real API for Resources and Applications.
- Graph:
  - Real relationships between Resources, such as a role that can read a bucket, not only membership.
  - Clicking a node to open that Resource's details.
  - A combined view of several Applications that shows the Resources they share.
  - Grouping or colouring nodes by Provider or Environment.
  - A layout engine for larger or hierarchical graphs.
- Pagination or virtualisation once the Resource list is large.
- TypeScript 7, once the linter supports it. This version pins TypeScript 6 so one compiler both type-checks and lints.
