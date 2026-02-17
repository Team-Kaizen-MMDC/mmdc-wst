/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./file.html", // Assuming this is also an HTML file
    "./pages/**/*.html", // Scan all HTML files in the pages directory and its subdirectories
    "./assets/js/**/*.js", // Scan JavaScript files for dynamic class names
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}