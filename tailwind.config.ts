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
        // Pink & Gold Palette
        pink: {
          50: "#FFF0F5", // Lavender Blush
          100: "#FDE2E4", // Piggy Pink
          200: "#FAD2E1", // Mimi Pink
          300: "#FFC8DD", // Carnation Pink
          400: "#FFAFCC", // Uranian Blue (actually pink)
          500: "#FF8FA3", // Baker-Miller Pink
        },
        gold: {
          50: "#FFF8E7", // Cosmic Latte
          100: "#FFF1E6", // Linen
          200: "#FDE4CF", // Bisque
          300: "#FAD2E1", // Deep Champagne (Adjusted to match pinkish gold)
          400: "#E2B065", // Earth Yellow (Soft Gold)
          500: "#D4A373", // Muted Gold
        },
        cream: "#FAFAF5",
        charcoal: "#4A4E69",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      backgroundImage: {
        'batik-pattern': "url('/patterns/batik-subtle.png')",
        'songket-gradient': "linear-gradient(135deg, #E2B065 0%, #D4A373 100%)",
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
