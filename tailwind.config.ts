import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      fontFamily: {
        sans: [
          "Cairo",
          "Inter",
          "system-ui",
          "sans-serif",
          ...defaultTheme.fontFamily.sans,
        ],
      },
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
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        brand: {
          50: "#e8f4ff",
          100: "#d2eaff",
          200: "#a5d3ff",
          300: "#78bbff",
          400: "#4ba4ff",
          500: "#1f8dff",
          600: "#1160f2",
          700: "#0b3dc2",
          800: "#072888",
          900: "#04164d",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        "brand-gradient": "var(--brand-gradient)",
        "brand-radial": "radial-gradient(circle at 20% 20%, rgba(63, 161, 255, 0.25), transparent 60%)",
        "brand-glow": "radial-gradient(circle at top, rgba(17, 96, 242, 0.35), transparent 60%)",
      },
      boxShadow: {
        "brand-glow": "0 10px 40px rgba(17, 96, 242, 0.2)",
        "brand-soft": "0 4px 20px rgba(15, 59, 255, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
