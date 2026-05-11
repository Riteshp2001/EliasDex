/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
  "./app/**/*.{js,ts,jsx,tsx,mdx}", // Folder app router
  "./pages/**/*.{js,ts,jsx,tsx,mdx}", // Kalau masih pake pages
  "./components/**/*.{js,ts,jsx,tsx,mdx}", // Kalau ada folder components
  "./src/**/*.{js,ts,jsx,tsx,mdx}", // << INI PENTING KALAU PAKE SRC!
],
  theme: {
    extend: {
      colors: {
        primary: "#ffdd95",
        secondary: "#f9ed69",
        background: "#242428",
        card: "#2f2f33",
        btnbg: "#3a3a3e",
      },
    },
  },
  plugins: [],
};
