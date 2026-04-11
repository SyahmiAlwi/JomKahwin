import type { Config } from "tailwindcss";

const config: Config = {
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
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        // Rose palette
        rose: {
          50: "#FFF1F4",
          100: "#FFE0E7",
          200: "#FFC0CF",
          300: "#FF91A8",
          400: "#E8697F",
          500: "#C95A78",
          600: "#A8405C",
          700: "#8C2E47",
          800: "#6E2038",
          900: "#4A1227",
        },
        // Champagne/gold palette
        champagne: {
          50: "#FDF7EE",
          100: "#FAF0DC",
          200: "#F5DFB5",
          300: "#EDCA85",
          400: "#E0A060",
          500: "#C08040",
          600: "#A06030",
          700: "#7D4820",
          800: "#5A3018",
          900: "#3A1E10",
        },
        // Ivory palette
        ivory: {
          50: "#FDFCFB",
          100: "#FAF6F1",
          200: "#F5ECE3",
          300: "#EFE1D4",
          400: "#E5D2C0",
          500: "#D8BFAA",
        },
        // Keep for backwards compatibility
        cream: "#FAF6F1",
        charcoal: "#2E1A35",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      backgroundImage: {
        "batik-pattern": "url('/patterns/batik-subtle.png')",
        "rose-gradient": "linear-gradient(135deg, #C95A78 0%, #E87A95 100%)",
        "gold-gradient": "linear-gradient(135deg, #C08040 0%, #E0A060 100%)",
        "dark-gradient": "linear-gradient(160deg, #1A0818 0%, #2D1030 100%)",
        "hero-gradient": "linear-gradient(135deg, #C95A78 0%, #C08040 100%)",
      },
      boxShadow: {
        "rose-sm": "0 2px 12px rgba(201, 90, 120, 0.15)",
        "rose-md": "0 4px 24px rgba(201, 90, 120, 0.20)",
        "rose-lg": "0 8px 40px rgba(201, 90, 120, 0.25)",
        "gold-sm": "0 2px 12px rgba(192, 128, 64, 0.15)",
        "dark-lg": "0 16px 60px rgba(0, 0, 0, 0.4)",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        shimmer: "shimmer 1.8s infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
