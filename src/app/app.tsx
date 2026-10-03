import { ThemeProvider } from "next-themes";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import { ApplicationsPage } from "@/app/routes/applications";
import { NewApplicationPage } from "@/app/routes/new-application";
import { NotFoundPage } from "@/app/routes/not-found";
import { ErrorScreen } from "@/app/shell/components/error-screen";
import { Shell } from "@/app/shell/components/shell";
import type { RouteHeaderDeclaration } from "@/app/shell/lib/route-header";
import { ApplicationDrawer } from "@/features/applications/components/application-drawer";
import { ResourcesTable } from "@/features/resources/components/resources-table";

const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/resources" replace /> },
  {
    element: <Shell />,
    // An error in the shell itself, such as a route header that does not parse, takes the shell
    // with it; the error screen is shown on its own.
    errorElement: <ErrorScreen />,
    children: [
      {
        // Pathless, so an error replaces only the page content and the shell stays.
        errorElement: <ErrorScreen />,
        children: [
          {
            path: "resources",
            element: <ResourcesTable />,
            handle: { title: "Resources" } satisfies RouteHeaderDeclaration,
          },
          {
            path: "applications",
            element: <ApplicationsPage />,
            handle: { title: "Applications" } satisfies RouteHeaderDeclaration,
            // No handle: the drawer keeps the Applications header.
            children: [{ path: ":id", element: <ApplicationDrawer /> }],
          },
          {
            path: "applications/new",
            element: <NewApplicationPage />,
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

export function App() {
  return (
    // React never runs a script rendered on the client, and logs an error for one unless it is a
    // data block. next-themes applies the theme from an effect here, so its inline script is inert.
    <ThemeProvider
      attribute="class"
      disableTransitionOnChange
      scriptProps={{ type: "application/json" }}
    >
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
