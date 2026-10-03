import { useLocation, useNavigate } from "react-router";

/**
 * Returns a function that goes back one entry, or, when this page was opened directly, replaces it
 * with `fallback`, so Back never returns to a page the user chose to leave.
 */
export function useGoBack(fallback: string) {
  const navigate = useNavigate();
  // React Router keys the first location of a visit "default", including when Back returns to it.
  const openedDirectly = useLocation().key === "default";

  return async () => {
    if (openedDirectly) {
      await navigate(fallback, { replace: true });
      return;
    }
    await navigate(-1);
  };
}
