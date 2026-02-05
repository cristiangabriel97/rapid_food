/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",      // <--- IMPORTANTE: Agregamos /app/
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}", // <--- IMPORTANTE: Agregamos /components/
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
};