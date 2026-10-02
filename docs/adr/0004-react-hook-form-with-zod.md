# React Hook Form with Zod for forms

The form that creates an Application has three fields; plain component state and one `validate` function would be enough. It uses React Hook Form with the Zod resolver. One schema is both the validation and the form's type, which follows the project-wide rule that types are built by construction and derived from schemas. The author has used both in production.

## Considered options

- **Plain state and a `validate` function.** Two fewer dependencies. Rejected: the form's type and its rules would be written twice and could drift apart.

## Consequences

- The same form component can be reused when editing an Application is added.
- Rules that depend on other data, such as an Application's name being unique, are expressed by building the schema from that data.
