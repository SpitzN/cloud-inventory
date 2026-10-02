# `openIssues` is part of `Resource`

`openIssues` was present in the sample data and in the table requirements, but missing from the first `Resource` interface. As written, the sample did not pass strict TypeScript checks against the interface: `'openIssues' does not exist in type 'Resource'` (TS2353). `openIssues: number` is added to `Resource`, so the type aligns with the sample data and the table requirements.

## Considered options

- **Keep the interface as written and add the count in a second, extended type.** Rejected: the sample carries the count on the Resource itself, and the table lists it among a Resource's attributes, so it is part of the Resource.
- **Keep the counts in a separate lookup by Resource id.** Rejected: it changes the shape of the sample row and adds a join for twelve rows.
- **Silence the compiler** with a type assertion, `any`, an optional field or an index signature. Rejected: each hides the mismatch instead of resolving it.

## Consequences

- The count is required and non-negative. Zero means no open issues.
- This is the one change to the first data model. Every other field of `Resource` and `Application` is as first defined.
