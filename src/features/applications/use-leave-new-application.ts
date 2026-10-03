import { useLocation, useNavigate } from "react-router";

/**
 * Leaves the New application page: back to the previous page in Cloud Inventory, or to
 * `/applications` when the page was opened directly. The header's back chevron and the page's
 * Cancel button do the same thing, so both call this.
 */
export function useLeaveNewApplication() {
  const navigate = useNavigate();
  // React Router keys the first location of a visit "default", including when Back returns to it.
  const openedDirectly = useLocation().key === "default";

  return () => {
    if (openedDirectly) {
      void navigate("/applications");
      return;
    }
    void navigate(-1);
  };
}
