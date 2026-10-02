# React Flow for the Application graph

The graph of an Application and its Members could be drawn with any graph library or with plain SVG. It is built with React Flow. Pan, zoom and fit-to-view come built in, each node is an ordinary React component, and the author has used the library in production.

## Considered options

- **Plain SVG with a hand-computed ring.** Enough for a hub-and-spoke of at most twelve nodes, and no dependency. Rejected: pan, zoom and fit-to-view would have to be written by hand, and the graph could not grow without a rewrite.

## Consequences

- A sizeable dependency is accepted for a simple graph.
- The same component can later take real relationships between Resources, larger graphs and a layout engine.
