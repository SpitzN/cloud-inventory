import { z } from "zod";

const RouteHeaderSchema = z.object({
  title: z.string().min(1),
  backChevron: z.boolean().default(false),
});

export type RouteHeaderDeclaration = z.input<typeof RouteHeaderSchema>;

function declaringMatch<Match extends { handle: unknown }>(matches: readonly Match[]) {
  return matches.findLast(({ handle }) => handle !== undefined);
}

/** The deepest matched route that declares a header wins; throws when none does. */
export function routeHeader(matches: readonly { handle: unknown }[]) {
  return RouteHeaderSchema.parse(declaringMatch(matches)?.handle);
}

export function pageRouteId(matches: readonly { id: string; handle: unknown }[]) {
  return declaringMatch(matches)?.id;
}
