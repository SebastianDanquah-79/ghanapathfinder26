import { useEffect, useState } from "react";
import { Moon, Sun } from "@/lib/icons";

type Theme = "light" | "dark";

const apply = (t: Theme) => {
  document.documentElement.classList.toggle("dark", t === "dark");
  try {
    localStorage.setItem("gpf-theme", t);
  } catch {
    /* storage unavailable */
  }
};

const ThemeToggle = ({ className = "" }: { className?: string }) => {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    apply(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      title={theme === "dark" ? "Light theme" : "Dark theme"}
      className={`grid place-items-center rounded-full text-muted-foreground hover:text-primary hover:bg-secondary transition-colors ${className}`}
    >
      {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
    </button>
  );
};

export default ThemeToggle;
