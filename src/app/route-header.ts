import { z } from "zod";

const RouteHeaderSchema = z.object({
  title: z.string().min(1),
  backChevron: z.boolean().default(false),
});

/** What a route declares in its `handle` for the shell's header. */
export type RouteHeaderDeclaration = z.input<typeof RouteHeaderSchema>;

/**
 * The header for the matched routes, outermost first: the deepest route that declares a
 * `handle` wins, so a route without one shows its parent's header. Throws when no matched
 * route declares one, or when the deepest declaration does not parse.
 */
export function routeHeader(matches: readonly { handle: unknown }[]) {
  const declared = matches.findLast(({ handle }) => handle !== undefined);
  return RouteHeaderSchema.parse(declared?.handle);
}
