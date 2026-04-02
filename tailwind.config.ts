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
        green: {
          50: "#F9FCF4", // Very pale green
          100: "#F2F8E7", // Lightest green
          200: "#E5F1CD", // Pale green
          300: "#D9EAB3", // Soft green
          400: "#D9EAB3", // Soft green (Repeat to ensure softness)
          500: "#CEE38E", // Pastel Green (The requested soft green)
          600: "#CEE38E", // Force Soft Green
          700: "#CEE38E", // Force Soft Green
          800: "#CEE38E", // Force Soft Green
          900: "#CEE38E", // Force Soft Green
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
        'songket-gradient': "linear-gradient(135deg, #CEE38E 0%, #B4CB77 100%)",
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
