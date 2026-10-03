import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { IconControl } from "@/app/shell/icon-control";
import { Button } from "@/components/ui/button";

/** Switches between the light and dark themes. Until it is used, the theme follows the system. */
export function ThemeSwitch() {
  const { resolvedTheme, setTheme } = useTheme();
  const next = resolvedTheme === "dark" ? "light" : "dark";

  return (
    <IconControl
      label={`Switch to ${next} theme`}
      render={
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => {
            setTheme(next);
          }}
        />
      }
    >
      {next === "dark" ? <MoonIcon /> : <SunIcon />}
    </IconControl>
  );
}
