import { useEffect, useState } from "react";
import { Sun, Moon, Palette, Monitor } from "lucide-react";
type Theme = "light" | "warm" | "dark" | "system";
export function applyTheme(value: Theme) {
  const effective =
    value === "system"
      ? matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : value;
  document.documentElement.dataset.theme = effective;
  document.documentElement.style.colorScheme =
    effective === "dark" ? "dark" : "light";
}
export function ThemePicker() {
  const [value, setValue] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem("kutarya-theme");
      return ["light", "warm", "dark", "system"].includes(saved || "")
        ? (saved as Theme)
        : "light";
    } catch {
      return "light";
    }
  });
  useEffect(() => {
    applyTheme(value);
    try {
      localStorage.setItem("kutarya-theme", value);
    } catch {
      /* Özel tarayıcı modu tema kullanımını engellemez. */
    }
    const query = matchMedia("(prefers-color-scheme: dark)");
    const update = () => {
      if (value === "system") applyTheme(value);
    };
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [value]);
  const Icon =
    value === "dark"
      ? Moon
      : value === "warm"
        ? Palette
        : value === "system"
          ? Monitor
          : Sun;
  return (
    <label className="theme-picker">
      <Icon size={17} />
      <select
        aria-label="Görünüm teması"
        value={value}
        onChange={(e) => setValue(e.target.value as Theme)}
      >
        <option value="light">Açık</option>
        <option value="warm">Sıcak</option>
        <option value="dark">Koyu</option>
        <option value="system">Sistem</option>
      </select>
    </label>
  );
}
