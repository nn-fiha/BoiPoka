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
