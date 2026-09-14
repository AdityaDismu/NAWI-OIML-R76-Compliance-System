/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#F7F9FB",
        panel: "#FFFFFF",
        border: "#D7E0E8",
        accent: "#1D5F8F",
        govblue: "#1D5F8F",
        govnavy: "#123B5D",
        ink: "#243447",
      },
      boxShadow: {
        institutional: "0 2px 12px rgba(27, 54, 78, 0.07)",
      },
    },
  },
  plugins: [],
};
