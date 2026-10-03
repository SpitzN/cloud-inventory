import { ThemeProvider } from "next-themes";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import { ErrorScreen } from "@/app/error-screen";
import { NotFoundPage } from "@/app/not-found-page";
import type { RouteHeaderDeclaration } from "@/app/route-header";
import { Shell } from "@/app/shell";
import { ApplicationDrawer } from "@/features/applications/application-drawer";
import { ApplicationsPage } from "@/features/applications/applications-page";
import { NewApplicationPage } from "@/features/applications/new-application-page";
import { ResourcesPage } from "@/features/resources/resources-page";

const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/resources" replace /> },
  {
    element: <Shell />,
    children: [
      {
        // Pathless, so an error replaces only the page content and the shell stays.
        errorElement: <ErrorScreen />,
        children: [
          {
            path: "resources",
            element: <ResourcesPage />,
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
