# TanStack Table for the Resources table

The Resources table holds twelve rows, and its search, filters, sorting and selection could be written as a few pure functions. It uses TanStack Table instead. The library is headless and fully controlled: filters and sort are read from the address, the Selection from a store, and the table owns no state of its own. The author has used it in production.

## Considered options

- **Hand-written pure functions.** Less code to explain at twelve rows. Rejected: a real inventory is thousands of Resources, and the table logic would be rewritten on the way there.

## Consequences

- A dependency whose power is not needed at this size.
- The markup stays the project's own, so the look of the table is not tied to the library.
