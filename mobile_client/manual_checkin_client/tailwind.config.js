/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        errorRed: "#FF0D10",
      },
      textshadow: {
        customshadow: "2px 2px 6px rgba(1, 1, 1, 0.75)",
      },
    },
  },
  plugins: [],
};
