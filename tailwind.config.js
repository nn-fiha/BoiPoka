/** @type {import('tailwindcss').Config} */
// Theme-aware colours come from CSS variables in src/index.css
const themed = (name) => `rgb(var(--color-${name}) / <alpha-value>)`;

export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "Hind Siliguri", "sans-serif"],
        bangla: ["Hind Siliguri", "Poppins", "sans-serif"],
        serif: ["Fraunces", "Hind Siliguri", "serif"],
        display: ["Limelight", "Fraunces", "serif"],
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "fade-out": { from: { opacity: "1" }, to: { opacity: "0" } },
        "pop-in": {
          from: { opacity: "0", transform: "translateY(8px) scale(0.96)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "pop-out": {
          from: { opacity: "1", transform: "translateY(0) scale(1)" },
          to: { opacity: "0", transform: "translateY(8px) scale(0.96)" },
        },
        "sheet-in": { from: { transform: "translateY(100%)" }, to: { transform: "translateY(0)" } },
        "sheet-out": { from: { transform: "translateY(0)" }, to: { transform: "translateY(100%)" } },
      },
      animation: {
        "fade-in": "fade-in 180ms ease-out both",
        "fade-out": "fade-out 160ms ease-in both",
        "pop-in": "pop-in 220ms cubic-bezier(0.16, 1, 0.3, 1) both",
        "pop-out": "pop-out 160ms ease-in both",
        "sheet-in": "sheet-in 280ms cubic-bezier(0.16, 1, 0.3, 1) both",
        "sheet-out": "sheet-out 200ms ease-in both",
      },
      colors: {
        paper: themed("paper"),
        ink: themed("ink"),
        card: themed("card"),
        line: themed("line"),
        // Fixed light text for use on sage and terracotta surfaces in both themes
        cream: "#f7f5ef",
        wood: { light: "#a9774a", DEFAULT: "#8a5a33", dark: "#5e3b1f" },
        sage: { light: "#8fae9b", DEFAULT: "#5f7f6b", dark: "#3f5a4a" },
        terra: { light: "#e08a63", DEFAULT: "#c8643b", dark: "#a94f2b" },
      },
    },
  },
  plugins: [],
};
