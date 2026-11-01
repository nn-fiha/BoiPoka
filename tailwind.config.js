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
        // Fixed light text for use on wooden (brown) surfaces in both themes
        cream: "#f7f1e6",
        wood: { light: "#a9774a", DEFAULT: "#8a5a33", dark: "#5e3b1f" },
        sage: "#74a892",
        lilac: { light: "#b9b0f7", DEFAULT: "#8d80ee", dark: "#2b2463" },
      },
    },
  },
  plugins: [],
};
