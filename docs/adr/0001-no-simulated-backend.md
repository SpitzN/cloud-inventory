# No simulated backend: Resources and Applications are held in the client

There is no backend: state is held in the client. Resources are a static, typed module and Applications live in a client store (Zustand) saved to localStorage; both are read synchronously. They are not wrapped in a fake asynchronous API, even though both are server-owned data in the real product. The pending and error states that would add could only be seen through artificial latency, which slows the UI without adding anything the product needs.

## Considered options

- **A fake async API with TanStack Query.** Rejected. It models the real product's server state and would make wiring a real endpoint a small change, but it rebuilds the shape of a backend where there is none, and adds loading and error states to every screen for data that is already in memory.
- **Async calls inside the client store.** Rejected. It rebuilds by hand the caching, pending and error handling that a query library exists to provide.

## Consequences

Connecting a real API is a known migration, not a swap:

- Resources and Applications move to a server-state library: a query for each list, mutations for create and delete.
- Every screen that reads them gains a pending state and an error state.
- The rule that an Application's name is unique becomes a server rejection mapped to a field error.
- The existing Zod schemas parse the responses at the new boundary.
- The Selection, the table state in the address, the form draft and the theme stay where they are. They are client state in the real product too.
