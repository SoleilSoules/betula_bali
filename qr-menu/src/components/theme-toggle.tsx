"use client";

import { useEffect, useState } from "react";

// Auto-switches the page to an "evening" theme after 18:00 (and back
// in the morning), plus an unobtrusive manual toggle in the bottom
// corner for testing. Manual choice is persisted in localStorage and
// trumps the auto rule.
//
// Theming is driven by a single `data-theme` attribute on <html>;
// globals.css contains the actual color overrides.
export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const apply = () => {
      const override = window.localStorage.getItem("theme-override");
      const h = new Date().getHours();
      const autoDark = h >= 18 || h < 6;
      const next: "light" | "dark" =
        override === "dark" ? "dark" : override === "light" ? "light" : autoDark ? "dark" : "light";
      setTheme(next);
      document.documentElement.setAttribute("data-theme", next);
    };
    apply();
    const id = window.setInterval(apply, 60_000);
    return () => window.clearInterval(id);
  }, []);

  function toggle() {
    const h = new Date().getHours();
    const autoDark = h >= 18 || h < 6;
    const next = theme === "dark" ? "light" : "dark";
    if ((next === "dark") === autoDark) {
      window.localStorage.removeItem("theme-override");
    } else {
      window.localStorage.setItem("theme-override", next);
    }
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      title={`Theme: ${theme} (auto after 18:00)`}
      className="inline-flex items-center justify-center align-middle"
      style={{
        width: 22,
        height: 22,
        borderRadius: "50%",
        background:
          theme === "dark"
            ? "rgba(247,242,232,0.85)"
            : "rgba(23,15,19,0.10)",
        color: "#170f13",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        fontSize: 12,
        lineHeight: 1,
        fontFamily: "var(--font-hero), system-ui, sans-serif",
        cursor: "pointer",
      }}
    >
      {theme === "dark" ? "☾" : "◐"}
    </button>
  );
}
