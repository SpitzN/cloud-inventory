import { ThemeProvider } from "next-themes";
import { createBrowserRouter, Navigate } from "react-router";
// The DOM build, which carries out a navigation's `flushSync` option.
import { RouterProvider } from "react-router/dom";
import { NotFoundPage } from "@/app/routes/not-found";
import { ResourcesPage } from "@/app/routes/resources";
import { ErrorScreen } from "@/app/shell/components/error-screen";
import { Shell } from "@/app/shell/components/shell";
import type { RouteHeaderDeclaration } from "@/app/shell/lib/route-header";

const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/resources" replace /> },
  {
    element: <Shell />,
    errorElement: <ErrorScreen />,
    children: [
      {
        // Pathless, so an error replaces only the page content. Without a fallback, a first load
        // of a lazy page renders nothing until it arrives.
        errorElement: <ErrorScreen />,
        HydrateFallback: EmptyContent,
        children: [
          {
            path: "resources",
            element: <ResourcesPage />,
            handle: { title: "Resources" } satisfies RouteHeaderDeclaration,
          },
          {
            path: "applications",
            lazy: {
              Component: async () => (await import("@/app/routes/applications")).ApplicationsPage,
            },
            handle: { title: "Applications" } satisfies RouteHeaderDeclaration,
            // The Applications page renders the drawer; `null`, unlike none, avoids a dev warning.
            children: [{ path: ":id", element: null }],
          },
          {
            path: "applications/new",
            lazy: {
              Component: async () =>
                (await import("@/app/routes/new-application")).NewApplicationPage,
            },
            handle: {
              title: "New application",
              backChevron: true,
            } satisfies RouteHeaderDeclaration,
          },
          {
            path: "*",
            element: <NotFoundPage />,
            handle: { title: "Page not found" } satisfies RouteHeaderDeclaration,
          },
        ],
      },
    ],
  },
]);

function EmptyContent() {
  return null;
}

export function App() {
  return (
    // next-themes' inline script would make React log an error; as a data block it is inert.
    <ThemeProvider
      attribute="class"
      disableTransitionOnChange
      scriptProps={{ type: "application/json" }}
    >
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
