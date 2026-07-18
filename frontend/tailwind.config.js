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
        // Flat keys with hyphens (status-applied-bg, etc.) so `bg-status-applied-bg`
        // resolves correctly — Tailwind won't reach three levels deep into a nested object.
        "status-applied-bg": "var(--status-applied-bg)",
        "status-applied-text": "var(--status-applied-text)",
        "status-applied-border": "var(--status-applied-border)",
        "status-oa-bg": "var(--status-oa-bg)",
        "status-oa-text": "var(--status-oa-text)",
        "status-oa-border": "var(--status-oa-border)",
        "status-interview-bg": "var(--status-interview-bg)",
        "status-interview-text": "var(--status-interview-text)",
        "status-interview-border": "var(--status-interview-border)",
        "status-offer-bg": "var(--status-offer-bg)",
        "status-offer-text": "var(--status-offer-text)",
        "status-offer-border": "var(--status-offer-border)",
        "status-rejected-bg": "var(--status-rejected-bg)",
        "status-rejected-text": "var(--status-rejected-text)",
        "status-rejected-border": "var(--status-rejected-border)",
        "status-ghosted-bg": "var(--status-ghosted-bg)",
        "status-ghosted-text": "var(--status-ghosted-text)",
        "status-ghosted-border": "var(--status-ghosted-border)",
        "status-withdrawn-bg": "var(--status-withdrawn-bg)",
        "status-withdrawn-text": "var(--status-withdrawn-text)",
        "status-withdrawn-border": "var(--status-withdrawn-border)",
      },
      borderRadius: {
        lg: "var(--radius-lg, 4px)",
        md: "var(--radius-md, 3px)",
        sm: "var(--radius-sm, 2px)",
        xl: "var(--radius-xl, 6px)",
      },
      fontFamily: {
        sans: ["Geist", "Inter", "sans-serif"],
        display: ["Geist", "Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
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
