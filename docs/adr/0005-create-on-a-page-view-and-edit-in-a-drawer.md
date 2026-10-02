# Create on a page; view and edit in a drawer

Creating an Application happens on its own page, `/applications/new`. Viewing an Application, and later editing one, happens in a drawer over the Applications page, so the user is not taken out of the list they were looking at. The drawer has its own route, `/applications/:id`, so it survives a reload, can be linked to, and closes with Back.

## Considered options

- **A full page for viewing an Application.** Rejected: the view is a graph and a short table of Members, and a drawer shows both without a page of its own.
- **Creating in a drawer or dialog over the Resources table.** Rejected: creation is a task in its own right and gets its own page. The page also gives the form and the live graph preview room side by side.

## Consequences

- Creation leaves the Resources page, so the Selection has to outlive that page. It is held outside the page's own state.
- The form does not know it is on a page, so editing can place it in a drawer.
