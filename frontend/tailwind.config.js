/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Semantic Application Status Color Configurations
        status: {
          applied: {
            bg: "rgba(30, 58, 138, 0.1)",
            text: "#60a5fa",
            border: "#1d4ed8",
          },
          oa: {
            bg: "rgba(120, 53, 15, 0.1)",
            text: "#fbbf24",
            border: "#b45309",
          },
          interview: {
            bg: "rgba(76, 29, 149, 0.1)",
            text: "#a78bfa",
            border: "#7c3aed",
          },
          offer: {
            bg: "rgba(6, 78, 59, 0.1)",
            text: "#34d399",
            border: "#047857",
          },
          rejected: {
            bg: "rgba(136, 19, 55, 0.1)",
            text: "#f43f5e",
            border: "#be123c",
          },
          ghosted: {
            bg: "rgba(30, 41, 59, 0.1)",
            text: "#94a3b8",
            border: "#334155",
          },
          withdrawn: {
            bg: "rgba(39, 39, 42, 0.1)",
            text: "#a1a1aa",
            border: "#3f3f46",
          },
        },
      },
      borderRadius: {
        lg: "var(--radius-lg, 12px)",
        md: "var(--radius-md, 8px)",
        sm: "var(--radius-sm, 4px)",
        xl: "var(--radius-xl, 16px)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Outfit", "system-ui", "sans-serif"],
      },
      keyframes: {
        "status-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: ".4" },
        },
      },
      animation: {
        "pulse-slow": "status-pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
}
