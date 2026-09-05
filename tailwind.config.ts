import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        canvas: "#0a0b0e",
        surface: {
          1: "#12141a",
          2: "#181b22",
          3: "#212530",
          4: "#2a2f3d",
        },
        hairline: {
          DEFAULT: "#262b36",
          strong: "#353c4b",
          light: "#1e222b",
        },
        pakmec: {
          DEFAULT: "#fe7518",
          hover: "#e56208",
          active: "#cc5202",
          light: "#ff8c3a",
          glow: "rgba(254, 117, 24, 0.18)",
          subtle: "rgba(254, 117, 24, 0.08)",
          charcoal: "#1c1d22",
        },
        ink: {
          DEFAULT: "#f4f5f7",
          muted: "#9ba3af",
          subtle: "#6b7280",
          dark: "#111827",
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", "var(--font-geist-sans)", "Plus Jakarta Sans", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["var(--font-mono)", "var(--font-geist-mono)", "JetBrains Mono", "SF Mono", "Menlo", "monospace"],
      },
      borderRadius: {
        badge: "4px",
        xs: "4px",
        sm: "6px",
        md: "8px",
        lg: "10px",
        xl: "14px",
        "2xl": "18px",
        full: "9999px",
      },
      boxShadow: {
        micro: "0 1px 2px 0 rgba(0, 0, 0, 0.04)",
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.12), 0 1px 2px -1px rgba(0, 0, 0, 0.08)",
        "card-hover": "0 6px 16px -4px rgba(0, 0, 0, 0.2)",
        "elevation-1": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        "elevation-2": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
      }
    },
  },
  plugins: [],
};
export default config;
