/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0F1217",
          900: "#14181F",
          800: "#1B212B",
          700: "#232A36",
          600: "#2C3442",
          500: "#3A4456",
          400: "#5B6678",
        },
        mist: {
          400: "#8B93A7",
          200: "#C7CCDA",
          100: "#ECEFF4",
        },
        coral: {
          400: "#FF9466",
          500: "#FF7A59",
          600: "#F0613D",
          700: "#D14F2E",
        },
        leaf: {
          400: "#4ADE9B",
          500: "#34D399",
        },
      },
      fontFamily: {
        display: ["Outfit", "sans-serif"],
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        soft: "0 8px 24px -8px rgba(0,0,0,0.35)",
        glow: "0 0 0 1px rgba(255,122,89,0.25), 0 8px 24px -6px rgba(255,122,89,0.25)",
      },
      borderRadius: {
        bubble: "1.1rem",
      },
      keyframes: {
        "pulse-dot": {
          "0%, 80%, 100%": { transform: "scale(0.6)", opacity: "0.4" },
          "40%": { transform: "scale(1)", opacity: "1" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          "0%": { opacity: "0", transform: "translateX(-8px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
      animation: {
        "pulse-dot": "pulse-dot 1.3s infinite ease-in-out both",
        "fade-in-up": "fade-in-up 0.25s ease-out",
        "slide-in": "slide-in 0.2s ease-out",
      },
    },
  },
  plugins: [],
}
